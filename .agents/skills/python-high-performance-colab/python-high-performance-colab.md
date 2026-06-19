# 1. Cài đặt các thư viện cần thiết
!pip install ccxt pandas numpy numba requests

# 2. KHÔNG CẦN XÁC THỰC! Kiến trúc mới sử dụng REST API Serverless
# Bạn không cần tải JSON Key hay đăng nhập Google Account, loại bỏ hoàn toàn lỗi 403.
# Chỉ cần đảm bảo Rule trên Firebase cho 'backtest_jobs' là: allow read, write: if true;

# 3. Code Python Worker - REST API Priority Queue
import ccxt
import pandas as pd
import numpy as np
import numba
import warnings
import time
import requests
import json
import os

warnings.filterwarnings('ignore', category=FutureWarning)

FIREBASE_PROJECT_ID = "crypto68" # <--- SỬA LẠI TÊN PROJECT CỦA BẠN NẾU CẦN

print(f"🔥 Đang cấu hình Worker cho Project: {FIREBASE_PROJECT_ID}...")

# =========================================================================
# ==================== CLOUDINARY CONFIG ==================================
# =========================================================================
CLOUDINARY_CLOUD_NAME = "dmawl71ob"
CLOUDINARY_UPLOAD_PRESET = "Crypto68"

def upload_json_to_cloudinary(data_dict):
    url = f"https://api.cloudinary.com/v1_1/{CLOUDINARY_CLOUD_NAME}/raw/upload"
    json_str = json.dumps(data_dict)
    
    temp_file = "temp_result.json"
    with open(temp_file, "w", encoding="utf-8") as f:
        f.write(json_str)
        
    try:
        with open(temp_file, "rb") as f:
            files = { "file": (f"backtest_result_{int(time.time())}.json", f, "application/json") }
            data = { "upload_preset": CLOUDINARY_UPLOAD_PRESET }
            response = requests.post(url, files=files, data=data)
            
        if response.status_code == 200:
            return response.json().get("secure_url")
        else:
            print("❌ Lỗi Cloudinary:", response.text)
            return None
    except Exception as e:
        print("❌ Lỗi gọi Cloudinary:", e)
        return None
    finally:
        if os.path.exists(temp_file):
            os.remove(temp_file)

# =========================================================================
# ==================== CÁC HÀM NUMBA C-ENGINE (GIỮ NGUYÊN) ================
# =========================================================================

