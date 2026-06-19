# Debugging — Pine Script v6

## Table of Contents
- [Common Compilation Errors](#common-compilation-errors)
- [Runtime Errors](#runtime-errors)
- [na Handling](#na-handling)
- [Repainting Issues](#repainting-issues)
- [Debug Techniques](#debug-techniques)

---

## Common Compilation Errors

| Error | Cause | Fix |
|-------|-------|-----|
| `Cannot use 'int' where 'bool' is expected` | v6 no implicit int→bool | `bool(bar_index)` |
| `Function 'na' cannot be called with argument of type 'bool'` | v6 bool cannot be na | Remove `na(boolVar)`, use int states |
| `'when' is not a valid parameter` | v6 removed `when` | Wrap in `if` block |
| `'transp' is not a valid parameter` | v6 removed `transp` | `color.new(c, transparency)` |
| `Cannot reference history of a field` | `obj.field[n]` invalid | `(obj[n]).field` |
| `Cannot reference history of a literal` | `true[1]` or `6[3]` | Remove `[]` from literals/constants |
| `Duplicate argument for parameter` | Two args for same param | Remove duplicate |
| `'series int' where 'simple int' is expected` | Mutable var passed as `length` | Use `const` or `input` |
| `offset requires simple int` | Series value as `offset` | Use const/input value |
| `linewidth must be >= 1` | `linewidth=0` or negative | Set `minval=1` on input |
| `switch` without default | Unique type return needs default | Add `=> fallbackValue` |
| `if` without else for unique type | Unique type in if needs else | Add `else` block |

---

## Runtime Errors

| Error | Cause | Fix |
|-------|-------|-----|
| `Index out of bounds` | `array.get(arr, -6)` on size-5 array | Check array size before access |
| `Array is empty` | `array.first()` on empty array | `if arr.size() > 0` guard (v6 lazy eval helps) |
| `Division by zero` | `x / 0` | Guard with `x != 0 ? a / x : na` |
| `Too many drawings` | Exceeded max_lines/labels_count | Increase limit in indicator() or delete old drawings |
| `Script took too long` | Infinite loop or O(n²) in large data | See optimization.md |
| `for loop exceeded iterations` | Dynamic `to_num` grew inside loop (v6) | Assign boundary outside loop |

---

## na Handling

```pine
// Check for na
if na(myVar)
    myVar := 0.0

// nz() — replace na with zero (or custom value)
float safe = nz(myVar, 0.0)
float safe2 = nz(myVar, myVar[1])  // carry forward last known value

// fixnan() — replace na with last non-na value
float filled = ta.valuewhen(not na(close), close, 0)

// v6: bool cannot be na. Use int for 3-state logic:
// -1 = short, 0 = flat, 1 = long
int direction = if strategy.position_size > 0
    1
else if strategy.position_size < 0
    -1
else
    0

// na in series: first bars often return na for windowed functions
// Guard:
float rsi = ta.rsi(close, 14)
if not na(rsi)
    // safe to use rsi

// Plot na to skip drawing on that bar
plot(condition ? value : na, "Conditional")
```

---

## Repainting Issues

Repainting = script shows different results in real-time vs historical replay.

**Causes and fixes:**

```pine
// ❌ REPAINTS — using current bar's unconfirmed values
strategy.entry("Long", strategy.long, when=condition)  // also invalid in v6

// ✅ SAFE — wait for bar confirmation
if condition and barstate.isconfirmed
    strategy.entry("Long", strategy.long)

// ❌ REPAINTS — higher TF data without lookahead offset
float htfClose = request.security("SPY", "1D", close)

// ✅ SAFE — use previous confirmed bar
float htfClose = request.security("SPY", "1D", close[1],
    lookahead=barmerge.lookahead_off)

// ❌ REPAINTS — future bar reference with lookahead_on
float htfClose = request.security("SPY", "1D", close,
    lookahead=barmerge.lookahead_on)  // looks into the future!

// ✅ SAFE — use ta functions that only use confirmed history
bool signal = ta.crossover(ta.sma(close,14), ta.sma(close,28))
// signal on CURRENT bar still repaints if used immediately
// Use signal[1] for confirmed signal
if signal[1]
    strategy.entry("Long", strategy.long)
```

**Check:** If your strategy equity curve looks suspiciously good, suspect repainting.

---

## Debug Techniques

```pine
// 1. plot() for numeric inspection
plot(ta.rsi(close,14), "RSI debug", display=display.data_window)

// 2. label for bar-specific values
if barstate.islastconfirmedhistory
    label.new(bar_index, high,
        "RSI: " + str.tostring(ta.rsi(close,14), "#.##") +
        "\nATR: " + str.tostring(ta.atr(14), "#.####"),
        style=label.style_label_left,
        textcolor=color.white)

// 3. table for running state
var table dbg = table.new(position.bottom_left, 2, 5)
if barstate.islast
    table.cell(dbg, 0, 0, "bar_index", text_color=color.white)
    table.cell(dbg, 1, 0, str.tostring(bar_index))
    table.cell(dbg, 0, 1, "position_size", text_color=color.white)
    table.cell(dbg, 1, 1, str.tostring(strategy.position_size))

// 4. bgcolor to visualize conditions
bgcolor(longCondition ? color.new(color.green,90) : na, title="Long Condition")

// 5. str.tostring() formatting
str.tostring(1234567.89, "#,###.##")   // "1,234,567.89"
str.tostring(0.00134, "#.####")        // "0.0013"
str.tostring(true)                     // "true"

// 6. log.* for Pine Editor console (v6)
log.info("bar_index={0}, rsi={1}", bar_index, ta.rsi(close,14))
log.warning("Position open: {0}", strategy.position_size)
log.error("Unexpected na value")
```