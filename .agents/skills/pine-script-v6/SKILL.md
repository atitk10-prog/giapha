---
name: pine-script-v6
description: Write, debug, and optimize Pine Script v6 for TradingView. Use when creating indicators, strategies (backtest), or libraries in Pine Script v6; debugging compilation/runtime errors; optimizing script performance; migrating from v5 to v6; working with request.*() dynamic requests, strategy.*() functions, UDT objects, arrays/matrices/maps, alerts, timeframes, or visuals (plot, label, line, table). Triggers on: pine script, pinescript, tradingview script, indicator, strategy backtest, ta.*, request.security, strategy.entry, strategy.exit, plot(), label.new, ta.rsi, ta.ema, ta.sma, ta.crossover, barstate, bar_index, timeframe, repainting, UDT, user-defined type, array<>, matrix<>, map<>, var, varip, series, simple, input, const, na, nz, alert, alertcondition.
---

# Pine Script v6 — Advanced Guide

## Skill Overview

Covers 4 task types for advanced users (Pine v5+ background assumed):
1. **Writing indicators** — See [indicators.md](references/indicators.md) (and check [CATALOG.md](references/CATALOG.md) for official base codes)
2. **Writing strategies** — See [strategies.md](references/strategies.md) (and check [CATALOG.md](references/CATALOG.md) for official base codes)
3. **Debugging errors** — See [debugging.md](references/debugging.md)
4. **Optimizing performance** — See [optimization.md](references/optimization.md)

Read the relevant reference file(s) before responding. For v5→v6 migration issues, always check [v6-breaking-changes.md](references/v6-breaking-changes.md) first.

---

## Script Structure (v6 required)

```pine
//@version=6
indicator("My Indicator", overlay=true, max_bars_back=500)
// OR
strategy("My Strategy", overlay=true, margin_long=100, margin_short=100)
// OR
library("MyLib", overlay=true)
```

**Declaration order:** version annotation → declaration statement → inputs → calculations → visuals/orders → alerts.

---

## Type System Quick Reference

| Qualifier | When set | Modifiable | Example |
|-----------|----------|------------|---------|
| `const` | Compile time | ❌ | `14` |
| `input` | Script load | ❌ | `input.int(14)` |
| `simple` | Bar 0, fixed | ❌ | `syminfo.ticker` |
| `series` | Each bar | ✅ | `close`, `bar_index` |

**v6 strict casting:** `int`/`float` → `bool` now requires explicit `bool(value)`. Bool can no longer be `na`.

---

## v6 Key Changes (Critical)

- **No implicit int→bool:** Use `bool(bar_index)` not bare `bar_index` in conditions
- **Bool cannot be na:** Three-state bool logic must use `int` (-1/0/1)
- **Dynamic requests ON by default:** `request.*()` works inside loops/conditionals
- **`when` param removed:** Use `if condition \n strategy.entry(...)` instead
- **`transp` param removed:** Use `color.new(myColor, 80)` instead
- **`for` loop `to_num` is dynamic:** Assign boundary to variable outside loop if it mutates
- **`timeframe.period` always has multiplier:** `"D"` → `"1D"`, `"W"` → `"1W"`
- **`[]` on UDT fields invalid:** Use `(myObject[10]).field` syntax
- **Default margin:** 100% (was 0 in v5) — add `margin_long=0, margin_short=0` to replicate v5

Full breaking changes: [v6-breaking-changes.md](references/v6-breaking-changes.md)

---

## Execution Model

Pine executes **bar by bar**, left to right. On each bar, ALL lines execute (including inside `if` blocks unless lazy evaluation applies). 

**v6 lazy evaluation:** `and`/`or` short-circuit. Extract stateful functions (ta.rsi, ta.ema, etc.) to global scope — never inside lazy conditions:

```pine
// ❌ WRONG — ta.rsi may not execute on every bar
if close > open and ta.rsi(close, 14) > 50
    signal := true

// ✅ CORRECT
float rsi = ta.rsi(close, 14)
if close > open and rsi > 50
    signal := true
```

---

## Common Built-ins

```pine
// OHLCV
open, high, low, close, volume, hl2, hlc3, ohlc4, hlcc4

// Bar info
bar_index, last_bar_index, barstate.isfirst, barstate.islast
barstate.isconfirmed, barstate.ishistory, barstate.isrealtime

// TA
ta.sma(source, length)     ta.ema(source, length)
ta.rsi(source, length)     ta.atr(length)
ta.crossover(a, b)         ta.crossunder(a, b)
ta.highest(source, length) ta.lowest(source, length)
ta.stoch(close, high, low, length)

// Math
math.abs(x)  math.max(a,b)  math.min(a,b)  math.round(x)  math.floor(x)

// String
str.tostring(val, format)  str.format("Value: {0}", x)
```

---

## Reference Files

- [indicators.md](references/indicators.md) — Indicator anatomy, inputs, plots, labels, lines, tables, alerts
- [CATALOG.md](references/CATALOG.md) — Indexed list of all official base indicators and strategies
- [pop-indicators.md](references/pop-indicators.md) — Official TradingView base indicators reference
- [strategies.md](references/strategies.md) — strategy.*() functions, orders, position sizing, backtest settings
- [pop-strategies.md](references/pop-strategies.md) — Official TradingView base strategies reference
- [debugging.md](references/debugging.md) — Common errors, repainting, na handling, compilation fixes
- [v6-breaking-changes.md](references/v6-breaking-changes.md) — Full v5→v6 migration checklist
- [optimization.md](references/optimization.md) — Performance best practices, request.*() limits, max_bars_back

---

## How to use Official Indicators & Strategies

Before writing a custom indicator or strategy logic from scratch, **always search [CATALOG.md](references/CATALOG.md)** for the appropriate base indicator.
If the indicator or strategy is listed in the catalog, you must read the source code from `pop-indicators.md` or `pop-strategies.md` and use it as your foundational template to guarantee code quality and TradingView standard compliance.