@numba.njit(nogil=True, fastmath=True, cache=True)
def fast_supertrend_backtest(
    high, low, close, factor, period,
    capital, order_size, fee_maker, fee_taker, leverage,
    sl_tp_enabled, sl_pct, tp_pct,
    trailing_enabled, trail_activation, trail_distance,
    trail_tp_enabled, trail_tp_distance
):
    n = len(close)
    alpha = 1.0 / period
    atr = high[0] - low[0]
    
    hl2 = (high[0] + low[0]) / 2.0
    final_upper_prev = hl2 + factor * atr
    final_lower_prev = hl2 - factor * atr
    dir_prev = 1.0
    
    balance = capital
    pos_type = 0 # 0: None, 1: LONG, 2: SHORT
    pos_entry_price = 0.0
    pos_highest = 0.0
    pos_lowest = 0.0
    pos_activated = False
    
    total_trades = 0
    wins = 0
    total_profit = 0.0
    total_loss = 0.0
    max_drawdown = 0.0
    peak = capital
    
    for i in range(1, n):
        close_curr = close[i]
        high_curr = high[i]
        low_curr = low[i]
        
        tr1 = high_curr - low_curr
        tr2 = abs(high_curr - close[i-1])
        tr3 = abs(low_curr - close[i-1])
        tr_curr = max(tr1, max(tr2, tr3))
        atr = alpha * tr_curr + (1.0 - alpha) * atr
        
        hl2_curr = (high_curr + low_curr) / 2.0
        basic_upper = hl2_curr + factor * atr
        basic_lower = hl2_curr - factor * atr
        
        if basic_upper < final_upper_prev or close[i-1] > final_upper_prev:
            final_upper = basic_upper
        else:
            final_upper = final_upper_prev
            
        if basic_lower > final_lower_prev or close[i-1] < final_lower_prev:
            final_lower = basic_lower
        else:
            final_lower = final_lower_prev
            
        if close_curr > final_upper:
            dir_curr = -1.0
        elif close_curr < final_lower:
            dir_curr = 1.0
        else:
            dir_curr = dir_prev
            
        if pos_type != 0:
            closed = False
            pnl_pct = 0.0
            exit_price = 0.0
            
            if pos_type == 1:
                if high_curr > pos_highest: pos_highest = high_curr
                if sl_tp_enabled and sl_pct > 0:
                    sl_price = pos_entry_price * (1.0 - sl_pct / 100.0)
                    if low_curr <= sl_price:
                        exit_price = sl_price; pnl_pct = -sl_pct; closed = True
                if not closed and sl_tp_enabled and tp_pct > 0 and not trail_tp_enabled:
                    tp_price = pos_entry_price * (1.0 + tp_pct / 100.0)
                    if high_curr >= tp_price:
                        exit_price = tp_price; pnl_pct = tp_pct; closed = True
                if not closed and trail_tp_enabled and sl_tp_enabled and tp_pct > 0:
                    activation_price = pos_entry_price * (1.0 + tp_pct / 100.0)
                    if pos_highest >= activation_price:
                        trail_tp_stop_price = pos_highest * (1.0 - trail_tp_distance / 100.0)
                        if low_curr <= trail_tp_stop_price:
                            exit_price = trail_tp_stop_price; pnl_pct = ((exit_price - pos_entry_price) / pos_entry_price) * 100.0; closed = True
                if not closed and trailing_enabled:
                    activation_price = pos_entry_price * (1.0 + trail_activation / 100.0)
                    if pos_highest >= activation_price: pos_activated = True
                    if pos_activated:
                        trail_stop_price = pos_highest * (1.0 - trail_distance / 100.0)
                        if low_curr <= trail_stop_price:
                            exit_price = trail_stop_price; pnl_pct = ((exit_price - pos_entry_price) / pos_entry_price) * 100.0; closed = True
                if not closed and dir_prev == -1.0 and dir_curr == 1.0:
                    exit_price = close_curr; pnl_pct = ((exit_price - pos_entry_price) / pos_entry_price) * 100.0; closed = True
            elif pos_type == 2:
                if low_curr < pos_lowest: pos_lowest = low_curr
                if sl_tp_enabled and sl_pct > 0:
                    sl_price = pos_entry_price * (1.0 + sl_pct / 100.0)
                    if high_curr >= sl_price:
                        exit_price = sl_price; pnl_pct = -sl_pct; closed = True
                if not closed and sl_tp_enabled and tp_pct > 0 and not trail_tp_enabled:
                    tp_price = pos_entry_price * (1.0 - tp_pct / 100.0)
                    if low_curr <= tp_price:
                        exit_price = tp_price; pnl_pct = tp_pct; closed = True
                if not closed and trail_tp_enabled and sl_tp_enabled and tp_pct > 0:
                    activation_price = pos_entry_price * (1.0 - tp_pct / 100.0)
                    if pos_lowest <= activation_price:
                        trail_tp_stop_price = pos_lowest * (1.0 + trail_tp_distance / 100.0)
                        if high_curr >= trail_tp_stop_price:
                            exit_price = trail_tp_stop_price; pnl_pct = ((pos_entry_price - exit_price) / pos_entry_price) * 100.0; closed = True
                if not closed and trailing_enabled:
                    activation_price = pos_entry_price * (1.0 - trail_activation / 100.0)
                    if pos_lowest <= activation_price: pos_activated = True
                    if pos_activated:
                        trail_stop_price = pos_lowest * (1.0 + trail_distance / 100.0)
                        if high_curr >= trail_stop_price:
                            exit_price = trail_stop_price; pnl_pct = ((pos_entry_price - exit_price) / pos_entry_price) * 100.0; closed = True
                if not closed and dir_prev == 1.0 and dir_curr == -1.0:
                    exit_price = close_curr; pnl_pct = ((pos_entry_price - exit_price) / pos_entry_price) * 100.0; closed = True
                    
            if closed:
                fee = (order_size * leverage * (fee_taker / 100.0)) * 2.0
                trade_pnl = (order_size * leverage * (pnl_pct / 100.0)) - fee
                balance += trade_pnl
                total_trades += 1
                if trade_pnl > 0:
                    wins += 1; total_profit += trade_pnl
                else:
                    total_loss += abs(trade_pnl)
                if balance > peak: peak = balance
                dd = ((peak - balance) / peak) * 100.0
                if dd > max_drawdown: max_drawdown = dd
                pos_type = 0
                
        if pos_type == 0:
            if dir_prev == 1.0 and dir_curr == -1.0:
                pos_type = 1; pos_entry_price = close_curr; pos_highest = close_curr; pos_lowest = close_curr; pos_activated = False
            elif dir_prev == -1.0 and dir_curr == 1.0:
                pos_type = 2; pos_entry_price = close_curr; pos_highest = close_curr; pos_lowest = close_curr; pos_activated = False
                
        final_upper_prev = final_upper
        final_lower_prev = final_lower
        dir_prev = dir_curr
                
    win_rate = (wins / total_trades) * 100.0 if total_trades > 0 else 0.0
    profit_factor = total_profit / total_loss if total_loss > 0 else (total_profit if total_profit > 0 else 1.0)
    net_profit_pct = ((balance - capital) / capital) * 100.0
    
    return win_rate, total_trades, profit_factor, net_profit_pct, max_drawdown

