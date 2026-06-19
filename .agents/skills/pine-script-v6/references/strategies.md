# Strategies — Pine Script v6

## Table of Contents
- [Declaration](#declaration)
- [Order Functions](#order-functions)
- [Position Sizing](#position-sizing)
- [Take Profit & Stop Loss](#take-profit--stop-loss)
- [Strategy Properties](#strategy-properties)
- [Reading Results](#reading-results)
- [Common Pitfalls](#common-pitfalls)

---

## Declaration

```pine
//@version=6
strategy(
    title            = "My Strategy",
    overlay          = true,
    initial_capital  = 10000,
    currency         = currency.USD,
    default_qty_type = strategy.percent_of_equity,
    default_qty_value = 10,
    commission_type  = strategy.commission.percent,
    commission_value = 0.05,       // 0.05%
    slippage         = 1,          // ticks
    margin_long      = 100,        // v6 default (was 0 in v5)
    margin_short     = 100,
    pyramiding       = 1,          // max entries in same direction
    process_orders_on_close = false,
    calc_on_order_fills     = false,
    max_bars_back    = 500
)
```

---

## Order Functions

**v6 BREAKING:** `when` parameter removed. Wrap calls in `if` instead.

```pine
// ❌ v5 style (invalid in v6)
strategy.entry("Long", strategy.long, when=longCondition)

// ✅ v6 style
if longCondition
    strategy.entry("Long", strategy.long)

// Entry (opens or adds to position)
strategy.entry("Long",  strategy.long,  qty=1.0, limit=na, stop=na, comment="Entry")
strategy.entry("Short", strategy.short, qty=1.0)

// Order (more flexible, does not enforce direction)
strategy.order("Buy", strategy.buy, qty=1.0)

// Close specific entry
strategy.close("Long", comment="TP Hit")

// Close all positions
strategy.close_all(comment="EOD")

// Cancel pending orders
strategy.cancel("Long")
strategy.cancel_all()
```

---

## Take Profit & Stop Loss

```pine
// strategy.exit() — attaches to an open trade
// v6: evaluates BOTH relative and absolute params, uses whichever triggers first
strategy.exit(
    id       = "Exit Long",
    from_entry = "Long",
    qty_percent = 100,             // % of position to close
    profit   = 200,                // ticks from entry (relative)
    loss     = 100,                // ticks from entry (relative)
    limit    = close + 2 * atr,    // absolute price (evaluated with relative — triggers first)
    stop     = close - 1 * atr,    // absolute price
    trail_price   = na,            // trailing stop activation price
    trail_points  = na,            // trailing stop activation (ticks)
    trail_offset  = na,            // trailing stop distance (ticks)
    comment  = "SL/TP"
)

// v6 behavior: if profit=0 AND limit=price, profit=0 triggers first → exits at entry
// Fix: don't mix relative+absolute for same param unless intentional
```

**Best practice:** Use either relative (ticks) OR absolute (price), not both for the same exit level.

---

## Position Sizing

```pine
strategy.percent_of_equity  // qty = X% of equity
strategy.fixed               // qty = X contracts/shares
strategy.cash                // qty = X units of account currency

// Dynamic sizing example
float riskPct  = 1.0                          // risk 1% of equity
float stopDist = close - (close - 2 * ta.atr(14)) // stop distance in price
float qtyRaw   = (strategy.equity * riskPct / 100) / stopDist
float qty      = math.max(1, math.floor(qtyRaw))

if longCondition
    strategy.entry("Long", strategy.long, qty=qty)
```

---

## Strategy Properties

```pine
// Position info
strategy.position_size      // positive=long, negative=short, 0=flat
strategy.position_avg_price // average entry price
strategy.equity             // current equity
strategy.netprofit          // total net profit
strategy.grossprofit        // gross profit
strategy.grossloss          // gross loss

// Trade history (v6: trimmed after 9000 orders)
strategy.closedtrades                             // count
strategy.closedtrades.first_index                 // first non-trimmed index
strategy.closedtrades.entry_price(tradeNum)
strategy.closedtrades.exit_price(tradeNum)
strategy.closedtrades.profit(tradeNum)
strategy.closedtrades.size(tradeNum)

// Open trades
strategy.opentrades
strategy.opentrades.entry_price(0)

// Orders
strategy.orders.id(orderNum)
```

---

## Reading Results

```pine
// Display equity curve in a table
var table perf = table.new(position.top_right, 2, 4)
if barstate.islastconfirmedhistory
    float winRate = strategy.wintrades / strategy.closedtrades * 100
    float pf      = strategy.grossprofit / math.abs(strategy.grossloss)

    table.cell(perf, 0, 0, "Win Rate",  text_color=color.white)
    table.cell(perf, 1, 0, str.tostring(winRate, "#.#") + "%",
        text_color = winRate > 50 ? color.green : color.red)
    table.cell(perf, 0, 1, "Profit Factor", text_color=color.white)
    table.cell(perf, 1, 1, str.tostring(pf, "#.##"),
        text_color = pf > 1 ? color.green : color.red)
    table.cell(perf, 0, 2, "Net Profit", text_color=color.white)
    table.cell(perf, 1, 2, str.tostring(strategy.netprofit, "#.##"),
        text_color = strategy.netprofit > 0 ? color.green : color.red)
```

---

## Common Pitfalls

| Issue | Cause | Fix |
|-------|-------|-----|
| Orders not firing | `when` param used | Wrap in `if` block |
| Margin calls unexpected | v6 default margin=100 | Add `margin_long=0, margin_short=0` to replicate v5 |
| Repainting entries | Using unconfirmed bar data | Use `close[1]` or `barstate.isconfirmed` |
| strategy.exit ignores limit | Mixed relative+absolute params | v6 picks whichever triggers first — don't mix |
| Too many orders error | >9000 orders in v5 | v6 trims oldest; use `strategy.closedtrades.first_index` |
| strategy.exit trail not working | trail_offset missing | Requires trail_offset when using trail_price/trail_points |

**Repainting prevention:**
```pine
// Entry on bar CLOSE (no repainting)
if ta.crossover(ta.sma(close,14), ta.sma(close,28)) and barstate.isconfirmed
    strategy.entry("Long", strategy.long)

// Or use confirmed previous bar
bool signal = ta.crossover(ta.sma(close,14), ta.sma(close,28))[1]
if signal
    strategy.entry("Long", strategy.long)
```