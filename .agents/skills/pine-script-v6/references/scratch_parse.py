import re
import json

files = [
    ('c:\\Users\\nqcuo.DESKTOP-R5VV3K7\\OneDrive\\Máy tính\\Research\\.agents\\antigravity-awesome-skills\\skills\\pine-script-v6\\references\\pop-indicators.md', 'Indicator'),
    ('c:\\Users\\nqcuo.DESKTOP-R5VV3K7\\OneDrive\\Máy tính\\Research\\.agents\\antigravity-awesome-skills\\skills\\pine-script-v6\\references\\pop-strategies.md', 'Strategy')
]

categories = {
    "Moving Averages & Trend": ["MovingAvg", "MA ", " SMA", " EMA", "Supertrend", "Trend", "Aroon", "Bollinger", "BBTrend", "MACD", "Chande", "Parabolic SAR", "ZigZag", "Pitchfork", "Envelope", "Ichimoku", "Directional", "ADX", "DMI"],
    "Oscillators & Momentum": ["Oscillator", "RSI", "Stoch", "MACD", "Momentum", "CCI", "Awesome", "BOP", "Balance of Power", "SMI", "Klinger", "TRIX", "Williams", "Ultimate", "ROC"],
    "Volume & Order Flow": ["Volume", "OBV", "Delta", "MFI", "Money Flow", "VWAP", "Accumulation", "Chaikin", "EOM"],
    "Volatility & Ranges": ["Bollinger", "ATR", "True Range", "Keltner", "Donchian", "Band", "Channel"],
    "Price Action & Support/Resistance": ["Pivot", "Fib", "Inside Bar", "Outside Bar", "Fractal", "High/Low"],
}

def get_category(name, type_):
    if type_ == 'Strategy':
        return 'Trading Strategies'
        
    name_upper = name.upper()
    best_cat = "Other Indicators"
    for cat, kws in categories.items():
        for kw in kws:
            if kw.upper() in name_upper:
                return cat
    return best_cat

md_content = "# Pine Script v6 - Official TradingView References Catalog\n\nThis catalog contains all the official TradingView indicators and strategies provided in `pop-indicators.md` and `pop-strategies.md`.\n\n"

results = {}

for file_path, ftype in files:
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            content = f.read()
            
            if ftype == 'Indicator':
                matches = re.findall(r'indicator\s*\((?:[^)]*?title\s*=\s*([\"\'\’])(.*?)\1|([\"\'\’])(.*?)\3)', content)
            else:
                matches = re.findall(r'strategy\s*\((?:[^)]*?title\s*=\s*([\"\'\’])(.*?)\1|([\"\'\’])(.*?)\3)', content)
                
            for m in matches:
                title = m[1] if m[1] else m[3]
                if title:
                    cat = get_category(title, ftype)
                    if cat not in results:
                        results[cat] = []
                    results[cat].append(title)
    except Exception as e:
        print(f'Error reading {file_path}: {e}')

for cat in sorted(results.keys()):
    md_content += f"## {cat}\n"
    for item in sorted(list(set(results[cat]))):
        md_content += f"- {item}\n"
    md_content += "\n"

out_path = 'c:\\Users\\nqcuo.DESKTOP-R5VV3K7\\OneDrive\\Máy tính\\Research\\.agents\\antigravity-awesome-skills\\skills\\pine-script-v6\\references\\CATALOG.md'
with open(out_path, 'w', encoding='utf-8') as f:
    f.write(md_content)
    
print("Successfully created CATALOG.md")