@numba.njit(parallel=True, nogil=True, fastmath=True, cache=True)
def fast_grid_search(
    high, low, close, factors, periods, 
    capital, order_size, fee_maker, fee_taker, leverage,
    sl_tp_enabled, sl_pct, tp_pct, trailing_enabled, trail_activation, trail_distance, trail_tp_enabled, trail_tp_distance
):
    n = len(factors)
    res_wr, res_tt, res_pf, res_np, res_mdd = np.zeros(n), np.zeros(n), np.zeros(n), np.zeros(n), np.zeros(n)
    
    for i in numba.prange(n):
        wr, tt, pf, np_pct, mdd = fast_supertrend_backtest(
            high, low, close, factors[i], periods[i],
            capital, order_size, fee_maker, fee_taker, leverage,
            sl_tp_enabled, sl_pct, tp_pct, trailing_enabled, trail_activation, trail_distance, trail_tp_enabled, trail_tp_distance
        )
        res_wr[i], res_tt[i], res_pf[i], res_np[i], res_mdd[i] = wr, tt, pf, np_pct, mdd
        
    return res_wr, res_tt, res_pf, res_np, res_mdd

@numba.njit(nogil=True, fastmath=True, cache=True)
def fast_sl_tp_scanner(
    high, low, close, factor, period,
    capital, order_size, fee_maker, fee_taker, leverage,
    trailing_enabled, trail_activation, trail_distance, trail_tp_enabled, trail_tp_distance,
    sl_tests, tp_tests
):
    best_sl = 0.0
    best_tp = 0.0
    best_pnl_pct = -999999.0
    
    for i in range(len(sl_tests)):
        sl = sl_tests[i]
        for j in range(len(tp_tests)):
            tp = tp_tests[j]
            wr, tt, pf, np_pct, mdd = fast_supertrend_backtest(
                high, low, close, factor, period,
                capital, order_size, fee_maker, fee_taker, leverage,
                True, sl, tp, trailing_enabled, trail_activation, trail_distance, trail_tp_enabled, trail_tp_distance
            )
            if np_pct > best_pnl_pct:
                best_pnl_pct = np_pct; best_sl = sl; best_tp = tp
                
    return best_sl, best_tp, best_pnl_pct


def calculate_supertrend(df, factor, period):
    df = df.copy()
    high, low, close = df['high'], df['low'], df['close']
    tr1 = high - low
    tr2 = (high - close.shift(1)).abs()
    tr3 = (low - close.shift(1)).abs()
    tr = pd.concat([tr1, tr2, tr3], axis=1).max(axis=1)
    atr = tr.ewm(alpha=1/period, adjust=False).mean()
    hl2 = (high + low) / 2
    basic_upper = hl2 + factor * atr
    basic_lower = hl2 - factor * atr
    final_upper, final_lower, direction, supertrend = np.zeros(len(df)), np.zeros(len(df)), np.zeros(len(df)), np.zeros(len(df))
    for i in range(len(df)):
        if i == 0:
            final_upper[i] = basic_upper[i]; final_lower[i] = basic_lower[i]
            direction[i] = 1; supertrend[i] = final_upper[i]
        else:
            final_upper[i] = basic_upper[i] if basic_upper[i] < final_upper[i-1] or close[i-1] > final_upper[i-1] else final_upper[i-1]
            final_lower[i] = basic_lower[i] if basic_lower[i] > final_lower[i-1] or close[i-1] < final_lower[i-1] else final_lower[i-1]
            direction[i] = -1 if close[i] > final_upper[i] else (1 if close[i] < final_lower[i] else direction[i-1])
            supertrend[i] = final_lower[i] if direction[i] == -1 else final_upper[i]
    df['supertrend'] = supertrend
    df['direction'] = direction
    return df

