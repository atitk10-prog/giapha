# Indicators — Pine Script v6

## Table of Contents
- [Anatomy](#anatomy)
- [Inputs](#inputs)
- [Plots](#plots)
- [Labels & Lines](#labels--lines)
- [Tables](#tables)
- [Alerts](#alerts)
- [Multi-timeframe Data](#multi-timeframe-data)

---

## Anatomy

```pine
//@version=6
indicator(
    title = "My Indicator",
    shorttitle = "MI",
    overlay = true,           // true = on chart, false = separate pane
    precision = 2,
    max_bars_back = 500,      // increase if [] offset errors occur
    max_lines_count = 500,    // default 50, max 500
    max_labels_count = 500,
    max_boxes_count = 500
)
```

---

## Inputs

```pine
// Basic types
int    len     = input.int(14, "Length", minval=1, maxval=500)
float  src     = input.source(close, "Source")
bool   showBg  = input.bool(true, "Show Background")
string style   = input.string("EMA", "MA Type", options=["EMA","SMA","WMA"])
color  col     = input.color(color.blue, "Line Color")

// Inline grouping
len2 = input.int(20, "Fast", inline="ma", group="Moving Averages")
len3 = input.int(50, "Slow", inline="ma", group="Moving Averages")

// Timeframe / Symbol
tf  = input.timeframe("1D", "Timeframe")
sym = input.symbol("NASDAQ:AAPL", "Symbol")
```

---

## Plots

```pine
// Basic plot
plot(close, "Close", color.blue, linewidth=2)

// Conditional color
plot(close, color = close > open ? color.green : color.red)

// plot() with style
plot(close, style=plot.style_histogram, color=color.new(color.blue,70))

// Multiple fills between plots
p1 = plot(ta.sma(close,20), "SMA20", color.blue)
p2 = plot(ta.sma(close,50), "SMA50", color.red)
fill(p1, p2, color = ta.sma(close,20) > ta.sma(close,50) ?
    color.new(color.green,80) : color.new(color.red,80))

// hline
hline(70, "Overbought", color.red, linestyle=hline.style_dashed)
hline(30, "Oversold",   color.green, linestyle=hline.style_dashed)

// plotshape / plotchar for signals
plotshape(ta.crossover(ta.sma(close,14), ta.sma(close,28)),
    style=shape.triangleup, location=location.belowbar,
    color=color.green, size=size.small, title="Buy Signal")

// barcolor
barcolor(close > open ? color.green : color.red)
bgcolor(close > open ? color.new(color.green,90) : na)
```

**v6 removed:** `transp` parameter. Use `color.new(color, transparency)` instead.

---

## Labels & Lines

```pine
// Labels — created on specific bars, persisted with var
var label lastLabel = na
if ta.crossover(ta.sma(close,14), ta.sma(close,28))
    lastLabel := label.new(
        x=bar_index, y=low,
        text="BUY\n" + str.tostring(close, "#.##"),
        style=label.style_label_up,
        color=color.green,
        textcolor=color.white,  // default in v6 (was black in v5)
        size=size.small
    )

// Delete old labels to stay within max_labels_count
// label.delete(label[1])

// Lines
var line myLine = na
if barstate.isfirst
    myLine := line.new(bar_index, close, bar_index+10, close,
        color=color.blue, width=2, style=line.style_dashed)
// Update line endpoint
line.set_x2(myLine, bar_index)
line.set_y2(myLine, close)

// Boxes
var box myBox = na
if condition
    myBox := box.new(bar_index-5, high, bar_index, low,
        border_color=color.orange, bgcolor=color.new(color.orange,80))
```

---

## Tables

```pine
// Declare with var — only created once
var table infoTable = table.new(
    position.top_right, columns=2, rows=5,
    bgcolor=color.new(color.black,70),
    border_color=color.gray, border_width=1
)

// Update cells on each bar (or only last bar for efficiency)
if barstate.islastconfirmedhistory
    table.cell(infoTable, 0, 0, "RSI", text_color=color.gray, text_size=size.small)
    table.cell(infoTable, 1, 0,
        str.tostring(ta.rsi(close,14), "#.##"),
        text_color = ta.rsi(close,14) > 70 ? color.red : color.green,
        text_size=size.normal)
```

---

## Alerts

```pine
// alertcondition — configures via "Add Alert" dialog
alertcondition(ta.crossover(ta.sma(close,14), ta.sma(close,28)),
    title="MA Cross Up",
    message="{{ticker}} crossed up on {{interval}}")

// alert() — fires programmatically each bar it's called
if ta.crossover(close, ta.sma(close,20))
    alert("Price crossed MA: " + str.tostring(close), alert.freq_once_per_bar)

// alert.freq options:
// alert.freq_all              — every tick
// alert.freq_once_per_bar     — once per confirmed bar
// alert.freq_once_per_bar_close — only on bar close
```

**Alert message placeholders:** `{{ticker}}`, `{{exchange}}`, `{{interval}}`, `{{close}}`, `{{open}}`, `{{high}}`, `{{low}}`, `{{volume}}`

---

## Multi-timeframe Data

```pine
// v6: request.*() is dynamic by default — works inside loops/conditionals
float dailyClose = request.security(syminfo.tickerid, "1D", close)
float weeklyHigh  = request.security(syminfo.tickerid, "1W", ta.highest(high, 5))

// Avoid repainting: use confirmed bar data with [1] offset
float cleanDailyClose = request.security(syminfo.tickerid, "1D", close[1],
    lookahead=barmerge.lookahead_off)

// Multi-symbol loop (v6 dynamic requests)
var array<string> symbols = array.from("NASDAQ:AAPL", "NASDAQ:MSFT", "NASDAQ:GOOGL")
array<float> closes = array.new<float>()
for sym in symbols
    closes.push(request.security(sym, "1D", close))

// request.security_lower_tf — intrabar data
float[] intrabars = request.security_lower_tf(syminfo.tickerid, "1", close)

// timeframe.period always includes multiplier in v6: "1D" not "D"
bool isDaily = timeframe.period == "1D"  // ✅ v6 correct
```

**Limits:** Max 40 unique `request.*()` calls per script. Each symbol+timeframe pair counts as one call.