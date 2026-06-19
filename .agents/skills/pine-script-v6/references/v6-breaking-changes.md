# v5 → v6 Breaking Changes

## Table of Contents
- [Auto-fixable (Pine Editor converter)](#auto-fixable)
- [Requires Manual Fix](#requires-manual-fix)
- [Behavioral Changes (no error, different result)](#behavioral-changes)

---

## Auto-fixable

Pine Editor can convert most of these automatically via "Manage script > Convert code to v6":

| Change | v5 | v6 Auto-fix |
|--------|-----|-------------|
| `transp` removed | `plot(x, transp=80)` | `plot(x, color=color.new(c,80))` |
| `when` param removed | `strategy.entry(..., when=cond)` | wrapped in `if cond` block |
| Duplicate params | `plot(x, color=a, color=b)` | second removed, warning shown |
| `transp` in bgcolor/fill/plotshape | same | color.new() wrapping |

---

## Requires Manual Fix

### 1. Explicit bool casting
```pine
// v5 — OK
color c = bar_index ? color.green : color.red

// v6 — ERROR: int where bool expected
// Fix:
color c = bool(bar_index) ? color.green : color.red
// Or:
color c = bar_index != 0 ? color.green : color.red
```

### 2. Bool cannot be na
```pine
// v5 — OK: bool has 3 states (true / false / na)
bool isLong = if position > 0
    true
else if position < 0
    false
// (no else → isLong = na in v5)

// v6 — ERROR: na(isLong) invalid; isLong is false when position=0
// Fix: use int for 3-state logic
int direction = if position > 0
    1
else if position < 0
    -1
else
    0
```

### 3. Unique type params cannot be na
```pine
// v5 — OK (na → uses default style)
selectedStyle = switch inputStr
    "Area" => plot.style_area
    // no default → returns na for unmatched strings

// v6 — ERROR: switch must have default for unique types
selectedStyle = switch inputStr
    "Area" => plot.style_area
    => plot.style_line  // required default
```

### 4. History on UDT fields
```pine
// v5 — works (incorrectly)
myObj.field[10]

// v6 — ERROR
// Fix:
(myObj[10]).field
// Or assign first:
float fieldVal = myObj.field
float historic  = fieldVal[10]
```

### 5. History on literals/constants
```pine
// v5 — valid but useless
plot(6[1])
bgcolor(true[10] ? color.orange : na)

// v6 — ERROR
// Fix: just use the literal directly
plot(6)
bgcolor(color.orange)
```

### 6. series offset parameter
```pine
// v5 — warning, uses last value only
plot(close, offset = bar_index / 2)

// v6 — ERROR: series not allowed
// Fix: use const/input value
int fixedOffset = input.int(0, "Offset", minval=-500, maxval=500)
plot(close, offset = fixedOffset)
```

### 7. Mutable var as function length
```pine
// v5 — compiles (erroneously uses value=1 always)
var len = 0
len += 1
plot(ta.ema(close, len))  // only uses len=1

// v6 — ERROR: series int where simple int expected
// Fix: use input or const
int len = input.int(14, "Length")
plot(ta.ema(close, len))
```

### 8. for loop with mutating to_num
```pine
// v5 — to_num evaluated once before loop
for i = 0 to data.queue(close) - 1
    // data.queue() called once

// v6 — to_num re-evaluated every iteration → infinite loop if it grows
// Fix: evaluate outside loop
int boundary = data.queue(close) - 1
for i = 0 to boundary
    // safe
```

### 9. linewidth < 1
```pine
// v5 — OK (renders as 1 anyway)
plot(close, linewidth = 0)

// v6 — ERROR
// Fix:
int lw = input.int(1, "Width", minval=1)
plot(close, linewidth = lw)
```

---

## Behavioral Changes

These cause **no error** but produce **different results** after migration:

| Change | v5 behavior | v6 behavior | Impact |
|--------|-------------|-------------|--------|
| `and`/`or` evaluation | Strict (always evaluates both sides) | Lazy (short-circuit) | Stateful functions (ta.rsi etc.) may not update every bar |
| `request.*()` defaults | Non-dynamic | Dynamic by default | Minor differences in multi-request edge cases |
| `strategy()` margin default | 0% (no margin check) | 100% | More margin calls in backtests |
| `strategy.exit()` relative+absolute | Absolute always wins | Whichever triggers first wins | Different TP/SL execution |
| `timeframe.period` format | `"D"`, `"W"`, `"M"` | `"1D"`, `"1W"`, `"1M"` | String comparisons `== "D"` break |
| Const int division `5/2` | `2` (integer division) | `2.5` (fractional) | Any math relying on integer division of consts |
| `for` loop order trim | Runtime error at 9000 | Oldest trimmed silently | `strategy.closedtrades.entry_price(0)` may return na |
| `color.red` / `.teal` / `.yellow` | Different hex | Updated hex values | Visual appearance changes |
| `label.new()` text color | `color.black` | `color.white` | Labels on dark backgrounds now visible |
| Bool history `[]` on first bar | Returns `na` | Returns `false` | Conditions checking `[1]` on bar 0 differ |

### Lazy evaluation fix pattern
```pine
// ❌ Breaks in v6 — ta.rsi may skip bars
if close > open and ta.rsi(close,14) > 50
    signal := true

// ✅ Fix: extract stateful calls to global scope
float rsiVal = ta.rsi(close, 14)  // always evaluates
if close > open and rsiVal > 50
    signal := true
```

### Timeframe string fix
```pine
// ❌ v5 style
if timeframe.period == "D"

// ✅ v6 style
if timeframe.period == "1D"
// Or use built-in helpers:
if timeframe.isdaily
if timeframe.isweekly
if timeframe.ismonthly
```