def run_backtest_logic(df, capital, order_size, fee_maker, fee_taker, leverage, sl_tp_enabled, sl_pct, tp_pct, trailing_enabled, trail_activation, trail_distance, trail_tp_enabled, trail_tp_distance):
    balance = capital
    position = None
    trades = []
    
    for i in range(1, len(df)):
        current_time = str(df.index[i])
        close_curr, high_curr, low_curr = df['close'].iloc[i], df['high'].iloc[i], df['low'].iloc[i]
        dir_prev, dir_curr = df['direction'].iloc[i-1], df['direction'].iloc[i]
        
        if position is not None:
            entry_price = position['entry_price']
            pnl_pct = 0.0; closed = False; exit_price = 0.0
            
            if position['type'] == 'LONG':
                if high_curr > position['highest']: position['highest'] = high_curr
                if low_curr < position['lowest']: position['lowest'] = low_curr
                if sl_tp_enabled and sl_pct > 0:
                    sl_price = entry_price * (1 - sl_pct / 100)
                    if low_curr <= sl_price: exit_price = sl_price; pnl_pct = -sl_pct; closed = True
                if not closed and sl_tp_enabled and tp_pct > 0:
                    tp_price = entry_price * (1 + tp_pct / 100)
                    if high_curr >= tp_price: exit_price = tp_price; pnl_pct = tp_pct; closed = True
                if not closed and trailing_enabled:
                    activation_price = entry_price * (1 + trail_activation / 100)
                    if position['highest'] >= activation_price: position['activated'] = True
                    if position['activated']:
                        trail_stop_price = position['highest'] * (1 - trail_distance / 100)
                        if low_curr <= trail_stop_price: exit_price = trail_stop_price; pnl_pct = ((exit_price - entry_price) / entry_price) * 100; closed = True
                if not closed and dir_prev == -1 and dir_curr == 1:
                    exit_price = close_curr; pnl_pct = ((exit_price - entry_price) / entry_price) * 100; closed = True
            elif position['type'] == 'SHORT':
                if low_curr < position['lowest']: position['lowest'] = low_curr
                if high_curr > position['highest']: position['highest'] = high_curr
                if sl_tp_enabled and sl_pct > 0:
                    sl_price = entry_price * (1 + sl_pct / 100)
                    if high_curr >= sl_price: exit_price = sl_price; pnl_pct = -sl_pct; closed = True
                if not closed and sl_tp_enabled and tp_pct > 0:
                    tp_price = entry_price * (1 - tp_pct / 100)
                    if low_curr <= tp_price: exit_price = tp_price; pnl_pct = tp_pct; closed = True
                if not closed and trailing_enabled:
                    activation_price = entry_price * (1 - trail_activation / 100)
                    if position['lowest'] <= activation_price: position['activated'] = True
                    if position['activated']:
                        trail_stop_price = position['lowest'] * (1 + trail_distance / 100)
                        if high_curr >= trail_stop_price: exit_price = trail_stop_price; pnl_pct = ((entry_price - exit_price) / entry_price) * 100; closed = True
                if not closed and dir_prev == 1 and dir_curr == -1:
                    exit_price = close_curr; pnl_pct = ((entry_price - exit_price) / entry_price) * 100; closed = True
            
            if closed:
                fee = (order_size * leverage * (fee_taker/100)) * 2
                trade_pnl = (order_size * leverage * (pnl_pct / 100)) - fee
                balance += trade_pnl
                
                mfe_pct = round(((position['highest'] - entry_price) / entry_price) * 100 if position['type'] == 'LONG' else ((entry_price - position['lowest']) / entry_price) * 100, 2)
                mae_pct = round(((position['lowest'] - entry_price) / entry_price) * 100 if position['type'] == 'LONG' else ((entry_price - position['highest']) / entry_price) * 100, 2)

                trades.append({
                    'id': str(len(trades) + 1), 'side': position['type'],
                    'entryTime': position['entry_time'], 'exitTime': current_time,
                    'entryPrice': round(entry_price, 2), 'exitPrice': round(exit_price, 2),
                    'mfePct': mfe_pct, 'maePct': mae_pct,
                    'pnlPct': round(pnl_pct, 2), 'fee': round(fee, 2), 'pnlUsd': round(trade_pnl, 2)
                })
                position = None
                
        if position is None:
            if dir_prev == 1 and dir_curr == -1:
                position = {'type': 'LONG', 'entry_price': close_curr, 'entry_time': current_time, 'highest': close_curr, 'lowest': close_curr, 'activated': False}
            elif dir_prev == -1 and dir_curr == 1:
                position = {'type': 'SHORT', 'entry_price': close_curr, 'entry_time': current_time, 'highest': close_curr, 'lowest': close_curr, 'activated': False}
                
    if len(trades) == 0: return 0.0, 0, 0.0, 0.0, 0.0, []
        
    wins = [t for t in trades if t['pnlUsd'] > 0]
    losses = [t for t in trades if t['pnlUsd'] <= 0]
    win_rate = (len(wins) / len(trades)) * 100
    total_profit = sum([t['pnlUsd'] for t in wins])
    total_loss = abs(sum([t['pnlUsd'] for t in losses]))
    profit_factor = total_profit / total_loss if total_loss > 0 else (total_profit if total_profit > 0 else 1.0)
    net_profit_pct = ((balance - capital) / capital) * 100
    
    peak = capital
    current_bal = capital
    max_dd = 0.0
    for t in trades:
        current_bal += t['pnlUsd']
        if current_bal > peak: peak = current_bal
        dd = ((peak - current_bal) / peak) * 100 if peak > 0 else 0
        if dd > max_dd: max_dd = dd
            
    return round(win_rate, 2), len(trades), round(profit_factor, 2), round(net_profit_pct, 2), round(max_dd, 2), trades

