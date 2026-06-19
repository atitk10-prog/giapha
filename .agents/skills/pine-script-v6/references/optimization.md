# Optimization — Pine Script v6

## Table of Contents
- [Limits Reference](#limits-reference)
- [request.*() Optimization](#request-optimization)
- [Calculation Efficiency](#calculation-efficiency)
- [Drawing Object Management](#drawing-object-management)
- [Profiling](#profiling)

---

## Limits Reference

| Resource | Default | Max | Set in |
|----------|---------|-----|--------|
| `max_bars_back` | 500 (indicator) | 5000 | `indicator()` / `strategy()` |
| `max_lines_count` | 50 | 500 | `indicator()` |
| `max_labels_count` | 50 | 500 | `indicator()` |
| `max_boxes_count` | 50 | 500 | `indicator()` |
| `max_polylines_count` | 50 | 100 | `indicator()` |
| `request.*()` calls | — | 40 unique | per script |
| Strategy orders | — | 9000 (trimmed in v6) | — |
| String length | — | 4096 chars | — |
| Array/matrix/map size | — | 100,000 elements | — |
| Script execution time | — | ~3 sec wall clock | — |

---

## request.*() Optimization

```pine
// ✅ ONE request, use multiple return values via tuple
[htfClose, htfVolume, htfRsi] = request.security(
    syminfo.tickerid, "1D",
    [close, volume, ta.rsi(close, 14)]
)

// ❌ THREE separate requests (3x slower, counts as 3 calls)
float htfClose  = request.security(syminfo.tickerid, "1D", close)
float htfVolume = request.security(syminfo.tickerid, "1D", volume)
float htfRsi    = request.security(syminfo.tickerid, "1D", ta.rsi(close, 14))

// ✅ Conditional requests — only request when needed
float htfData = showHTF ? request.security(syminfo.tickerid, "1W", close) : na

// ✅ Dynamic loop requests (v6)
var string[] watchlist = array.from("SPY","QQQ","IWM")
array<float> prices = array.new<float>()
for sym in watchlist
    prices.push(request.security(sym, timeframe.period, close))
// Note: 3 symbols = 3 of your 40 request budget
```

---

## Calculation Efficiency

```pine
// ✅ Cache repeated calculations in variables
float atr14 = ta.atr(14)
float upper = close + 2 * atr14    // reuses atr14
float lower = close - 2 * atr14

// ❌ Recalculates atr three times
float upper = close + 2 * ta.atr(14)
float lower = close - 2 * ta.atr(14)
float mid   = ta.atr(14)

// ✅ Compute only on necessary bars
float expensiveCalc = barstate.islast ? someHeavyCalc() : na

// ✅ Use var for accumulators instead of recomputing history
var float runningSum = 0.0
runningSum += close

// ❌ O(n) per bar = O(n²) total — avoid on large datasets
float manualSma = 0.0
for i = 0 to 99
    manualSma += close[i]
manualSma /= 100
// ✅ Use built-in (optimized internally)
float fastSma = ta.sma(close, 100)

// ✅ Lazy evaluation for expensive branching (v6 feature)
bool expensiveCheck = a and b and heavyCondition()
// If a=false, b and heavyCondition() are NOT evaluated

// ✅ Use arrays for batch operations
var array<float> prices = array.new<float>(100, na)
prices.unshift(close)
if prices.size() > 100
    prices.pop()
float mean = prices.avg()   // built-in, fast
```

---

## Drawing Object Management

```pine
// ✅ Pattern: keep last N drawings, delete old ones
var array<line> lines = array.new<line>()
const int MAX_LINES = 50

if someCondition
    lines.push(line.new(bar_index-1, open, bar_index, close, color=color.blue))
    if lines.size() > MAX_LINES
        line.delete(lines.shift())

// ✅ For single persistent drawing: update instead of recreate
var line trendLine = na
if barstate.isfirst
    trendLine := line.new(bar_index, close, bar_index+1, close, extend=extend.right)
else
    line.set_x2(trendLine, bar_index)
    line.set_y2(trendLine, close)

// ✅ Only update table on last bar — avoid rebuilding every tick
var table t = table.new(position.top_right, 2, 5)
if barstate.islastconfirmedhistory
    table.cell(t, 0, 0, "Metric", text_color=color.gray)
    // ... rest of cells

// ✅ use display= to hide from chart but keep in data window
plot(debugVar, display=display.data_window + display.status_line)
```

---

## Profiling

Pine v6 has a built-in profiler (Pine Editor → "Profile" button):

```pine
// Profiling-friendly code structure:
// 1. Group expensive ops so profiler can isolate them
// 2. Test with max_bars_back = required minimum
// 3. Check "Execution time" in Script Properties

// max_bars_back optimization: set only what you need
// Every [] reference requires Pine to store that many bars
// If you use close[500], set max_bars_back=500 (not 5000)

// Reduce unnecessary series storage with var
var float storedVal = na  // stored once, updated
float tempVal = close * 1.001  // recomputed per bar, not stored in history unless []'d

// Avoid deeply nested loops
// O(n²) example to fix:
// for i = 0 to bars
//   for j = 0 to bars  ← dangerous
//
// Refactor with running accumulators or built-in functions
```

**Quick wins checklist:**
- [ ] Tuple requests: one `request.security()` with `[a, b, c]` instead of three calls
- [ ] Cache `ta.atr()`, `ta.rsi()`, etc. in variables if used multiple times
- [ ] Use built-in `ta.*` over manual loops for SMA/EMA/etc.
- [ ] Delete drawing objects when no longer needed
- [ ] Move table updates to `barstate.islastconfirmedhistory` only
- [ ] Set `max_bars_back` to minimum needed, not maximum
- [ ] Use `display=display.data_window` for debug plots (no chart rendering)