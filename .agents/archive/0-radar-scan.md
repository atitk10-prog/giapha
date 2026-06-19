---
description: Automated Trading Setup Scanner using TradingView MCP
---

# MASTER TASK FOR ANTIGRAVITY AGENT: Trading Setup Scanner

Analyze the trading setup for the target `[SYMBOL]` using the TradingView MCP tools. Follow this orchestration workflow strictly.

**Important Context & Constraints:**
- **TV Free Account Limit:** Do người dùng sử dụng tài khoản TradingView Free (tối đa 2 indicator cùng lúc), agent phải thêm tối đa 2 indicator, đọc số liệu, sau đó xóa/ẩn bớt rồi mới mở các indicator tiếp theo.
- **Lưu Kết Quả:** Kết quả cuối cùng phải được trình bày rõ ràng (có xuống hàng hợp lý) và lưu vào thư mục `KQ-Radar` bằng file Markdown theo cấu trúc tên `[SYMBOL]-ddmm-hhmm.md` (ví dụ: `SOLUSDT-3005-2115.md`). File markdown nên bao gồm phần giải thích dễ đọc và kèm theo khối dữ liệu JSON thô ở cuối.
- **Ngôn ngữ:** Các trường giải thích như `reasoning`, `reasoning_summary`, và `invalidation` bắt buộc phải được viết bằng Tiếng Việt.

## Step 0 — Setup Environment
**Task:** Tự động mở TradingView Desktop với cờ Debug để kết nối MCP.
Hãy chạy lệnh sau ở chế độ nền (background task) trước khi tiến hành phân tích:
```powershell
Start-Process -FilePath "C:\Program Files\WindowsApps\TradingView.Desktop_3.1.0.7818_x64__n534cwy3pjxzj\TradingView.exe" -ArgumentList "--remote-debugging-port=9222"
```
Đợi khoảng 5-10 giây để TradingView khởi động hoàn toàn.

## Step 1 — HTF Analysis
**Task:** Execute the following prompt for HTF bias.

> You are the HTF Bias Agent. Your only job is to determine the
> 1H directional bias for the given symbol using TradingView MCP.
> 
> Symbol: [SYMBOL]
> 
> Execute this exact sequence:
> 1. tv_health_check
> 2. chart_set_symbol("[SYMBOL]")
> 3. chart_set_resolution("60")
> 4. data_get_ohlcv(count=100)
> 5. data_get_study_values → read EMA20, EMA50, EMA200, RSI14, MACD
> 6. data_get_pine_lines → extract key levels
> 7. quote_get
> 
> Analyze and return ONLY this JSON (no other text):
> {
>   "symbol": "",
>   "bias": "bullish|bearish|neutral",
>   "strength": "strong|moderate|weak",
>   "market_structure": "uptrend|downtrend|ranging",
>   "last_bos_price": 0.0,
>   "equilibrium": 0.0,
>   "premium_top": 0.0,
>   "discount_bottom": 0.0,
>   "key_levels": [],
>   "ema_stack": "bullish|bearish|mixed",
>   "rsi_1h": 0.0,
>   "macd": "bullish|bearish|neutral",
>   "current_price": 0.0,
>   "price_zone": "premium|discount|equilibrium",
>   "proceed_to_ltf": true
> }
> 
> Set proceed_to_ltf=false if bias is neutral or strength is weak.

---

## Step 2 — LTF Entry Finder
**Condition:** Wait for Step 1 result. ONLY proceed if `proceed_to_ltf` is `true`.
**Task:** Execute the following prompt, injecting the JSON output from Step 1.

> You are the LTF Entry Agent. HTF analysis has been completed.
> Use the 1H context below to find a precise 5m entry.
> 
> HTF CONTEXT FROM AGENT 1:
> [INJECT AGENT 1 JSON OUTPUT HERE]
> 
> Execute this exact sequence on 5m chart:
> 1. chart_set_resolution("5")
> 2. data_get_ohlcv(count=50)
> 3. data_get_study_values → read RSI14, EMA20
> 4. data_get_pine_labels → check for signal labels
> 5. data_get_pine_lines → nearest OB, FVG levels
> 6. quote_get → precise entry price
> 7. capture_screenshot
> 
> Rules:
> - Only look for entries ALIGNED with 1H bias
> - Long only if bias=bullish AND price in discount zone
> - Short only if bias=bearish AND price in premium zone
> - Entry trigger: 5m BOS/CHoCH + OB or FVG retest
> - Minimum RR: 2.0 | Minimum confidence: 65
> 
> Return ONLY this JSON:
> {
>   "entry_found": true,
>   "direction": "long|short",
>   "trigger": "describe 5m trigger",
>   "entry": 0.0,
>   "sl": 0.0,
>   "tp1": 0.0,
>   "tp2": 0.0,
>   "rr": 0.0,
>   "ob_zone": [0.0, 0.0],
>   "fvg_zone": [0.0, 0.0],
>   "rsi_5m": 0.0,
>   "ema20_5m": 0.0,
>   "confidence": 0,
>   "reasoning": "",
>   "invalidation": "",
>   "wait": false
> }

---

## Step 3 — Risk Consolidator & Reporter
**Task:** Execute the following prompt, injecting both previous outputs.

> You are the Risk & Report Agent. Consolidate analysis from two agents
> and produce the final trade report.
> 
> AGENT 1 OUTPUT (HTF):
> [INJECT AGENT 1 JSON]
> 
> AGENT 2 OUTPUT (LTF):
> [INJECT AGENT 2 JSON]
> 
> Tasks:
> 1. Validate consistency between HTF and LTF analysis
> 2. Check: does entry align with HTF bias?
> 3. Check: is entry in correct price zone (discount=long, premium=short)?
> 4. Check: RR >= 2.0 and confidence >= 65?
> 5. Calculate position size suggestion (use 1% risk per trade as default)
> 
> Return final report:
> {
>   "final_verdict": "ENTER|WAIT|CONFLICT",
>   "conflict_reason": "",
>   "symbol": "",
>   "direction": "long|short",
>   "entry": 0.0,
>   "sl": 0.0,
>   "tp1": 0.0,
>   "tp2": 0.0,
>   "rr": 0.0,
>   "confidence": 0,
>   "suggested_risk_percent": 1.0,
>   "htf_bias": "",
>   "ltf_trigger": "",
>   "reasoning_summary": "",
>   "invalidation": "",
>   "action_required": "Manual review → execute if agreed"
> }
> 
> If CONFLICT: explain what's inconsistent.
> If WAIT: explain what condition needs to be met.

---
**FINAL DELIVERABLE:** 
1. Deliver the final JSON report from Step 3 to the user.
2. Viết một báo cáo dễ đọc và lưu file kết quả vào thư mục `KQ-Radar` với định dạng tên `[SYMBOL]-ddmm-hhmm.md`. Mọi thư mục chưa tồn tại cần được tạo tự động.