def fetch_real_candles(symbol, tf, limit, exchange_pref="BINANCE", data_url=None):
    if data_url:
        print(f"[Fetch] Đang tải tĩnh từ {data_url}...")
        try:
            response = requests.get(data_url, timeout=30)
            data = response.json()
            if len(data) > 0 and isinstance(data[0], list):
                # Array Tuple format: [[time, open, high, low, close, volume]]
                df = pd.DataFrame(data, columns=['timestamp', 'open', 'high', 'low', 'close', 'volume'])
            else:
                df = pd.DataFrame(data)
                
            df['timestamp'] = pd.to_datetime(df['timestamp'], unit='ms')
            df.set_index('timestamp', inplace=True)
            print(f"[Fetch] Thành công nạp {len(df)} nến từ file JSON tĩnh!")
            return df
        except Exception as e:
            raise ValueError(f"Dữ liệu tĩnh lỗi: {e}")
            
    # CCXT Fallback
    raise ValueError("Chưa hỗ trợ CCXT từ Server do block IP. Yêu cầu truyền data_url từ Cache.")

# =========================================================================
# ==================== MAIN WORKER LOOP (FIREBASE REST API) ===============
# =========================================================================

# Helper chuyển đổi dữ liệu từ Firestore REST Format sang Python Dict
def parse_firestore_value(val):
    if 'stringValue' in val: return val['stringValue']
    if 'integerValue' in val: return int(val['integerValue'])
    if 'doubleValue' in val: return float(val['doubleValue'])
    if 'booleanValue' in val: return val['booleanValue']
    if 'mapValue' in val: return {k: parse_firestore_value(v) for k,v in val['mapValue'].get('fields', {}).items()}
    if 'arrayValue' in val: return [parse_firestore_value(v) for v in val['arrayValue'].get('values', [])]
    if 'nullValue' in val: return None
    return val

def firestore_to_dict(doc):
    return {k: parse_firestore_value(v) for k,v in doc.get('fields', {}).items()}

# Helper chuyển đổi dữ liệu từ Python Dict sang Firestore REST Format
def dict_to_firestore(val):
    if isinstance(val, str): return {"stringValue": val}
    if isinstance(val, bool): return {"booleanValue": val}
    if isinstance(val, int): return {"integerValue": str(val)}
    if isinstance(val, float): return {"doubleValue": val}
    if isinstance(val, list): return {"arrayValue": {"values": [dict_to_firestore(item) for item in val]}}
    if isinstance(val, dict): return {"mapValue": {"fields": {k: dict_to_firestore(v) for k, v in val.items()}}}
    if val is None: return {"nullValue": None}
    return {"stringValue": str(val)}

def get_pending_job():
    # Lấy toàn bộ document (chỉ giới hạn 100 jobs gần nhất để tăng tốc)
    url = f"https://firestore.googleapis.com/v1/projects/{FIREBASE_PROJECT_ID}/databases/(default)/documents/backtest_jobs?pageSize=100"
    try:
        resp = requests.get(url, timeout=10)
        if resp.status_code != 200:
            return None
            
        data = resp.json()
        documents = data.get('documents', [])
        if not documents: return None
        
        parsed_docs = []
        for d in documents:
            doc_id = d['name'].split('/')[-1]
            fields = firestore_to_dict(d)
            parsed_docs.append({'id': doc_id, 'data': fields})
            
        # Lọc những job đang pending
        pending_jobs = [d for d in parsed_docs if d['data'].get('status') == 'pending']
        if not pending_jobs: return None
        
        # Sắp xếp ưu tiên: isPremium=True lên đầu, sau đó sắp xếp theo createdAt cũ nhất lên trước
        pending_jobs.sort(key=lambda x: (not x['data'].get('isPremium', False), int(x['data'].get('createdAt', 0))))
        return pending_jobs[0]
        
    except Exception as e:
        print("Lỗi get jobs:", e)
        return None

def update_job_status(job_id, update_dict):
    url = f"https://firestore.googleapis.com/v1/projects/{FIREBASE_PROJECT_ID}/databases/(default)/documents/backtest_jobs/{job_id}?"
    
    payload = {"fields": {k: dict_to_firestore(v) for k, v in update_dict.items()}}
    
    # Tạo updateMask parameter cho REST URL
    mask_params = ""
    for k in update_dict.keys():
        mask_params += f"updateMask.fieldPaths={k}&"
        
    full_url = url + mask_params.strip('&')
    try:
        resp = requests.patch(full_url, json=payload, timeout=10)
        if resp.status_code != 200:
            print(f"❌ Lỗi Update Job {job_id}:", resp.text)
    except Exception as e:
        print(f"❌ Lỗi Exception Update Job {job_id}:", e)


def process_job(job_id, data):
    print(f"\n🚀 Bắt đầu xử lý Job: {job_id}")
    params = data.get('params', {})
    
    symbol = params.get('symbol', 'BTCUSDT')
    tf = params.get('tf', '1h')
    candle_limit = int(params.get('candleLimit', 1000))
    exchange_pref = params.get('exchange', 'BINANCE')
    data_url = params.get('dataUrl', None)
    
    paramValues = params.get('paramValues', {})
    factor_val = float(paramValues.get('factor', 2.0))
    period_val = int(paramValues.get('atrLength', 10))
    
    slTpEnabled = True # Luôn check
    slPercent = float(params.get('slPercent', 2.0))
    tpPercent = float(params.get('tpPercent', 4.0))
    capital = float(params.get('capital', 5000))
    orderSize = float(params.get('orderSize', 1000))
    feeMaker = float(params.get('feeMaker', 0.02))
    feeTaker = float(params.get('feeTaker', 0.05))
    leverage = int(params.get('leverage', 1))
    
    trailingEnabled = bool(params.get('trailingEnabled', False))
    trailActivation = float(params.get('trailActivation', 1.0))
    trailDistance = float(params.get('trailDistance', 0.5))
    trailTpEnabled = bool(params.get('trailTpEnabled', False))
    trailTpDistance = float(params.get('trailTpDistance', 1.0))
    
    suggestSlEnd = float(params.get('suggestSlEnd', 20.0))
    suggestTpEnd = float(params.get('suggestTpEnd', 40.0))
    
    df = fetch_real_candles(symbol, tf, candle_limit, exchange_pref, data_url)
    
    high_arr = df['high'].to_numpy(dtype=np.float64)
    low_arr = df['low'].to_numpy(dtype=np.float64)
    close_arr = df['close'].to_numpy(dtype=np.float64)

    estimated_factors = int((factor_val - 0.5) / 0.01) + 1
    estimated_periods = int(period_val - 5) + 1
    expected_configs = estimated_factors * estimated_periods
    factor_step = 0.01 if expected_configs <= 100000 else 0.02
    
    factors_list = [round(f, 2) for f in np.arange(0.5, factor_val + 0.0001, factor_step)]
    periods_list = list(range(5, period_val + 1))
    
    tasks = [(f, p) for f in factors_list for p in periods_list]
    factors_arr = np.array([t[0] for t in tasks], dtype=np.float64)
    periods_arr = np.array([t[1] for t in tasks], dtype=np.int64)
    
    print(f"[Grid Search] Bắt đầu quét {len(tasks)} tổ hợp (Factor step {factor_step}, ATR step 1)...")
    start_time = time.time()
    
    res_wr, res_tt, res_pf, res_np, res_mdd = fast_grid_search(
        high_arr, low_arr, close_arr, factors_arr, periods_arr,
        capital, orderSize, feeMaker, feeTaker, leverage,
        slTpEnabled, slPercent, tpPercent,
        trailingEnabled, trailActivation, trailDistance, trailTpEnabled, trailTpDistance
    )
    
    print(f"[Grid Search] Đã hoàn thành quét {len(tasks)} tổ hợp trong {time.time() - start_time:.3f} giây!")

    grid_results = []
    for i in range(len(tasks)):
        grid_results.append({
            'factor': factors_arr[i], 'period': int(periods_arr[i]),
            'winRate': res_wr[i], 'totalTrades': int(res_tt[i]),
            'profitFactor': res_pf[i], 'netProfit': res_np[i], 'maxDrawdown': res_mdd[i]
        })
    
    if not grid_results:
        grid_results.append({'factor': factor_val, 'period': period_val, 'winRate': 0, 'totalTrades': 0, 'profitFactor': 0, 'netProfit': 0, 'maxDrawdown': 0})
        
    pnl_winner = max(grid_results, key=lambda x: x['netProfit']).copy()
    wr_winner = max([c for c in grid_results if c['totalTrades'] >= 10] or grid_results, key=lambda x: x['winRate']).copy()
    dd_winner = min([c for c in grid_results if c['netProfit'] > 0] or grid_results, key=lambda x: x['maxDrawdown']).copy()
    pf_winner = max([c for c in grid_results if c['netProfit'] > 0] or grid_results, key=lambda x: x['profitFactor']).copy()
    trade_winner = max([c for c in grid_results if c['netProfit'] > 0] or grid_results, key=lambda x: x['totalTrades']).copy()

    pnl_winner['tag'] = 'MAX_PNL'
    wr_winner['tag'] = 'MAX_WINRATE'
    dd_winner['tag'] = 'MIN_DRAWDOWN'
    pf_winner['tag'] = 'MAX_PF'
    trade_winner['tag'] = 'MAX_TRADES'

    unique_top_configs = {}
    for cfg in [pnl_winner, wr_winner, dd_winner, pf_winner, trade_winner]:
        k = f"{cfg['factor']}_{cfg['period']}"
        if k not in unique_top_configs:
            unique_top_configs[k] = cfg
        else:
            if cfg['tag'] not in unique_top_configs[k]['tag']:
                unique_top_configs[k]['tag'] += f", {cfg['tag']}"
            
    final_top_list = sorted(list(unique_top_configs.values()), key=lambda x: x['netProfit'], reverse=True)
    best_cfg = pnl_winner

    top_configs = []
    for idx, cfg in enumerate(final_top_list[:5]):
        top_configs.append({
            'rank': idx + 1, 'factor': cfg['factor'], 'period': cfg['period'],
            'winRate': f"{round(cfg['winRate'], 2)}%", 'totalTrades': cfg['totalTrades'],
            'profitFactor': round(cfg['profitFactor'], 3), 'netProfit': f"{'+' if cfg['netProfit'] >= 0 else ''}{round(cfg['netProfit'], 2)}%",
            'maxDrawdown': f"{round(cfg['maxDrawdown'], 2)}%", 'netProfitNum': round(cfg['netProfit'], 2),
            'tag': cfg.get('tag', '')
        })

    df_target = calculate_supertrend(df, best_cfg['factor'], best_cfg['period'])
    win_rate, total_trades, profit_factor, net_profit, max_drawdown, trades = run_backtest_logic(
        df_target, capital, orderSize, feeMaker, feeTaker, leverage,
        slTpEnabled, slPercent, tpPercent,
        trailingEnabled, trailActivation, trailDistance, trailTpEnabled, trailTpDistance
    )

    sl_start = max(0.2, suggestSlEnd - 19.8)
    tp_start = max(0.2, suggestTpEnd - 39.8)
    sl_tests_arr = np.arange(sl_start, suggestSlEnd + 0.1, 0.2)
    tp_tests_arr = np.arange(tp_start, suggestTpEnd + 0.1, 0.2)
    
    target_high = df_target['high'].to_numpy(dtype=np.float64)
    target_low = df_target['low'].to_numpy(dtype=np.float64)
    target_close = df_target['close'].to_numpy(dtype=np.float64)
    
    best_sl, best_tp, best_pnl_pct = slPercent, tpPercent, net_profit
    
    total_sl_tp_configs = len(sl_tests_arr) * len(tp_tests_arr)
    print(f"[SL/TP Scanner] Bắt đầu quét {total_sl_tp_configs} vòng SL/TP gợi ý...")
    sl_tp_start_time = time.time()
    
    scan_sl, scan_tp, scan_pnl = fast_sl_tp_scanner(
        target_high, target_low, target_close, best_cfg['factor'], best_cfg['period'],
        capital, orderSize, feeMaker, feeTaker, leverage,
        trailingEnabled, trailActivation, trailDistance, trailTpEnabled, trailTpDistance,
        sl_tests_arr, tp_tests_arr
    )
    
    print(f"[SL/TP Scanner] Đã hoàn thành quét {total_sl_tp_configs} vòng trong {time.time() - sl_tp_start_time:.3f} giây!")
    
    if scan_pnl > best_pnl_pct:
        best_sl = round(scan_sl, 1); best_tp = round(scan_tp, 1); best_pnl_pct = scan_pnl
        
    result_data = {
        'total_configs': len(tasks),
        'best_factor': best_cfg['factor'],
        'best_period': best_cfg['period'],
        'top_configs': top_configs,
        'win_rate': win_rate,
        'total_trades': total_trades,
        'profit_factor': profit_factor,
        'net_profit': net_profit,
        'max_drawdown': max_drawdown,
        'best_sl_tp': {
            'sl': best_sl, 'tp': best_tp,
            'pnl': round(capital * (best_pnl_pct / 100), 2),
            'pnl_pct': round(best_pnl_pct, 2)
        },
        'actual_candles': len(df),
        'trades': trades
    }
    
    return result_data

def run_worker():
    print(f"🔥 Bắt đầu quét Firestore Job Queue (Tự động 2s/lần)...")
    while True:
        try:
            job = get_pending_job()
            if job:
                job_id = job['id']
                data = job['data']
                
                # 1. Cập nhật status -> processing
                update_job_status(job_id, {'status': 'processing'})
                
                try:
                    # 2. Xử lý thuật toán
                    result_data = process_job(job_id, data)
                    print(f"[Upload] Xử lý xong Job {job_id}. Đang upload lên Cloudinary...")
                    
                    # 3. Upload file json to Cloudinary
                    cloudinary_url = upload_json_to_cloudinary(result_data)
                    
                    if cloudinary_url:
                        update_job_status(job_id, {
                            'status': 'completed',
                            'resultUrl': cloudinary_url
                        })
                        print(f"[Done!] Job {job_id} hoàn tất! URL: {cloudinary_url}")
                    else:
                        print("⚠️ Cloudinary thất bại. Ghi fallback result vào Firestore...")
                        result_data['trades'] = [] # Xoá bớt cho nhẹ
                        update_job_status(job_id, {
                            'status': 'completed',
                            'result': result_data
                        })
                        
                except Exception as ex:
                    print(f"❌ Job {job_id} xử lý AI lỗi:", ex)
                    update_job_status(job_id, {
                        'status': 'error',
                        'error': str(ex)
                    })
        except Exception as e:
            # Bỏ qua lỗi kết nối nhẹ
            pass
            
        time.sleep(2) # Quét 2 giây 1 lần

# Bắt đầu vòng lặp
run_worker()
