Đây là phần tài liệu tham khảo của Pine Script v6 được công bố chính thức từ Trading View
------------------------
 
//@version=6
strategy("MovingAvg2Line Cross", overlay=true)
fastLength = input(9)
slowLength = input(18)
price = close
mafast = ta.sma(price, fastLength)
maslow = ta.sma(price, slowLength)
if (ta.crossover(mafast, maslow))
	strategy.entry("MA2CrossLE", strategy.long, comment="MA2CrossLE")
if (ta.crossunder(mafast, maslow))
	strategy.entry("MA2CrossSE", strategy.short, comment="MA2CrossSE")
//plot(strategy.equity, title="equity", color=color.red, linewidth=2, style=plot.style_areabr)

------------------------
//@version=6
indicator(title="Aroon", shorttitle="Aroon", overlay=false, format=format.percent, precision=2, timeframe="", timeframe_gaps=true)
length = input.int(14, minval=1)
upper = 100 * (ta.highestbars(high, length + 1) + length)/length
lower = 100 * (ta.lowestbars(low, length + 1) + length)/length
plot(upper, "Aroon Up", color=#FB8C00)
plot(lower, "Aroon Down", color=#2962FF)

------------------------
//@version=6
indicator("Aroon Oscillator", "Aroon Osc", timeframe = "", timeframe_gaps = true)

import TradingView/ta/11 as TVta

int lengthInput = input.int(14, "Length", 1)

// Calculate Aroon Up and Aroon Down values, then compute their difference.
[aroonUp, aroonDn] = TVta.aroon(lengthInput)
float osc = aroonUp - aroonDn

// Plot the oscillator and display threshold lines.
oscPlot  = plot(osc, "Oscillator", osc >= 0 ? #4caf50 : #ff5252)
zeroPlot = plot(0, "", na, display = display.none, editable = false)
fill(oscPlot, zeroPlot, osc >= 0 ? #4caf501a : #ff52521a, "Oscillator fill")
hline(0,   "Center")
hline(90,  "Upper level")
hline(-90, "Lower level")

------------------------
//@version=6
indicator(title="Bollinger BandWidth", shorttitle="BBW", format=format.price, precision=2, timeframe="", timeframe_gaps=true)


string TT_LENGTH = "The time period to be used in calculating the SMA which creates the base for the Upper and Lower Bands"
string TT_SOURCE = "Determines what data from each bar will be used in calculations."
string TT_MULT   = "The number of Standard Deviations away from the SMA that the Upper and Lower Bands should be."
string TT_HI_EXP = "The Highest Expansion plot displays the highest value that BBW had in the last N bars, where N is the length specified by this input."
string TT_LO_EXP = "The Lowest Contraction plot displays the lowest value that BBW had in the last N bars, where N is the length specified by this input."

length = input.int(20,       "Length", minval = 1, tooltip = TT_LENGTH)
src    = input(close,        "Source",             tooltip = TT_SOURCE)
mult   = input.float(2.0,    "StdDev", minval = 0.001,    maxval = 50, tooltip = TT_MULT)
expansionLengthInput   = input.int(125,      "Highest Expansion Length",  minval = 1, display = display.none, tooltip = TT_HI_EXP)
contractionLengthInput = input.int(125,      "Lowest Contraction Length", minval = 1, display = display.none, tooltip = TT_LO_EXP)

basis = ta.sma(src, length)
dev   = mult * ta.stdev(src, length)
upper = basis + dev
lower = basis - dev
bbw   = ((upper - lower) / basis) * 100

plot(bbw, "Bollinger BandWidth", color = #2962FF)
plot(ta.highest(bbw, expansionLengthInput),  "Highest Expansion",  color = color.new(#F23645, 50))
plot(ta.lowest(bbw, contractionLengthInput), "Lowest Contraction", color = color.new(#089981, 50))

------------------------
//@version=6
indicator("BBTrend", timeframe="", timeframe_gaps=true)

shortLengthInput = input.int(20,    "Short BB Length", minval = 1)
longLengthInput  = input.int(50,    "Long BB Length",  minval = 1)
stdDevMultInput  = input.float(2.0, "StdDev",          minval = 0.001)

[shortMiddle, shortUpper, shortLower] = ta.bb(close, shortLengthInput, stdDevMultInput)
[longMiddle,  longUpper,  longLower]  = ta.bb(close, longLengthInput,  stdDevMultInput)

BBTrend = (math.abs(shortLower - longLower) - math.abs(shortUpper - longUpper)) / shortMiddle * 100

posColorStrong = color.new(#089981, 25)
negColorStrong = color.new(#F23645, 25)
posColorWeak   = color.new(#089981, 50)
negColorWeak   = color.new(#F23645, 50)

histColor = switch
    BBTrend > 0 and BBTrend >= BBTrend[1] => posColorStrong
    BBTrend > 0 and BBTrend <  BBTrend[1] => posColorWeak
    BBTrend < 0 and BBTrend >  BBTrend[1] => negColorWeak
    BBTrend < 0 and BBTrend <= BBTrend[1] => negColorStrong
    => posColorWeak

plot(BBTrend, "BBTrend", style = plot.style_columns, color = histColor)
hline(0, "Zero line")

------------------------
//@version=6
indicator(title="Klinger Oscillator", format=format.volume, timeframe="", timeframe_gaps=true)
var cumVol = 0.
cumVol += nz(volume)
if barstate.islast and cumVol == 0
    runtime.error("No volume is provided by the data vendor.")
sv = ta.change(hlc3) >= 0 ? volume : -volume
kvo = ta.ema(sv, 34) - ta.ema(sv, 55)
sig = ta.ema(kvo, 13)
plot(kvo, color = #2962FF, title="Klinger Oscillator")
plot(sig, color = #43A047, title="Signal")

------------------------
//@version=6
indicator("Multi-Time Period Charts", shorttitle = "MTPC", overlay = true, max_boxes_count = 500)

// Tooltips
string TT_AT = "If selected, the indicator automatically chooses the timeframe of the displayed bars. The chosen higher"
 + " timeframe is:\n\n"
 + " • '2 hours' if the chart timeframe is a seconds-based timeframe.\n"
 + " • '1 day' if the chart timeframe is lower than one day and not a seconds-based timeframe.\n"
 + " • '1 week' if the chart timeframe is higher than one day and lower than one week.\n"
 + " • '1 month' if the chart timeframe is higher than one week and lower than one month.\n"
 + " • '3 months' if the chart timeframe is higher than one month and lower than three months.\n"
 + " • '12 months' if the chart timeframe is higher than three months."
 + " \n\nIf not selected, it uses the timeframe specified in the 'Timeframe' input."
    
string TT_UC = "When this option is unchecked, MTPC will use intraday data while calculating on intraday charts."
 + " If Extended Hours are displayed on the chart, they will be taken into account during the calculation."
 + " If intraday OHLC values are different from daily-based values (normal for stocks), the MTPC will also differ."

// Color constants
color UP_COLOR   = #009688
color DN_COLOR   = #F44336
color UPBD_COLOR = color.new(UP_COLOR, 70)
color DNBD_COLOR = color.new(DN_COLOR, 70)

//@enum An enumeration of named values representing display modes.
enum CalcType
    hl   = "High/Low Range"
    oc   = "Open/Close Range"
    ohlc = "OHLC"
    tr   = "True Range"

// Inputs
bool     autoTFInput        = input(true,             "Auto-timeframe", tooltip = TT_AT)
string   tfInput            = input.timeframe("1M",   "Timeframe", active = not autoTFInput)
CalcType calcTypeInput      = input.enum(CalcType.hl, "Calculation")
bool     useHaInput         = input.bool(false,       "Display Heikin Ashi values")
bool     useDailyInput      = input.bool(false,       "Use daily-based values", tooltip = TT_UC)

string   GRP01              = "Border and fill colors"
color    upBorderColorInput = input(UP_COLOR,       "Up bars  ", inline = "10", group = GRP01)
color    upBodyColorInput   = input(UPBD_COLOR,         "",      inline = "10", group = GRP01)
color    dnBorderColorInput = input(DN_COLOR,       "Down bars", inline = "11", group = GRP01)
color    dnBodyColorInput   = input(DNBD_COLOR,         "",      inline = "11", group = GRP01)

// @type A custom type for storing HTF bar information.
type OHLC
    float o
    float h
    float l
    float c
    float prevC

// @function Sets the position and colors of a box based on direction, or hides the box if `cond` is `true`. 
method setBox(box bx, cond, left, right, top, bottom, diff, upBodyColor, dnBodyColor, upBorderColor, dnBorderColor) =>
    color bodyColor   = diff < 0 ? dnBodyColor   : upBodyColor
    color borderColor = diff < 0 ? dnBorderColor : upBorderColor
    switch 
        cond => bx.set_bgcolor(na), bx.set_border_color(na)
        => 
            bx.set_left(left), bx.set_right(right)
            bx.set_top(top),   bx.set_bottom(bottom)
            bx.set_bgcolor(bodyColor), bx.set_border_color(borderColor)

// @function Returns a default higher-timeframe string based on the current chart's timeframe. 
selectAutoTimeframe() =>
    int secondsInTF = timeframe.in_seconds()
    string result = switch
        timeframe.isseconds   => "120"
        secondsInTF < 86400   => "1440"
        secondsInTF < 604800  => "1W"
        secondsInTF < 2628003 => "1M"
        secondsInTF < 7884009 => "3M"
        => "12M"

// @function Returns an adjusted timeframe, converting "1D" to "1440" during extended sessions.
selectTimeframeFromInput(tf) =>
    syminfo.session == session.extended and tf == "1D" ? "1440" : tf 

// @function Creates an `OHLC` object containing past bar prices.
makeOHLC(offset = 0) =>
    OHLC.new(open[offset], high[offset], low[offset], close[offset], close[offset + 1])

// @function Calculate Heikin Ashi values from standard OHLC values and previous HA open and close values. 
haFrom(o, h, l, c, prevHO, prevHC) =>
    float haC = (o + h + l + c) / 4
    float haO = na(prevHO) or na(prevHC) ? (o + c) / 2 : (prevHO + prevHC) / 2
    float haH = math.max(h, haO, haC)
    float haL = math.min(l, haO, haC)
    [haO, haH, haL, haC]

// @function Creates an `OHLC` object containing HTF values based on chart prices, with optional Heikin Ashi conversion. 
chartOHLC(tf, useHA) =>
    var float htfOpen   = na 
    var float htfHigh   = na 
    var float htfLow    = na 
    var float prevClose = na
    var float haClose   = na
    var float haOpen    = na
    var float prevHaC   = na
    var float prevHaO   = na
    if timeframe.change(tf)
        htfOpen   := open
        htfHigh   := high
        htfLow    := low
        prevClose := close[1]
        prevHaO   := haOpen
        prevHaC   := haClose
    htfHigh := math.max(high, htfHigh)
    htfLow  := math.min(low,  htfLow)
    switch 
        useHA => 
            [haO, haH, haL, haC] = haFrom(htfOpen, htfHigh, htfLow , close, prevHaO, prevHaC)
            haOpen  := haO
            haClose := haC
            OHLC.new(haO, haH, haL, haC, prevHaC)
        => OHLC.new(htfOpen, htfHigh, htfLow, close, prevClose)

//@variable The leftmost bar index for the box.
var int prevBarIndex = bar_index

// Determine the higher timeframe to use, and select the ticker (Heikin Ashi or regular).
var string timeframe = autoTFInput ? selectAutoTimeframe() : selectTimeframeFromInput(tfInput)
var string ticker    = useHaInput  ? ticker.heikinashi(syminfo.tickerid) : syminfo.tickerid

// Get HTF bar data using either chart-based aggregation or context requests. 
[bar0, bar1] = switch 
    not useDailyInput => [chartOHLC(timeframe, useHaInput), chartOHLC(timeframe, useHaInput)[1]]
    => request.security(ticker, timeframe, [makeOHLC(0), makeOHLC(1)], lookahead = barmerge.lookahead_on)

// Determine HTF bar coordinates based on the selected calculation mode.
bool isNewPeriod = timeframe.change(timeframe)
bool drawCurrent = barstate.islast and not isNewPeriod
OHLC bar = drawCurrent ? bar0 : bar1
bar := na(bar) ? OHLC.new() : bar
float diff  = bar.c - bar.o
int   left  = prevBarIndex
int   right = drawCurrent ? bar_index : bar_index - 1
[top, bottom] = switch calcTypeInput
    CalcType.oc => [bar.c, bar.o]
    CalcType.tr => [math.max(bar.h, bar.prevC), math.min(bar.l, bar.prevC)]
    =>             [bar.h, bar.l]

// On each new HTF bar, update the index and draw the finalized boxes.
if isNewPeriod
    prevBarIndex := bar_index
    box htBar = box.new(na, na, na, na)
    htBar.setBox(
         false, left, right, top, bottom, diff, upBodyColorInput, dnBodyColorInput, upBorderColorInput, 
         dnBorderColorInput
     )
    // Draw body open-close range if OHLC mode is enabled. 
    if calcTypeInput == CalcType.ohlc
        box htBody = box.new(na, na, na, na)
        htBody.setBox(
             false, left, right, bar.o, bar.c, diff, upBodyColorInput, dnBodyColorInput, upBorderColorInput, 
             dnBorderColorInput
         )

// For the current realtime HTF bar, draw the developing box. 
if barstate.islast
    var box rtBox = box.new(na, na, na, na)
    rtBox.setBox(
         isNewPeriod, left, right, top, bottom, diff, upBodyColorInput, dnBodyColorInput, upBorderColorInput,
         dnBorderColorInput
     )
    // Draw body open-close if OHLC mode is enabled. 
    if calcTypeInput == CalcType.ohlc
        var box rtBody = box.new(na, na, na, na)
        rtBody.setBox(
             isNewPeriod, left, right, bar.o, bar.c, diff, upBodyColorInput, dnBodyColorInput, upBorderColorInput,
             dnBorderColorInput
         )

------------------------
//@version=6
indicator(title="On Balance Volume", shorttitle="OBV", format=format.volume, timeframe="", timeframe_gaps=true)
var cumVol = 0.
cumVol += nz(volume)
if barstate.islast and cumVol == 0
    runtime.error("No volume is provided by the data vendor.")
src = close
obv = ta.cum(math.sign(ta.change(src)) * volume)
plot(obv, color=#2962FF, title="OnBalanceVolume")

// Smoothing MA inputs
GRP = "Smoothing"
TT_BB = "Only applies when 'SMA + Bollinger Bands' is selected. Determines the distance between the SMA and the bands."
maTypeInput = input.string("None", "Type", options = ["None", "SMA", "SMA + Bollinger Bands", "EMA", "SMMA (RMA)", "WMA", "VWMA"], group = GRP, display = display.none)
var isBB = maTypeInput == "SMA + Bollinger Bands"
maLengthInput = input.int(14, "Length", group = GRP, display = display.none, active = maTypeInput != "None")
bbMultInput = input.float(2.0, "BB StdDev", minval = 0.001, maxval = 50, step = 0.5, tooltip = TT_BB, group = GRP, display = display.none, active = isBB)
var enableMA = maTypeInput != "None"

// Smoothing MA Calculation
ma(source, length, MAtype) =>
	switch MAtype
		"SMA"                   => ta.sma(source, length)
		"SMA + Bollinger Bands" => ta.sma(source, length)
		"EMA"                   => ta.ema(source, length)
		"SMMA (RMA)"            => ta.rma(source, length)
		"WMA"                   => ta.wma(source, length)
		"VWMA"                  => ta.vwma(source, length)

// Smoothing MA plots
smoothingMA = enableMA ? ma(obv, maLengthInput, maTypeInput) : na
smoothingStDev = isBB ? ta.stdev(obv, maLengthInput) * bbMultInput : na
plot(smoothingMA, "OBV-based MA", color=color.yellow, display = enableMA ? display.all : display.none, editable = enableMA)
bbUpperBand = plot(smoothingMA + smoothingStDev, title = "Upper Bollinger Band", color=color.green, display = isBB ? display.all : display.none, editable = isBB)
bbLowerBand = plot(smoothingMA - smoothingStDev, title = "Lower Bollinger Band", color=color.green, display = isBB ? display.all : display.none, editable = isBB)
fill(bbUpperBand, bbLowerBand, color= isBB ? color.new(color.green, 90) : na, title="Bollinger Bands Background Fill", display = isBB ? display.all : display.none, editable = isBB)

------------------------
//@version=6
indicator(title="Balance of Power", format=format.price, precision=2, timeframe="", timeframe_gaps=true)
plot((close - open) / (high - low), "BOP", color=color.red)

------------------------
//@version=6
indicator("Chandelier Exit", "Chandelier", true, timeframe = "", timeframe_gaps = true)

import TradingView/ta/11 as TVta

// Inputs
int   lengthInput  = input.int(22,    "Length",         1)
int   atrLenInput  = input.int(22,    "ATR length",     1)
float atrMultInput = input.float(3.0, "ATR multiplier", 0.0, step = 0.01)

// Calculate and plot the long and short exit values.
[longCE, shortCE] = TVta.chandelier(lengthInput, atrLenInput, atrMultInput)

plot(longCE,  "Long exit")
plot(shortCE, "Short exit", #ff6d00)

------------------------
//@version=6
indicator("Volume Delta", format=format.volume)

import TradingView/ta/8

lowerTimeframeTooltip = "The indicator scans lower timeframe data to approximate up and down volume used in the delta calculation. By default, the timeframe is chosen automatically. These inputs override this with a custom timeframe."
 + " \n\nHigher timeframes provide more historical data, but the data will be less precise."
useCustomTimeframeInput = input.bool(false, "Use custom timeframe", tooltip = lowerTimeframeTooltip)
lowerTimeframeInput = input.timeframe("1", "Timeframe", active = useCustomTimeframeInput)

var lowerTimeframe = switch
    useCustomTimeframeInput => lowerTimeframeInput
    timeframe.isseconds     => "1S"
    timeframe.isintraday    => "1"
    timeframe.isdaily       => "5"
    => "60"

[openVolume, maxVolume, minVolume, lastVolume] = ta.requestVolumeDelta(lowerTimeframe)

col = lastVolume > 0 ? color.teal : color.red
hline(0)
plotcandle(openVolume, maxVolume, minVolume, lastVolume, "Volume Delta", color = col, bordercolor = col, wickcolor = col)

var cumVol = 0.
cumVol += nz(volume)
if barstate.islast and cumVol == 0
    runtime.error("The data vendor doesn't provide volume data for this symbol.")

------------------------
//@version=6
indicator("Auto Fib Extension", overlay=true)

depthTooltip = "The minimum number of bars that will be taken into account when calculating the indicator."
depth = input.int(title="Depth", defval=10, minval=2, inline = "Pivots", tooltip=depthTooltip)
reverse = input(false, "Reverse", display = display.none)
var extendLeft = input(false, "Extend Left    |    Extend Right", inline = "Extend Lines", display = display.none)
var extendRight = input(true, "", inline = "Extend Lines", display = display.none)
var extending = extend.none
if extendLeft and extendRight
    extending := extend.both
if extendLeft and not extendRight
    extending := extend.left
if not extendLeft and extendRight
    extending := extend.right
prices = input(true, "Show Prices", display = display.none)
levels = input(true, "Show Levels", inline = "Levels", display = display.none)
levelsFormat = input.string("Values", "", options = ["Values", "Percent"], inline = "Levels", display = display.none, active = levels)
labelsPosition = input.string("Left", "Labels Position", options = ["Left", "Right"], display = display.none)
backgroundTransparency = input.int(85, "Background Transparency", minval = 0, maxval = 100, display = display.none)

upperThreshold = 0.236
lowerThreshold = 1.0

import TradingView/ZigZag/7 as zigzag

pivots(src, length, isHigh) =>
    if bar_index >= length
        price = nz(src[length])
        found = true
        for i = 0 to length * 2
            if (isHigh and src[i] > price) or (not isHigh and src[i] < price)
                found := false
                break
        if found
            chart.point.from_time(time[length], price)

update()=>
    var line lineLastHL = na
    var line lineLastLH = na
    var line lineLast = na

    var chart.point[] pivotsH = array.new<chart.point>()
    var chart.point lastH = na
    var chart.point[] pivotsL = array.new<chart.point>()
    var chart.point lastL = na

    var isHighLast = false
    var float startPrice = na
    var float endPrice = na

    H = pivots(high, depth / 2, true)
    L = pivots(low, depth / 2, false)

    countPivotsH = array.size(pivotsH)
    countPivotsL = array.size(pivotsL)

    if countPivotsH > 0 and countPivotsL > 0
        lastH := array.get(pivotsH, countPivotsH-1)
        lastL := array.get(pivotsL, countPivotsL-1)
        isHighLast := lastH.time > lastL.time
        if isHighLast
            if not na(H)
                if H.price > lastH.price
                    array.set(pivotsH, countPivotsH-1, H)
                H := na
        else
            if not na(L)
                if L.price < lastL.price
                    array.set(pivotsL, countPivotsL-1, L)
                L := na

    if not na(H)
        array.push(pivotsH, H)

    if not na(L)
        array.push(pivotsL, L)

    if barstate.islast and array.size(pivotsH) > 0 and array.size(pivotsL) > 0
        pivotsHCopy = array.copy(pivotsH)
        pivotsLCopy = array.copy(pivotsL)
        while array.size(pivotsHCopy) > 0 and array.size(pivotsLCopy) > 0
            lastH := array.pop(pivotsHCopy)
            lastL := array.pop(pivotsLCopy)

            isHighLast := lastH.time > lastL.time
            pivots = isHighLast ? pivotsHCopy : pivotsLCopy

            for i = array.size(pivots)-1 to 0
                if i < 0
                    break
                p = array.get(pivots, i)
                if p.time < lastL.time
                    break
                betterPrice = isHighLast ? p.price > lastH.price : p.price < lastL.price
                if p.price > lastH.price
                    lastH := array.pop(pivots)
                else
                    array.remove(pivots, i)

            if array.size(pivotsHCopy) == 0 or array.size(pivotsLCopy) == 0
                break

            isHighLast := lastH.time > lastL.time
            pivots := isHighLast ? pivotsHCopy : pivotsLCopy

            prevPivot = array.get(pivots, array.size(pivots)-1)
            startPrice := prevPivot.price

            if isHighLast
                endPrice := lastL.price
                diff = math.abs(startPrice - endPrice)
                if lastH.price > endPrice + diff * lowerThreshold or lastH.price < endPrice + diff * upperThreshold
                    array.push(pivotsLCopy, lastL)
                    continue
                line.delete(lineLastHL)
                line.delete(lineLastLH)
                lineLastHL := line.new(prevPivot, lastL, color=color.red, width=1, style=line.style_dashed, xloc = xloc.bar_time)
                lineLastLH := line.new(lastL, lastH, color=color.green, width=1, style=line.style_dashed, xloc = xloc.bar_time)
                lineLast := lineLastLH
            else
                endPrice := lastH.price
                diff = math.abs(startPrice - endPrice)
                if lastL.price < endPrice - diff * lowerThreshold or lastL.price > endPrice - diff * upperThreshold
                    array.push(pivotsHCopy, lastH)
                    continue
                line.delete(lineLastHL)
                line.delete(lineLastLH)
                lineLastLH := line.new(prevPivot, lastH, color=color.red, width=1, style=line.style_dashed, xloc = xloc.bar_time)
                lineLastHL := line.new(lastH, lastL, color=color.green, width=1, style=line.style_dashed, xloc = xloc.bar_time)
                lineLast := lineLastHL
            break
    diff = (isHighLast ? -1 : 1) * math.abs(startPrice - endPrice)
    offset = isHighLast ? line.get_y1(lineLastLH) - line.get_y2(lineLastLH) : line.get_y1(lineLastHL) - line.get_y2(lineLastHL)
    offset := (isHighLast ? -1 : 1) * math.abs(offset)
	if barstate.islast and na(lineLast)
		runtime.error("Not enough data to calculate Auto Fib Extension on the current symbol. Change the chart's timeframe to a lower one or select a smaller calculation depth using the indicator's `Depth` settings.")

    [endPrice - offset, diff, lineLast]

[endPrice, diff, lineLast] = update()

_draw_line(price, col) =>
    var id = line.new(time, price, time, price, color=col, width=1, extend=extending, xloc = xloc.bar_time)
    if not na(lineLast)
        line.set_xy1(id, line.get_x1(lineLast), price)
        line.set_xy2(id, line.get_x2(lineLast), price)
    id

_draw_label(price, txt, txtColor) =>
    if not na(price)
        x = labelsPosition == "Left" ? line.get_x1(lineLast) : not extendRight ? line.get_x2(lineLast) : time
        labelStyle = labelsPosition == "Left" ? label.style_label_right : label.style_label_left
        align = labelsPosition == "Left" ? text.align_right : text.align_left
        labelsAlignStrLeft = txt + '\n ‏  ‏  ‏  ‏  ‏  ‏  ‏  ‏  ‏  ‏  ‏  ‏  ‏  ‏  ‏  ‏  ‏  ‏  ‏  ‏  ‏  ‏  ‏  ‏  ‏  ‏  ‏  ‏  ‏  ‏  ‏  ‏  ‏  ‏  ‏ \n'
        labelsAlignStrRight = '       ' + txt + '\n ‏  ‏  ‏  ‏  ‏  ‏  ‏  ‏  ‏  ‏  ‏  ‏  ‏  ‏  ‏  ‏  ‏  ‏  ‏  ‏  ‏  ‏  ‏  ‏  ‏  ‏  ‏  ‏  ‏  ‏  ‏  ‏  ‏  ‏  ‏ \n'
        labelsAlignStr = labelsPosition == "Left" ? labelsAlignStrLeft : labelsAlignStrRight
        var id = label.new(x=x, y=price, text=labelsAlignStr, textcolor=txtColor, style=labelStyle, textalign=align, color=#00000000, xloc = xloc.bar_time)
        label.set_xy(id, x, price)
        label.set_text(id, labelsAlignStr)
        label.set_textcolor(id, txtColor)

_wrap(txt) =>
    "(" + str.tostring(txt, format.mintick) + ")"

_label_txt(level, price) =>
    if not na(price)
        l = levelsFormat == "Values" ? str.tostring(level) : str.tostring(level * 100) + "%"
        (levels ? l : "") + (prices ? _wrap(price) : "")

_crossing_level(sr, r) =>
    (r > sr and r < sr[1]) or (r < sr and r > sr[1])


processLevel(show, value, colorL, lineIdOther) =>
    float m = value
	r = endPrice + ((reverse ? -1 : 1) * diff * m)
    if show
		lineId = _draw_line(r, colorL)
        _draw_label(r, _label_txt(m, r), colorL)
        if _crossing_level(close, r)
            alert("Autofib: " + syminfo.ticker + " crossing level " + str.tostring(value))
        if not na(lineIdOther)
            linefill.new(lineId, lineIdOther, color = color.new(colorL, backgroundTransparency))
		lineId
    else
		lineIdOther

show_0  = input(true, "", inline = "Level0", display = display.none)
value_0 = input(0, "", inline = "Level0", display = display.none, active = show_0)
color_0 = input(#787b86, "", inline = "Level0", display = display.none, active = show_0)

show_0_236  = input(true, "", inline = "Level0", display = display.none)
value_0_236 = input(0.236, "", inline = "Level0", display = display.none, active = show_0_236)
color_0_236 = input(#f44336, "", inline = "Level0", display = display.none, active = show_0_236)

show_0_382  = input(true, "", inline = "Level1", display = display.none)
value_0_382 = input(0.382, "", inline = "Level1", display = display.none, active = show_0_382)
color_0_382 = input(#81c784, "", inline = "Level1", display = display.none, active = show_0_382)

show_0_5  = input(true, "", inline = "Level1", display = display.none)
value_0_5 = input(0.5, "", inline = "Level1", display = display.none, active = show_0_5)
color_0_5 = input(#4caf50, "", inline = "Level1", display = display.none, active = show_0_5)

show_0_618  = input(true, "", inline = "Level2", display = display.none)
value_0_618 = input(0.618, "", inline = "Level2", display = display.none, active = show_0_618)
color_0_618 = input(#009688, "", inline = "Level2", display = display.none, active = show_0_618)

show_0_65  = input(false, "", inline = "Level2", display = display.none)
value_0_65 = input(0.65, "", inline = "Level2", display = display.none, active = show_0_65)
color_0_65 = input(#009688, "", inline = "Level2", display = display.none, active = show_0_65)

show_0_786  = input(true, "", inline = "Level3", display = display.none)
value_0_786 = input(0.786, "", inline = "Level3", display = display.none, active = show_0_786)
color_0_786 = input(#64b5f6, "", inline = "Level3", display = display.none, active = show_0_786)

show_1  = input(true, "", inline = "Level3", display = display.none)
value_1 = input(1, "", inline = "Level3", display = display.none, active = show_1)
color_1 = input(#787b86, "", inline = "Level3", display = display.none, active = show_1)

show_1_272  = input(false, "", inline = "Level4", display = display.none)
value_1_272 = input(1.272, "", inline = "Level4", display = display.none, active = show_1_272)
color_1_272 = input(#81c784, "", inline = "Level4", display = display.none, active = show_1_272)

show_1_414  = input(false, "", inline = "Level4", display = display.none)
value_1_414 = input(1.414, "", inline = "Level4", display = display.none, active = show_1_414)
color_1_414 = input(#f44336, "", inline = "Level4", display = display.none, active = show_1_414)

show_1_618  = input(true, "", inline = "Level5", display = display.none)
value_1_618 = input(1.618, "", inline = "Level5", display = display.none, active = show_1_618)
color_1_618 = input(#2962ff, "", inline = "Level5", display = display.none, active = show_1_618)

show_1_65  = input(false, "", inline = "Level5", display = display.none)
value_1_65 = input(1.65, "", inline = "Level5", display = display.none, active = show_1_65)
color_1_65 = input(#2962ff, "", inline = "Level5", display = display.none, active = show_1_65)

show_2_618  = input(true, "", inline = "Level6", display = display.none)
value_2_618 = input(2.618, "", inline = "Level6", display = display.none, active = show_2_618)
color_2_618 = input(#f44336, "", inline = "Level6", display = display.none, active = show_2_618)

show_2_65  = input(false, "", inline = "Level6", display = display.none)
value_2_65 = input(2.65, "", inline = "Level6", display = display.none, active = show_2_65)
color_2_65 = input(#f44336, "", inline = "Level6", display = display.none, active = show_2_65)

show_3_618  = input(true, "", inline = "Level7", display = display.none)
value_3_618 = input(3.618, "", inline = "Level7", display = display.none, active = show_3_618)
color_3_618 = input(#9c27b0, "", inline = "Level7", display = display.none, active = show_3_618)

show_3_65  = input(false, "", inline = "Level7", display = display.none)
value_3_65 = input(3.65, "", inline = "Level7", display = display.none, active = show_3_65)
color_3_65 = input(#9c27b0, "", inline = "Level7", display = display.none, active = show_3_65)

show_4_236  = input(true, "", inline = "Level8", display = display.none)
value_4_236 = input(4.236, "", inline = "Level8", display = display.none, active = show_4_236)
color_4_236 = input(#e91e63, "", inline = "Level8", display = display.none, active = show_4_236)

show_4_618  = input(false, "", inline = "Level8", display = display.none)
value_4_618 = input(4.618, "", inline = "Level8", display = display.none, active = show_4_618)
color_4_618 = input(#81c784, "", inline = "Level8", display = display.none, active = show_4_618)

show_neg_0_236  = input(false, "", inline = "Level9", display = display.none)
value_neg_0_236 = input(-0.236, "", inline = "Level9", display = display.none, active = show_neg_0_236)
color_neg_0_236 = input(#f44336, "", inline = "Level9", display = display.none, active = show_neg_0_236)

show_neg_0_382  = input(false, "", inline = "Level9", display = display.none)
value_neg_0_382 = input(-0.382, "", inline = "Level9", display = display.none, active = show_neg_0_382)
color_neg_0_382 = input(#81c784, "", inline = "Level9", display = display.none, active = show_neg_0_382)

show_neg_0_618  = input(false, "", inline = "Level10", display = display.none)
value_neg_0_618 = input(-0.618, "", inline = "Level10", display = display.none, active = show_neg_0_618)
color_neg_0_618 = input(#009688, "", inline = "Level10", display = display.none, active = show_neg_0_618)

show_neg_0_65  = input(false, "", inline = "Level10", display = display.none)
value_neg_0_65 = input(-0.65, "", inline = "Level10", display = display.none, active = show_neg_0_65)
color_neg_0_65 = input(#009688, "", inline = "Level10", display = display.none, active = show_neg_0_65)


lineId0 = processLevel(show_neg_0_65, value_neg_0_65, color_neg_0_65, line(na))
lineId1 = processLevel(show_neg_0_618, value_neg_0_618, color_neg_0_618, lineId0)
lineId2 = processLevel(show_neg_0_382, value_neg_0_382, color_neg_0_382, lineId1)
lineId3 = processLevel(show_neg_0_236, value_neg_0_236, color_neg_0_236, lineId2)
lineId4 = processLevel(show_0, value_0, color_0, lineId3)
lineId5 = processLevel(show_0_236, value_0_236, color_0_236, lineId4)
lineId6 = processLevel(show_0_382, value_0_382, color_0_382, lineId5)
lineId7 = processLevel(show_0_5, value_0_5, color_0_5, lineId6)
lineId8 = processLevel(show_0_618, value_0_618, color_0_618, lineId7)
lineId9 = processLevel(show_0_65, value_0_65, color_0_65, lineId8)
lineId10 = processLevel(show_0_786, value_0_786, color_0_786, lineId9)
lineId11 = processLevel(show_1, value_1, color_1, lineId10)
lineId12 = processLevel(show_1_272, value_1_272, color_1_272, lineId11)
lineId13 = processLevel(show_1_414, value_1_414, color_1_414, lineId12)
lineId14 = processLevel(show_1_618, value_1_618, color_1_618, lineId13)
lineId15 = processLevel(show_1_65, value_1_65, color_1_65, lineId14)
lineId16 = processLevel(show_2_618, value_2_618, color_2_618, lineId15)
lineId17 = processLevel(show_2_65, value_2_65, color_2_65, lineId16)
lineId18 = processLevel(show_3_618, value_3_618, color_3_618, lineId17)
lineId19 = processLevel(show_3_65, value_3_65, color_3_65, lineId18)
lineId20 = processLevel(show_4_236, value_4_236, color_4_236, lineId19)
lineId21 = processLevel(show_4_618, value_4_618, color_4_618, lineId20)

------------------------
//@version=6
indicator("Auto Pitchfork", overlay = true)

depthTooltip = "The minimum number of bars that will be taken into account when calculating the indicator."
depth = input.int(10, "Depth", minval = 2, tooltip = depthTooltip)
typeP = input.string("Original", "Type", options = ["Original", "Schiff", "Modified Schiff", "Inside"])
backgroundTransparency = input.int(85, "Background Transparency", minval = 0, maxval = 100, display = display.none)

isExtended = input.bool(false, "Extend left")
extendLine = isExtended ? extend.both : extend.right 

medianColor = input(#f44336, "Median line                 ", inline = "ML", display = display.none)
medianWidth = input.int(1, "", minval = 1, inline = "ML", display = display.none)
medianStyle = input.string("Solid", "", options = ["Dashed", "Dotted", "Solid"], inline = "ML", display = display.none)

import TradingView/ZigZag/7 as zigzag

var chart.point lastP = na
var chart.point prevP = na
var chart.point prev2P = na

var zigzag.ZigZag zigZag = zigzag.newInstance(zigzag.Settings.new(0, depth, color(na), false, false, false, false, "Absolute", false))
if zigZag.update()
    pivots = zigZag.pivots
    pivotsCount = array.size(pivots)
    if pivotsCount > 1
        p = pivots.get(pivotsCount - 2)
        lastP := p.end
        prevP := p.start
        if pivotsCount > 2
            p2 = pivots.get(pivotsCount - 3)
            prev2P := p2.start

ready = not(na(lastP) or na(prevP) or na(prev2P))

_calcOffsetPrice(chart.point start, chart.point end)=>
    (start.price - end.price) * 0.5 / math.abs(start.index - end.index - 0.5)

_calcSlope(chart.point start, chart.point end)=>
    (end.price - start.price) / (end.index - start.index)
    
_calcAvgRoundBarIndex(chart.point start, chart.point end)=>
    chart.point.from_index(math.round(math.avg(start.index, end.index)), math.avg(start.price, end.price))

_calcAvgFloorBarIndex(chart.point start, chart.point end)=>
    chart.point.from_index(math.floor(math.avg(start.index, end.index)), math.avg(start.price, end.price))

getMedianData(type) =>
    if ready
        chart.point startMedian = na
        chart.point endMedian = _calcAvgFloorBarIndex(prevP, lastP)
        
        needOffsetEndMedianPrice = (lastP.index - prevP.index) % 2 != 0

        if type == "Original"
            startMedian := chart.point.copy(prev2P)
            endMedian.price += needOffsetEndMedianPrice ? _calcOffsetPrice(startMedian, endMedian) : 0 // add offset if iEndMedian was rounded (floor) to whole bar_index

        else if type == "Schiff"
            startMedian := chart.point.copy(prev2P)
            startMedian.price := math.avg(prevP.price, prev2P.price)
            endMedian.price += needOffsetEndMedianPrice ? _calcOffsetPrice(startMedian, endMedian) : 0

        else if type == "Modified Schiff"
            startMedian := chart.point.from_index(math.floor(math.avg(prevP.index, prev2P.index)), math.avg(prevP.price, prev2P.price))
            offsetPrice = _calcOffsetPrice(startMedian, endMedian)
            startMedian.price += (prev2P.index - prevP.index) % 2 != 0 ? offsetPrice : 0
            endMedian.price += needOffsetEndMedianPrice ? offsetPrice : 0

        else if type == "Inside"
            startMedian := chart.point.copy(lastP)
            slopeInside = (math.avg(prevP.price, prev2P.price) - lastP.price) / (math.avg(prevP.index, prev2P.index) - lastP.index)
            startMedian.price := slopeInside *(startMedian.index - math.avg(prevP.index, lastP.index)) + endMedian.price
            endMedian.price -= needOffsetEndMedianPrice ? _calcOffsetPrice(startMedian, endMedian) : 0
            
        [startMedian, endMedian]


drawPitchforkLine(chart.point start, chart.point end, color, width, style, extend) =>
    _style = style == "Solid" ? line.style_solid : style == "Dotted" ? line.style_dotted : line.style_dashed
    var id = line.new(start, end, xloc.bar_index, extend, color, _style, width)
    line.set_first_point(id, start)
    line.set_second_point(id, end)
    id


[startMedian, endMedian] = getMedianData(typeP)

drawLevel(iDiff, pDiff, level, slopeMedian, color, width, style)=>
    iEndMedian = (prevP.index + lastP.index) / 2
    pEndMedian = (prevP.price + lastP.price) / 2
    isSlopeUp = prevP.price > lastP.price
    temp = iEndMedian + (isSlopeUp ? iDiff : -iDiff) * level
    
    start = chart.point.from_index(math.ceil(temp), pEndMedian - pDiff * level)
    end = chart.point.from_index(start.index + 1, slopeMedian * (start.index + 1 - temp) + start.price)

    isIntBarIndex = temp - math.ceil(temp)
    offset = isIntBarIndex == 0 ? 0 : (start.price - end.price) * (isIntBarIndex) / (temp - end.index)
    start.price -= offset
    lineId = drawPitchforkLine(start, end, color, width, style, extendLine)

processLevel(show, level, color, width, style, lineIdOther1, lineIdOther2) =>
    if show and ready and not( na(startMedian) or na(endMedian) )
        iDiff = math.abs(prevP.index - lastP.index) / 2
        pDiff = math.abs(prevP.price - lastP.price) / 2
        slopeMedian = _calcSlope(startMedian, endMedian)        
        lineId1 = drawLevel(-iDiff, -pDiff, level, slopeMedian, color, width, style)
        lineId2 = drawLevel(iDiff, pDiff, level, slopeMedian, color, width, style)        
        if not na(lineIdOther1)
            linefill.new(lineId1, lineIdOther1, color = color.new(color, backgroundTransparency))
            linefill.new(lineId2, lineIdOther2, color = color.new(color, backgroundTransparency))
        else
            linefill.new(lineId1, lineId2, color = color.new(color, backgroundTransparency))
        [lineId1, lineId2]
    else
        [lineIdOther1, lineIdOther2]

show_0_25  = input(false, "", inline = "level0", display = display.none)
value_0_25 = input.float(0.25, "", minval = .0, step = .1, inline = "level0", display = display.none, active = show_0_25)
color_0_25 = input(#ffb74d, "", inline = "level0", display = display.none, active = show_0_25)
width_0_25 = input.int(1, "", minval = 1, inline = "level0", display = display.none, active = show_0_25)
style_0_25 = input.string("Solid", "", options = ["Dashed", "Dotted", "Solid"], inline = "level0", display = display.none, active = show_0_25)

show_0_382  = input(false, "", inline = "level1", display = display.none)
value_0_382 = input.float(0.382, "", minval = .0, step = .1, inline = "level1", display = display.none, active = show_0_382)
color_0_382 = input(#81c784, "", inline = "level1", display = display.none, active = show_0_382)
width_0_382 = input.int(1, "", minval = 1, inline = "level1", display = display.none, active = show_0_382)
style_0_382 = input.string("Solid", "", options = ["Dashed", "Dotted", "Solid"], inline = "level1", display = display.none, active = show_0_382)

show_0_5  = input(true, "", inline = "level2", display = display.none)
value_0_5 = input.float(0.5, "", minval = .0, step = .1, inline = "level2", display = display.none, active = show_0_5)
color_0_5 = input(#4caf50, "", inline = "level2", display = display.none, active = show_0_5)
width_0_5 = input.int(1, "", minval = 1, inline = "level2", display = display.none, active = show_0_5)
style_0_5 = input.string("Solid", "", options = ["Dashed", "Dotted", "Solid"], inline = "level2", display = display.none, active = show_0_5)

show_0_618  = input(false, "", inline = "level3", display = display.none)
value_0_618 = input.float(0.618, "", minval = .0, step = .1, inline = "level3", display = display.none, active = show_0_618)
color_0_618 = input(#009688, "", inline = "level3", display = display.none, active = show_0_618)
width_0_618 = input.int(1, "", minval = 1, inline = "level3", display = display.none, active = show_0_618)
style_0_618 = input.string("Solid", "", options = ["Dashed", "Dotted", "Solid"], inline = "level3", display = display.none, active = show_0_618)

show_0_75  = input(false, "", inline = "level4", display = display.none)
value_0_75 = input.float(0.75, "", minval = .0, step = .1, inline = "level4", display = display.none, active = show_0_75)
color_0_75 = input(#64b5f6, "", inline = "level4", display = display.none, active = show_0_75)
width_0_75 = input.int(1, "", minval = 1, inline = "level4", display = display.none, active = show_0_75)
style_0_75 = input.string("Solid", "", options = ["Dashed", "Dotted", "Solid"], inline = "level4", display = display.none, active = show_0_75)

show_1  = input(true, "", inline = "level5", display = display.none)
value_1 = input.float(1, "", minval = .0, step = .1, inline = "level5", display = display.none, active = show_1)
color_1 = input(#2962ff, "", inline = "level5", display = display.none, active = show_1)
width_1 = input.int(1, "", minval = 1, inline = "level5", display = display.none, active = show_1)
style_1 = input.string("Solid", "", options = ["Dashed", "Dotted", "Solid"], inline = "level5", display = display.none, active = show_1)

show_1_5  = input(false, "", inline = "level6", display = display.none)
value_1_5 = input.float(1.5, "", minval = .0, step = .1, inline = "level6", display = display.none, active = show_1_5)
color_1_5 = input(#9c27b0, "", inline = "level6", display = display.none, active = show_1_5)
width_1_5 = input.int(1, "", minval = 1, inline = "level6", display = display.none, active = show_1_5)
style_1_5 = input.string("Solid", "", options = ["Dashed", "Dotted", "Solid"], inline = "level6", display = display.none, active = show_1_5)

show_1_75  = input(false, "", inline = "level7", display = display.none)
value_1_75 = input.float(1.75, "", minval = .0, step = .1, inline = "level7", display = display.none, active = show_1_75)
color_1_75 = input(#e91e63, "", inline = "level7", display = display.none, active = show_1_75)
width_1_75 = input.int(1, "", minval = 1, inline = "level7", display = display.none, active = show_1_75)
style_1_75 = input.string("Solid", "", options = ["Dashed", "Dotted", "Solid"], inline = "level7", display = display.none, active = show_1_75)

show_2  = input(false, "", inline = "level8", display = display.none)
value_2 = input.float(2, "", minval = .0, step = .1, inline = "level8", display = display.none, active = show_2)
color_2 = input(#e91e63, "", inline = "level8", display = display.none, active = show_2)
width_2 = input.int(1, "", minval = 1, inline = "level8", display = display.none, active = show_2)
style_2 = input.string("Solid", "", options = ["Dashed", "Dotted", "Solid"], inline = "level8", display = display.none, active = show_2)
    
if ready
    if typeP == "Inside"
        drawPitchforkLine(endMedian, startMedian, medianColor, medianWidth, medianStyle, extendLine)
    else
        drawPitchforkLine(startMedian, endMedian, medianColor, medianWidth, medianStyle, extendLine)
        
    drawPitchforkLine(prevP, lastP, medianColor, medianWidth, medianStyle, extend.none)

    if typeP != "Original"
        drawPitchforkLine(prev2P, prevP, medianColor, medianWidth, medianStyle, extend.none)

    if typeP == "Inside"
        drawPitchforkLine(_calcAvgRoundBarIndex(prevP, prev2P), lastP, medianColor, medianWidth, medianStyle, extend.none)

[lineId0_1, lineId0_2] = processLevel(show_0_25, value_0_25, color_0_25, width_0_25, style_0_25, line(na), line(na))
[lineId1_1, lineId1_2] = processLevel(show_0_382, value_0_382, color_0_382, width_0_382, style_0_382, lineId0_1, lineId0_2)
[lineId2_1, lineId2_2] = processLevel(show_0_5, value_0_5, color_0_5, width_0_5, style_0_5, lineId1_1, lineId1_2)
[lineId3_1, lineId3_2] = processLevel(show_0_618, value_0_618, color_0_618, width_0_618, style_0_618, lineId2_1, lineId2_2)
[lineId4_1, lineId4_2] = processLevel(show_0_75, value_0_75, color_0_75, width_0_75, style_0_75, lineId3_1, lineId3_2)
[lineId5_1, lineId5_2] = processLevel(show_1, value_1, color_1, width_1, style_1, lineId4_1, lineId4_2)
[lineId6_1, lineId6_2] = processLevel(show_1_5, value_1_5, color_1_5, width_1_5, style_1_5, lineId5_1, lineId5_2)
[lineId7_1, lineId7_2] = processLevel(show_1_75, value_1_75, color_1_75, width_1_75, style_1_75, lineId6_1, lineId6_2)
[lineId8_1, lineId8_2] = processLevel(show_2, value_2, color_2, width_2, style_2, lineId7_1, lineId7_2)

------------------------
//@version=6
indicator(title="Ultimate Oscillator", shorttitle="UO", format=format.price, precision=2, timeframe="", timeframe_gaps=true)
length1 = input.int(7, minval=1, title = "Fast Length"), length2 = input.int(14, minval=1, title = "Middle Length"), length3 = input.int(28, minval=1, title = "Slow Length")
average(bp, tr_, length) => math.sum(bp, length) / math.sum(tr_, length)
high_ = math.max(high, close[1])
low_ = math.min(low, close[1])
bp = close - low_
tr_ = high_ - low_
avg7 = average(bp, tr_, length1)
avg14 = average(bp, tr_, length2)
avg28 = average(bp, tr_, length3)
out = 100 * (4*avg7 + 2*avg14 + avg28)/7
plot(out, color=#F44336, title="Oscillator")

------------------------
//@version=6
indicator(title="Envelope", shorttitle="Env", overlay=true, timeframe="", timeframe_gaps=true)
len = input.int(20, title="Length", minval=1)
percent = input(10.0, "Percent")
src = input(close, title="Source")
exponential = input(false, "Exponential")
basis = exponential ? ta.ema(src, len) : ta.sma(src, len)
k = percent/100.0
upper = basis * (1 + k)
lower = basis * (1 - k)
plot(basis, "Basis", color=#FF6D00)
u = plot(upper, "Upper", color=#2962FF)
l = plot(lower, "Lower", color=#2962FF)
fill(u, l, color=color.rgb(33, 150, 243, 95), title="Background")

------------------------
//@version=6
indicator("Williams Fractals", shorttitle="Fractals", format=format.price, precision=0, overlay=true)
// Define "n" as the number of periods and keep a minimum value of 2 for error handling.
n = input.int(title="Periods", defval=2, minval=2)


// UpFractal
bool upflagDownFrontier = true
bool upflagUpFrontier0 = true
bool upflagUpFrontier1 = true
bool upflagUpFrontier2 = true
bool upflagUpFrontier3 = true
bool upflagUpFrontier4 = true

for i = 1 to n
    upflagDownFrontier := upflagDownFrontier and (high[n-i] < high[n])
    upflagUpFrontier0 := upflagUpFrontier0 and (high[n+i] < high[n])
    upflagUpFrontier1 := upflagUpFrontier1 and (high[n+1] <= high[n] and high[n+i + 1] < high[n])
    upflagUpFrontier2 := upflagUpFrontier2 and (high[n+1] <= high[n] and high[n+2] <= high[n] and high[n+i + 2] < high[n])
    upflagUpFrontier3 := upflagUpFrontier3 and (high[n+1] <= high[n] and high[n+2] <= high[n] and high[n+3] <= high[n] and high[n+i + 3] < high[n])
    upflagUpFrontier4 := upflagUpFrontier4 and (high[n+1] <= high[n] and high[n+2] <= high[n] and high[n+3] <= high[n] and high[n+4] <= high[n] and high[n+i + 4] < high[n])
flagUpFrontier = upflagUpFrontier0 or upflagUpFrontier1 or upflagUpFrontier2 or upflagUpFrontier3 or upflagUpFrontier4

upFractal = (upflagDownFrontier and flagUpFrontier)


// downFractal
bool downflagDownFrontier = true
bool downflagUpFrontier0 = true
bool downflagUpFrontier1 = true
bool downflagUpFrontier2 = true
bool downflagUpFrontier3 = true
bool downflagUpFrontier4 = true

for i = 1 to n
    downflagDownFrontier := downflagDownFrontier and (low[n-i] > low[n])
    downflagUpFrontier0 := downflagUpFrontier0 and (low[n+i] > low[n])
    downflagUpFrontier1 := downflagUpFrontier1 and (low[n+1] >= low[n] and low[n+i + 1] > low[n])
    downflagUpFrontier2 := downflagUpFrontier2 and (low[n+1] >= low[n] and low[n+2] >= low[n] and low[n+i + 2] > low[n])
    downflagUpFrontier3 := downflagUpFrontier3 and (low[n+1] >= low[n] and low[n+2] >= low[n] and low[n+3] >= low[n] and low[n+i + 3] > low[n])
    downflagUpFrontier4 := downflagUpFrontier4 and (low[n+1] >= low[n] and low[n+2] >= low[n] and low[n+3] >= low[n] and low[n+4] >= low[n] and low[n+i + 4] > low[n])
flagDownFrontier = downflagUpFrontier0 or downflagUpFrontier1 or downflagUpFrontier2 or downflagUpFrontier3 or downflagUpFrontier4

downFractal = (downflagDownFrontier and flagDownFrontier)

plotshape(downFractal, style=shape.triangledown, location=location.belowbar, offset=-n, color=#F44336, size = size.small)
plotshape(upFractal, style=shape.triangleup,   location=location.abovebar, offset=-n, color=#009688, size = size.small)

------------------------
//@version=6
indicator(title="RSI Divergence Indicator", format=format.price, timeframe="", timeframe_gaps=true)
len = input.int(title="RSI Period", minval=1, defval=14)
src = input(title="RSI Source", defval=close)
lbR = input(title="Pivot Lookback Right", defval=5, display = display.none)
lbL = input(title="Pivot Lookback Left", defval=5, display = display.none)
rangeUpper = input(title="Max of Lookback Range", defval=60, display = display.none)
rangeLower = input(title="Min of Lookback Range", defval=5, display = display.none)
plotBull = input(title="Plot Bullish", defval=true, display = display.none)
plotHiddenBull = input(title="Plot Hidden Bullish", defval=false, display = display.none)
plotBear = input(title="Plot Bearish", defval=true, display = display.none)
plotHiddenBear = input(title="Plot Hidden Bearish", defval=false, display = display.none)
bearColor = color.red
bullColor = color.green
hiddenBullColor = color.new(color.green, 80)
hiddenBearColor = color.new(color.red, 80)
textColor = color.white
noneColor = color.new(color.white, 100)
osc = ta.rsi(src, len)

plot(osc, title="RSI", linewidth=2, color=#2962FF)
hline(50, title="Middle Line", color=#787B86, linestyle=hline.style_dotted)
obLevel = hline(70, title="Overbought", color=#787B86, linestyle=hline.style_dotted)
osLevel = hline(30, title="Oversold", color=#787B86, linestyle=hline.style_dotted)
fill(obLevel, osLevel, title="Background", color=color.rgb(33, 150, 243, 90))

plFound = na(ta.pivotlow(osc, lbL, lbR)) ? false : true
phFound = na(ta.pivothigh(osc, lbL, lbR)) ? false : true
_inRange(cond) =>
	bars = ta.barssince(cond == true)
	rangeLower <= bars and bars <= rangeUpper

//------------------------------------------------------------------------------
// Regular Bullish
// Osc: Higher Low
inRangePl = _inRange(plFound[1])
oscHL = osc[lbR] > ta.valuewhen(plFound, osc[lbR], 1) and inRangePl

// Price: Lower Low

priceLL = low[lbR] < ta.valuewhen(plFound, low[lbR], 1)
bullCondAlert = priceLL and oscHL and plFound
bullCond = plotBull and bullCondAlert

plot(
     plFound ? osc[lbR] : na,
     offset=-lbR,
     title="Regular Bullish",
     linewidth=2,
     color=(bullCond ? bullColor : noneColor),
	 display = display.pane,
	 editable = plotBull
     )

plotshape(
	 bullCond ? osc[lbR] : na,
	 offset=-lbR,
	 title="Regular Bullish Label",
	 text=" Bull ",
	 style=shape.labelup,
	 location=location.absolute,
	 color=bullColor,
	 textcolor=textColor,
	 editable = plotBull
	 )

//------------------------------------------------------------------------------
// Hidden Bullish
// Osc: Lower Low

oscLL = osc[lbR] < ta.valuewhen(plFound, osc[lbR], 1) and inRangePl

// Price: Higher Low

priceHL = low[lbR] > ta.valuewhen(plFound, low[lbR], 1)
hiddenBullCondAlert = priceHL and oscLL and plFound
hiddenBullCond = plotHiddenBull and hiddenBullCondAlert

plot(
	 plFound ? osc[lbR] : na,
	 offset=-lbR,
	 title="Hidden Bullish",
	 linewidth=2,
	 color=(hiddenBullCond ? hiddenBullColor : noneColor),
	 display = display.pane,
	 editable = plotHiddenBull
	 )

plotshape(
	 hiddenBullCond ? osc[lbR] : na,
	 offset=-lbR,
	 title="Hidden Bullish Label",
	 text=" H Bull ",
	 style=shape.labelup,
	 location=location.absolute,
	 color=bullColor,
	 textcolor=textColor,
	 editable = plotHiddenBull
	 )

//------------------------------------------------------------------------------
// Regular Bearish
// Osc: Lower High
inRangePh = _inRange(phFound[1])
oscLH = osc[lbR] < ta.valuewhen(phFound, osc[lbR], 1) and inRangePh

// Price: Higher High

priceHH = high[lbR] > ta.valuewhen(phFound, high[lbR], 1)

bearCondAlert = priceHH and oscLH and phFound
bearCond = plotBear and bearCondAlert

plot(
	 phFound ? osc[lbR] : na,
	 offset=-lbR,
	 title="Regular Bearish",
	 linewidth=2,
	 color=(bearCond ? bearColor : noneColor),
	 display = display.pane,
	 editable = plotBear
	 )

plotshape(
	 bearCond ? osc[lbR] : na,
	 offset=-lbR,
	 title="Regular Bearish Label",
	 text=" Bear ",
	 style=shape.labeldown,
	 location=location.absolute,
	 color=bearColor,
	 textcolor=textColor,
	 editable = plotBear
	 )

//------------------------------------------------------------------------------
// Hidden Bearish
// Osc: Higher High

oscHH = osc[lbR] > ta.valuewhen(phFound, osc[lbR], 1) and inRangePh

// Price: Lower High

priceLH = high[lbR] < ta.valuewhen(phFound, high[lbR], 1)

hiddenBearCondAlert = priceLH and oscHH and phFound
hiddenBearCond = plotHiddenBear and hiddenBearCondAlert

plot(
	 phFound ? osc[lbR] : na,
	 offset=-lbR,
	 title="Hidden Bearish",
	 linewidth=2,
	 color=(hiddenBearCond ? hiddenBearColor : noneColor),
	 display = display.pane,
	 editable = plotHiddenBear
	 )

plotshape(
	 hiddenBearCond ? osc[lbR] : na,
	 offset=-lbR,
	 title="Hidden Bearish Label",
	 text=" H Bear ",
	 style=shape.labeldown,
	 location=location.absolute,
	 color=bearColor,
	 textcolor=textColor,
	 editable = plotHiddenBear
	 )

alertcondition(bullCondAlert, title='Regular Bullish Divergence', message="Found a new Regular Bullish Divergence, `Pivot Lookback Right` number of bars to the left of the current bar")
alertcondition(hiddenBullCondAlert, title='Hidden Bullish Divergence', message='Found a new Hidden Bullish Divergence, `Pivot Lookback Right` number of bars to the left of the current bar')
alertcondition(bearCondAlert, title='Regular Bearish Divergence', message='Found a new Regular Bearish Divergence, `Pivot Lookback Right` number of bars to the left of the current bar')
alertcondition(hiddenBearCondAlert, title='Hidden Bearish Divergence', message='Found a new Hidden Bearish Divergence, `Pivot Lookback Right` number of bars to the left of the current bar')

------------------------
//@version=6
indicator(title="SMI Ergodic Indicator", shorttitle="SMII", format=format.price, precision=4, timeframe="", timeframe_gaps=true)
longlen = input.int(20, minval=1, title="Long Length")
shortlen = input.int(5, minval=1, title="Short Length")
siglen = input.int(5, minval=1, title="Signal Line Length")
erg = ta.tsi(close, shortlen, longlen)
sig = ta.ema(erg, siglen)
plot(erg, color=#2962FF, title="SMI")
plot(sig, color=#FF6D00, title="Signal")

------------------------
//@version=6
indicator("Supertrend", overlay = true, timeframe = "", timeframe_gaps = true)

atrPeriod = input.int(10,    "ATR Length", minval = 1)
factor =    input.float(3.0, "Factor",     minval = 0.01, step = 0.01)

[supertrend, direction] = ta.supertrend(factor, atrPeriod)

supertrend := barstate.isfirst ? na : supertrend
upTrend =    plot(direction < 0 ? supertrend : na, "Up Trend",   color = color.green, style = plot.style_linebr)
downTrend =  plot(direction < 0 ? na : supertrend, "Down Trend", color = color.red,   style = plot.style_linebr)
bodyMiddle = plot(barstate.isfirst ? na : (open + close) / 2, "Body Middle",display = display.none)

fill(bodyMiddle, upTrend,   title = "Uptrend background",   color = color.new(color.green, 90), fillgaps = false)
fill(bodyMiddle, downTrend, title = "Downtrend background", color = color.new(color.red,   90), fillgaps = false)

alertcondition(direction[1] > direction, title='Downtrend to Uptrend', message='The Supertrend value switched from Downtrend to Uptrend ')
alertcondition(direction[1] < direction, title='Uptrend to Downtrend', message='The Supertrend value switched from Uptrend to Downtrend')
alertcondition(direction[1] != direction, title='Trend Change', message='The Supertrend value switched from Uptrend to Downtrend or vice versa')

------------------------
//@version=6
indicator(title="Volume Weighted Moving Average", shorttitle="VWMA", overlay=true, timeframe="", timeframe_gaps=true)
len = input.int(20, "Length", minval=1)
src = input(close, "Source")
ma = ta.vwma(src, len)
offset = input.int(0, "Offset", minval = -500, maxval = 500)
plot(ma, title="VWMA", color=#2962FF, offset = offset)

------------------------
//@version=6
indicator(title = "Vortex Indicator", shorttitle="VI", format=format.price, precision=4, timeframe="", timeframe_gaps=true)
period_ = input.int(14, title="Length", minval=2)
VMP = math.sum( math.abs( high - low[1]), period_ )
VMM = math.sum( math.abs( low - high[1]), period_ )
STR = math.sum( ta.atr(1), period_ )
VIP = VMP / STR
VIM = VMM / STR
plot(VIP, title="VI +", color=#2962FF)
plot(VIM, title="VI -", color=#E91E63)

------------------------
//@version=6
indicator(title="Williams Alligator", shorttitle="Alligator", overlay=true, timeframe="", timeframe_gaps=true)
smma(src, length) =>
	smma =  0.0
	smma := na(smma[1]) ? ta.sma(src, length) : (smma[1] * (length - 1) + src) / length
	smma
jawLength = input.int(13, minval=1, title="Jaw Length")
teethLength = input.int(8, minval=1, title="Teeth Length")
lipsLength = input.int(5, minval=1, title="Lips Length")
jawOffset = input(8, title="Jaw Offset")
teethOffset = input(5, title="Teeth Offset")
lipsOffset = input(3, title="Lips Offset")
jaw = smma(hl2, jawLength)
teeth = smma(hl2, teethLength)
lips = smma(hl2, lipsLength)
plot(jaw, "Jaw", offset = jawOffset, color=#2962FF)
plot(teeth, "Teeth", offset = teethOffset, color=#E91E63)
plot(lips, "Lips", offset = lipsOffset, color=#66BB6A)

------------------------
//@version=6
indicator("Williams Percent Range", shorttitle="Williams %R", format=format.price, precision=2, timeframe="", timeframe_gaps=true)
length = input(title="Length", defval=14)
src = input(close, "Source")
_pr(length) =>
	max = ta.highest(length)
	min = ta.lowest(length)
	100 * (src - max) / (max - min)
percentR = _pr(length)
obPlot = hline(-20, title="Upper Band", color=#787B86)
hline(-50, title="Middle Level", linestyle=hline.style_dotted, color=#787B86)
osPlot = hline(-80, title="Lower Band", color=#787B86)
fill(obPlot, osPlot, title="Background", color=color.rgb(126, 87, 194, 90))
plot(percentR, title="%R", color=#7E57C2)

------------------------
//@version=6
indicator(title="Choppiness Index", shorttitle="CHOP", format=format.price, precision=2, timeframe="", timeframe_gaps=true)
length = input.int(14, minval=1)
ci = 100 * math.log10(math.sum(ta.atr(1), length) / (ta.highest(length) - ta.lowest(length))) / math.log10(length)
offset = input.int(0, "Offset",  minval = -500, maxval = 500)
plot(ci, "CHOP", color=#2962FF, offset = offset)
band1 = hline(61.8, "Upper Band", color=#787B86, linestyle=hline.style_dashed)
hline(50, "Middle Band", color=color.new(#787B86, 50))
band0 = hline(38.2, "Lower Band", color=#787B86, linestyle=hline.style_dashed)
fill(band1, band0, color = color.rgb(33, 150, 243, 90), title = "Background")

------------------------
//@version=6
indicator(title="Relative Volatility Index", shorttitle="RVI", format=format.price, precision=2, timeframe="", timeframe_gaps=true)
length = input.int(10, minval=1)
offset = input.int(0, "Offset", minval = -500, maxval = 500)
src = close
len = 14
stddev = ta.stdev(src, length)
upper = ta.ema(ta.change(src) <= 0 ? 0 : stddev, len)
lower = ta.ema(ta.change(src) > 0 ? 0 : stddev, len)
rvi = upper / (upper + lower) * 100

h0 = hline(80, "Upper Band", color=#787B86)
hline(50, "Middle Band", color=color.new(#787B86, 50))
h1 = hline(20, "Lower Band", color=#787B86)
fill(h0, h1, color=color.rgb(126, 87, 194, 90), title="Background")

plot(rvi, title="RVI", color=#7E57C2, offset = offset)

// Smoothing MA inputs
GRP = "Smoothing"
TT_BB = "Only applies when 'SMA + Bollinger Bands' is selected. Determines the distance between the SMA and the bands."
maTypeInput = input.string("SMA", "Type", options = ["None", "SMA", "SMA + Bollinger Bands", "EMA", "SMMA (RMA)", "WMA", "VWMA"], group = GRP, display = display.none)
var isBB = maTypeInput == "SMA + Bollinger Bands"
maLengthInput = input.int(14, "Length", group = GRP, display = display.none, active = maTypeInput != "None")
bbMultInput = input.float(2.0, "BB StdDev", minval = 0.001, maxval = 50, step = 0.5, tooltip = TT_BB, group = GRP, display = display.none, active = isBB)
var enableMA = maTypeInput != "None"

// Smoothing MA Calculation
ma(source, length, MAtype) =>
	switch MAtype
		"SMA"                   => ta.sma(source, length)
		"SMA + Bollinger Bands" => ta.sma(source, length)
		"EMA"                   => ta.ema(source, length)
		"SMMA (RMA)"            => ta.rma(source, length)
		"WMA"                   => ta.wma(source, length)
		"VWMA"                  => ta.vwma(source, length)

// Smoothing MA plots
smoothingMA = enableMA ? ma(rvi, maLengthInput, maTypeInput) : na
smoothingStDev = isBB ? ta.stdev(rvi, maLengthInput) * bbMultInput : na
plot(smoothingMA, "RVI-based MA", color=color.yellow, display = enableMA ? display.all : display.none, editable = enableMA)
bbUpperBand = plot(smoothingMA + smoothingStDev, title = "Upper Bollinger Band", color=color.green, display = isBB ? display.all : display.none, editable = isBB)
bbLowerBand = plot(smoothingMA - smoothingStDev, title = "Lower Bollinger Band", color=color.green, display = isBB ? display.all : display.none, editable = isBB)
fill(bbUpperBand, bbLowerBand, color= isBB ? color.new(color.green, 90) : na, title="Bollinger Bands Background Fill", display = isBB ? display.all : display.none, editable = isBB)

------------------------
//@version=6
indicator(title="Stochastic RSI", shorttitle="Stoch RSI", format=format.price, precision=2, timeframe="", timeframe_gaps=true)
smoothK = input.int(3, "K", minval=1)
smoothD = input.int(3, "D", minval=1)
lengthRSI = input.int(14, "RSI Length", minval=1)
lengthStoch = input.int(14, "Stochastic Length", minval=1)
src = input(close, title="RSI Source")
rsi1 = ta.rsi(src, lengthRSI)
k = ta.sma(ta.stoch(rsi1, rsi1, rsi1, lengthStoch), smoothK)
d = ta.sma(k, smoothD)
plot(k, "K", color=#2962FF)
plot(d, "D", color=#FF6D00)
h0 = hline(80, "Upper Band", color=#787B86)
hline(50, "Middle Band", color=color.new(#787B86, 50))
h1 = hline(20, "Lower Band", color=#787B86)
fill(h0, h1, color=color.rgb(33, 150, 243, 90), title="Background")

------------------------
//@version=6
indicator(title="Awesome Oscillator", shorttitle="AO", timeframe="", timeframe_gaps=true)
ao = ta.sma(hl2,5) - ta.sma(hl2,34)
diff = ao - ao[1]
plot(ao, "AO", color = diff <= 0 ? #F44336 : #009688, style = plot.style_columns)
changeToGreen = ta.crossover(diff, 0)
changeToRed = ta.crossunder(diff, 0)
alertcondition(changeToGreen, title = "AO color changed to green", message = "Awesome Oscillator's color has changed to green")
alertcondition(changeToRed, title = "AO color changed to red", message = "Awesome Oscillator's color has changed to red")

------------------------
//@version=6
indicator(title="Directional Movement Index", shorttitle="DMI", format=format.price, precision=4, timeframe="", timeframe_gaps=true)

TT_ADX_LEN = "The time period to be used in calculating the ADX which has a smoothing component."
TT_DI_LEN  = "The time period to be used in calculating the DI (Directional Indicator)."

lensig = input.int(14, "ADX Smoothing", minval = 1, tooltip = TT_ADX_LEN)
len =    input.int(14, "DI Length",     minval = 1, tooltip = TT_DI_LEN)

up = ta.change(high)
down = -ta.change(low)
plusDM = na(up) ? na : (up > down and up > 0 ? up : 0)
minusDM = na(down) ? na : (down > up and down > 0 ? down : 0)
trur = ta.rma(ta.tr, len)
plus = fixnan(100 * ta.rma(plusDM, len) / trur)
minus = fixnan(100 * ta.rma(minusDM, len) / trur)
sum = plus + minus
adx = 100 * ta.rma(math.abs(plus - minus) / (sum == 0 ? 1 : sum), lensig)
plot(adx, color=#F50057, title="ADX")
plot(plus, color=#2962FF, title="+DI")
plot(minus, color=#FF6D00, title="-DI")

------------------------
//@version=6
indicator("Average Directional Index", shorttitle="ADX", format=format.price, precision=2, timeframe="", timeframe_gaps=true)

TT_ADX_LEN = "The time period to be used in calculating the ADX which has a smoothing component."
TT_DI_LEN  = "The time period to be used in calculating the DI (Directional Indicator)."

adxlen = input(14, title = "ADX Smoothing",  tooltip = TT_ADX_LEN)
dilen =  input(14, title = "DI Length",      tooltip = TT_DI_LEN)

dirmov(len) =>
	up = ta.change(high)
	down = -ta.change(low)
	plusDM = na(up) ? na : (up > down and up > 0 ? up : 0)
	minusDM = na(down) ? na : (down > up and down > 0 ? down : 0)
	truerange = ta.rma(ta.tr, len)
	plus = fixnan(100 * ta.rma(plusDM, len) / truerange)
	minus = fixnan(100 * ta.rma(minusDM, len) / truerange)
	[plus, minus]
adx(dilen, adxlen) =>
	[plus, minus] = dirmov(dilen)
	sum = plus + minus
	adx = 100 * ta.rma(math.abs(plus - minus) / (sum == 0 ? 1 : sum), adxlen)
sig = adx(dilen, adxlen)
plot(sig, color=color.red, title="ADX")

------------------------
//@version=6
indicator(title="Money Flow Index", shorttitle="MFI", format=format.price, precision=2, timeframe="", timeframe_gaps=true)
length = input.int(title="Length", defval=14, minval=1, maxval=2000)
src = hlc3
mf = ta.mfi(src, length)
plot(mf, "MF", color=#7E57C2)
overbought=hline(80, title="Overbought", color=#787B86)
hline(50, "Middle Band", color=color.new(#787B86, 50))
oversold=hline(20, title="Oversold", color=#787B86)
fill(overbought, oversold, color=color.rgb(126, 87, 194, 90), title="Background")

------------------------
//@version=6
indicator(title="Donchian Channels", shorttitle="DC", overlay=true, timeframe="", timeframe_gaps=true)
length = input.int(20, minval = 1)
offset = input.int(0, "Offset")
lower =  ta.lowest(length)
upper =  ta.highest(length)
basis =  math.avg(upper, lower)
plot(basis,     "Basis", color = #FF6D00, offset = offset)
u = plot(upper, "Upper", color = #2962FF, offset = offset)
l = plot(lower, "Lower", color = #2962FF, offset = offset)
fill(u, l, color = color.rgb(33, 150, 243, 95), title = "Background")

------------------------
//@version=6
indicator(title="Commodity Channel Index", shorttitle="CCI", format=format.price, precision=2, timeframe="", timeframe_gaps=true)
length = input.int(20, minval=1)
src = input(hlc3, title="Source")
ma = ta.sma(src, length)
cci = (src - ma) / (0.015 * ta.dev(src, length))
plot(cci, "CCI", color=#2962FF)
band1 = hline(100, "Upper Band", color=#787B86, linestyle=hline.style_dashed)
hline(0, "Middle Band", color=color.new(#787B86, 50))
band0 = hline(-100, "Lower Band", color=#787B86, linestyle=hline.style_dashed)
fill(band1, band0, color=color.rgb(33, 150, 243, 90), title="Background")

// Smoothing MA inputs
GRP = "Smoothing"
TT_BB = "Only applies when 'SMA + Bollinger Bands' is selected. Determines the distance between the SMA and the bands."
maTypeInput = input.string("SMA", "Type", options = ["None", "SMA", "SMA + Bollinger Bands", "EMA", "SMMA (RMA)", "WMA", "VWMA"], group = GRP, display = display.none)
var isBB = maTypeInput == "SMA + Bollinger Bands"
maLengthInput = input.int(14, "Length", group = GRP, display = display.none, active = maTypeInput != "None")
bbMultInput = input.float(2.0, "BB StdDev", minval = 0.001, maxval = 50, step = 0.5, tooltip = TT_BB, group = GRP, display = display.none, active = isBB)
var enableMA = maTypeInput != "None"

// Smoothing MA Calculation
ma(source, length, MAtype) =>
	switch MAtype
		"SMA"                   => ta.sma(source, length)
		"SMA + Bollinger Bands" => ta.sma(source, length)
		"EMA"                   => ta.ema(source, length)
		"SMMA (RMA)"            => ta.rma(source, length)
		"WMA"                   => ta.wma(source, length)
		"VWMA"                  => ta.vwma(source, length)

// Smoothing MA plots
smoothingMA = enableMA ? ma(cci, maLengthInput, maTypeInput) : na
smoothingStDev = isBB ? ta.stdev(cci, maLengthInput) * bbMultInput : na
plot(smoothingMA, "CCI-based MA", color=color.yellow, display = enableMA ? display.all : display.none, editable = enableMA)
bbUpperBand = plot(smoothingMA + smoothingStDev, title = "Upper Bollinger Band", color=color.green, display = isBB ? display.all : display.none, editable = isBB)
bbLowerBand = plot(smoothingMA - smoothingStDev, title = "Lower Bollinger Band", color=color.green, display = isBB ? display.all : display.none, editable = isBB)
fill(bbUpperBand, bbLowerBand, color= isBB ? color.new(color.green, 90) : na, title="Bollinger Bands Background Fill", display = isBB ? display.all : display.none, editable = isBB)

------------------------
//@version=6
indicator(title="Mass Index", format=format.price, precision=2, timeframe="", timeframe_gaps=true)
length = input.int(10, minval=1)
span = high - low
mi = math.sum(ta.ema(span, 9) / ta.ema(ta.ema(span, 9), 9), length)
plot(mi, "Mass Index")

------------------------
//@version=6
indicator("Cumulative Volume Index", "CVI", format=format.volume)
NYSE = "NYSE"
NASDAQ = "NASDAQ"
AMEX = "AMEX"
ARCX = "ARCX"
US = "US Total"
DJ = "DJ"
exch = input.string(NYSE, title="Exchange",
     options=[NYSE, NASDAQ, AMEX, ARCX, US, DJ])
adv_ticker =
     exch == DJ ? "UPVOL.DJ" :
     exch == US ? "UPVOL.US" :
     exch == ARCX ? "UPVOL.AX" :
     exch == AMEX ? "UPVOL.AM" :
     exch == NASDAQ ? "UPVOL.NQ" :
	 "UPVOL.NY"
dec_ticker =
     exch == DJ ? "DNVOL.DJ" :
     exch == US ? "DNVOL.US" :
     exch == ARCX ? "DNVOL.AX" :
     exch == AMEX ? "DNVOL.AM" :
     exch == NASDAQ ? "DNVOL.NQ" :
     "DNVOL.NY"
adv = request.security(adv_ticker, timeframe.period, close)
dec = request.security(dec_ticker, timeframe.period, close)
cvi = ta.cum(adv - dec)
plot(cvi, "CVI")

------------------------
//@version=6
indicator(title="Elder Force Index", shorttitle="EFI", format=format.volume, timeframe="", timeframe_gaps=true)
var cumVol = 0.
cumVol += nz(volume)
if barstate.islast and cumVol == 0
    runtime.error("No volume is provided by the data vendor.")
length = input.int(13, minval=1)
efi = ta.ema(ta.change(close) * volume, length)
plot(efi, color=#F44336, title="Elder Force Index")
hline(0, color=#787B86, title="Zero")

------------------------
//@version=6
indicator(title="McGinley Dynamic", overlay=true, timeframe="", timeframe_gaps=true)
length = input.int(14, minval=1)
source = close
mg = 0.0
mg := na(mg[1]) ? ta.ema(source, length) : mg[1] + (source - mg[1]) / (length * math.pow(source/mg[1], 4))
plot(mg, "McGinley Dynamic")

------------------------
//@version=6
indicator("True Strength Index", shorttitle="TSI", format=format.price, precision=4, timeframe="", timeframe_gaps=true)
long = input(title="Long Length", defval=25)
short = input(title="Short Length", defval=13)
signal = input(title="Signal Length", defval=13)
price = close
double_smooth(src, long, short) =>
	fist_smooth = ta.ema(src, long)
	ta.ema(fist_smooth, short)
pc = ta.change(price)
double_smoothed_pc = double_smooth(pc, long, short)
double_smoothed_abs_pc = double_smooth(math.abs(pc), long, short)
tsi_value = 100 * (double_smoothed_pc / double_smoothed_abs_pc)
plot(tsi_value, title="True Strength Index", color=#2962FF)
plot(ta.ema(tsi_value, signal), title="Signal", color=#E91E63)
hline(0, title="Zero", color=#787B86)

------------------------
//@version=6
indicator(title="Relative Strength Index", shorttitle="RSI", format=format.price, precision=2, timeframe="", timeframe_gaps=true)

rsiLengthInput = input.int(14, minval=1, title="RSI Length", group="RSI Settings")
rsiSourceInput = input.source(close, "Source", group="RSI Settings")
calculateDivergence = input.bool(false, title="Calculate Divergence", group="RSI Settings", display = display.none, tooltip = "Calculating divergences is needed in order for divergence alerts to fire.")

change = ta.change(rsiSourceInput)
up = ta.rma(math.max(change, 0), rsiLengthInput)
down = ta.rma(-math.min(change, 0), rsiLengthInput)
rsi = down == 0 ? 100 : up == 0 ? 0 : 100 - (100 / (1 + up / down))

rsiPlot = plot(rsi, "RSI", color=#7E57C2)
rsiUpperBand = hline(70, "RSI Upper Band", color=#787B86)
midline = hline(50, "RSI Middle Band", color=color.new(#787B86, 50))
rsiLowerBand = hline(30, "RSI Lower Band", color=#787B86)
fill(rsiUpperBand, rsiLowerBand, color=color.rgb(126, 87, 194, 90), title="RSI Background Fill")
midLinePlot = plot(50, color = na, editable = false, display = display.none)
fill(rsiPlot, midLinePlot, 100, 70, top_color = color.new(color.green, 0), bottom_color = color.new(color.green, 100),  title = "Overbought Gradient Fill")
fill(rsiPlot, midLinePlot, 30,  0,  top_color = color.new(color.red, 100), bottom_color = color.new(color.red, 0),      title = "Oversold Gradient Fill")

// Smoothing MA inputs
GRP = "Smoothing"
TT_BB = "Only applies when 'SMA + Bollinger Bands' is selected. Determines the distance between the SMA and the bands."
maTypeInput = input.string("SMA", "Type", options = ["None", "SMA", "SMA + Bollinger Bands", "EMA", "SMMA (RMA)", "WMA", "VWMA"], group = GRP, display = display.none)
var isBB = maTypeInput == "SMA + Bollinger Bands"
maLengthInput = input.int(14, "Length", group = GRP, display = display.none, active = maTypeInput != "None")
bbMultInput = input.float(2.0, "BB StdDev", minval = 0.001, maxval = 50, step = 0.5, tooltip = TT_BB, group = GRP, display = display.none, active = isBB)
var enableMA = maTypeInput != "None"

// Smoothing MA Calculation
ma(source, length, MAtype) =>
	switch MAtype
		"SMA"                   => ta.sma(source, length)
		"SMA + Bollinger Bands" => ta.sma(source, length)
		"EMA"                   => ta.ema(source, length)
		"SMMA (RMA)"            => ta.rma(source, length)
		"WMA"                   => ta.wma(source, length)
		"VWMA"                  => ta.vwma(source, length)

// Smoothing MA plots
smoothingMA = enableMA ? ma(rsi, maLengthInput, maTypeInput) : na
smoothingStDev = isBB ? ta.stdev(rsi, maLengthInput) * bbMultInput : na
plot(smoothingMA, "RSI-based MA", color=color.yellow, display = enableMA ? display.all : display.none, editable = enableMA)
bbUpperBand = plot(smoothingMA + smoothingStDev, title = "Upper Bollinger Band", color=color.green, display = isBB ? display.all : display.none, editable = isBB)
bbLowerBand = plot(smoothingMA - smoothingStDev, title = "Lower Bollinger Band", color=color.green, display = isBB ? display.all : display.none, editable = isBB)
fill(bbUpperBand, bbLowerBand, color= isBB ? color.new(color.green, 90) : na, title="Bollinger Bands Background Fill", display = isBB ? display.all : display.none, editable = isBB)

// Divergence
lookbackRight = 5
lookbackLeft = 5
rangeUpper = 60
rangeLower = 5
bearColor = color.red
bullColor = color.green
textColor = color.white
noneColor = color.new(color.white, 100)

_inRange(bool cond) =>
    bars = ta.barssince(cond)
    rangeLower <= bars and bars <= rangeUpper

plFound = false
phFound = false

bullCond = false
bearCond = false

rsiLBR = rsi[lookbackRight]

if calculateDivergence
    //------------------------------------------------------------------------------
    // Regular Bullish
    // rsi: Higher Low
    plFound := not na(ta.pivotlow(rsi, lookbackLeft, lookbackRight))    
    rsiHL = rsiLBR > ta.valuewhen(plFound, rsiLBR, 1) and _inRange(plFound[1])
    // Price: Lower Low
    lowLBR = low[lookbackRight]
    priceLL = lowLBR < ta.valuewhen(plFound, lowLBR, 1)
    bullCond := priceLL and rsiHL and plFound

    //------------------------------------------------------------------------------
    // Regular Bearish
    // rsi: Lower High
    phFound := not na(ta.pivothigh(rsi, lookbackLeft, lookbackRight))
    rsiLH = rsiLBR < ta.valuewhen(phFound, rsiLBR, 1) and _inRange(phFound[1])
    // Price: Higher High
    highLBR = high[lookbackRight]
    priceHH = highLBR > ta.valuewhen(phFound, highLBR, 1)
    bearCond := priceHH and rsiLH and phFound


plot(
     plFound   ? rsiLBR : na,
     offset    = -lookbackRight,
     title     = "Regular Bullish",
     linewidth = 2,
     color     = (bullCond ? bullColor : noneColor),
     display   = display.pane,
     editable  = calculateDivergence)

plotshape(
     bullCond  ? rsiLBR : na,
     offset    = -lookbackRight,
     title     = "Regular Bullish Label",
     text      = " Bull ",
     style     = shape.labelup,
     location  = location.absolute,
     color     = bullColor,
     textcolor = textColor,
     display   = display.pane,
     editable  = calculateDivergence)

plot(
     phFound   ? rsiLBR : na,
     offset    = -lookbackRight,
     title     = "Regular Bearish",
     linewidth = 2,
     color     = (bearCond ? bearColor : noneColor),
     display   = display.pane,
     editable  = calculateDivergence)

plotshape(
     bearCond  ? rsiLBR : na,
     offset    = -lookbackRight,
     title     = "Regular Bearish Label",
     text      = " Bear ",
     style     = shape.labeldown,
     location  = location.absolute,
     color     = bearColor,
     textcolor = textColor,
     display   = display.pane,
     editable  = calculateDivergence)

alertcondition(bullCond, title='Regular Bullish Divergence', message="Found a new Regular Bullish Divergence, `Pivot Lookback Right` number of bars to the left of the current bar.")
alertcondition(bearCond, title='Regular Bearish Divergence', message='Found a new Regular Bearish Divergence, `Pivot Lookback Right` number of bars to the left of the current bar.')

------------------------
//@version=6
indicator("Trend Strength Index", shorttitle="TSI", format=format.price, precision=2, timeframe="", timeframe_gaps=true)

period = input.int(14, "Length", minval = 2)
tsi    = ta.correlation(close, bar_index, period)

bullishColorInput = input.color(color.new(#089981, 90), "Bullish Color")
bearishColorInput = input.color(color.new(#F23645, 90), "Bearish Color")

tsiPlot = plot(tsi, "Trend Strength Index",  color = #7E57C2)
hline( 0,           "TSI Middle Band",       color = color.new(#787B86, 50))
hline( 1,           "TSI Bullish Band",      color = color.new(bullishColorInput, 0))
hline(-1,           "TSI Bearish Band",      color = color.new(bearishColorInput, 0))

midLinePlot = plot(0, color = na, editable = false, display = display.none)
fill(tsiPlot, midLinePlot, 1,  0, top_color = bullishColorInput,  bottom_color = color.new(bullishColorInput, 100), title = "Bullish Gradient Fill")
fill(tsiPlot, midLinePlot, 0, -1, top_color = color.new(bearishColorInput, 100), bottom_color = bearishColorInput,  title = "Bearish Gradient Fill")

------------------------
//@version=6
indicator("Rank Correlation Index", "RCI", precision = 2, timeframe = "", timeframe_gaps = true)

source = input.source(close, title = "Source")
length = input.int(10, title = "RCI Length", minval = 1)

src = ta.rci(source, length)

plot(src, title = "RCI", color = color.blue)

hline(0, "Middle band")
upper = hline(80, "Upper band")
lower = hline(-80, "Lower band")
fill(upper, lower, color.new(color.blue, 90))

// Smoothing MA inputs
GRP = "Smoothing"
TT_BB = "Only applies when 'SMA + Bollinger Bands' is selected. Determines the distance between the SMA and the bands."
maTypeInput = input.string("SMA", "Type", options = ["None", "SMA", "SMA + Bollinger Bands", "EMA", "SMMA (RMA)", "WMA", "VWMA"], group = GRP, display = display.none)
var isBB = maTypeInput == "SMA + Bollinger Bands"
maLengthInput = input.int(14, "Length", group = GRP, display = display.none, active = maTypeInput != "None")
bbMultInput = input.float(2.0, "BB StdDev", minval = 0.001, maxval = 50, step = 0.5, tooltip = TT_BB, group = GRP, display = display.none, active = isBB)
var enableMA = maTypeInput != "None"

// Smoothing MA Calculation
ma(source, length, MAtype) =>
	switch MAtype
		"SMA"                   => ta.sma(source, length)
		"SMA + Bollinger Bands" => ta.sma(source, length)
		"EMA"                   => ta.ema(source, length)
		"SMMA (RMA)"            => ta.rma(source, length)
		"WMA"                   => ta.wma(source, length)
		"VWMA"                  => ta.vwma(source, length)

// Smoothing MA plots
smoothingMA = enableMA ? ma(src, maLengthInput, maTypeInput) : na
smoothingStDev = isBB ? ta.stdev(src, maLengthInput) * bbMultInput : na
plot(smoothingMA, "RCI-based MA", color=color.yellow, display = enableMA ? display.all : display.none, editable = enableMA)
bbUpperBand = plot(smoothingMA + smoothingStDev, title = "Upper Bollinger Band", color=color.green, display = isBB ? display.all : display.none, editable = isBB)
bbLowerBand = plot(smoothingMA - smoothingStDev, title = "Lower Bollinger Band", color=color.green, display = isBB ? display.all : display.none, editable = isBB)
fill(bbUpperBand, bbLowerBand, color= isBB ? color.new(color.green, 90) : na, title="Bollinger Bands Background Fill", display = isBB ? display.all : display.none, editable = isBB)

------------------------
//@version=6
indicator(title="Relative Vigor Index", shorttitle="RVGI", format=format.price, precision=4, timeframe="", timeframe_gaps=true)
len = input.int(10, title="Length", minval=1)
rvi = math.sum(ta.swma(close-open), len)/math.sum(ta.swma(high-low),len)
sig = ta.swma(rvi)
offset = input.int(0, "Offset", minval = -500, maxval = 500, display = display.none)
plot(rvi, color=#008000, title="RVGI", offset = offset)
plot(sig, color=#FF0000, title="Signal", offset = offset)

------------------------
//@version=6
indicator("Stochastic Momentum Index", "SMI", timeframe = "", timeframe_gaps = true)

lengthK   = input.int(10, "%K Length",  minval = 1, maxval = 15000)
lengthD   = input.int(3,  "%D Length",  minval = 1, maxval = 4999)
lengthEMA = input.int(3,  "EMA Length", minval = 1, maxval = 4999)

emaEma(source, length) => ta.ema(ta.ema(source, length), length)

highestHigh = ta.highest(lengthK)
lowestLow =   ta.lowest(lengthK)
highestLowestRange = highestHigh - lowestLow
relativeRange = close - (highestHigh + lowestLow) / 2
smi = 200 * (emaEma(relativeRange, lengthD) / emaEma(highestLowestRange, lengthD))

smiPlot = plot(smi, "SMI", color = color.blue)
plot(ta.ema(smi, lengthEMA), "SMI-based EMA", color = color.orange)

overbought = hline(40, "Overbought Line")
oversold   = hline(-40, "Oversold Line")
fill(overbought, oversold, title = "Background", color = color.new(color.blue, 90))
hline(0, "Middle Line", color = color.new(color.gray, 50))


midLinePlot = plot(0, color = na, editable = false, display = display.none)
fill(smiPlot, midLinePlot, 120,  40,   top_color = color.new(#4caf4f, 50),    bottom_color = color.new(color.green, 100), title = "Overbought Gradient Fill")
fill(smiPlot, midLinePlot, -40, -120,  top_color = color.new(color.red, 100), bottom_color = color.new(color.red, 50),    title = "Oversold Gradient Fill")

------------------------
//@version=6
indicator(title = "Chande Kroll Stop", overlay=true, timeframe="", timeframe_gaps=true)
p = input.int(10, minval=1, title="ATR Length (p)")
x = input.int(1, minval=1, title="ATR Coefficient (x)")
q = input.int(9, minval=1, title="Stop Length (q)")
first_high_stop = ta.highest(high, p) - x * ta.atr(p)
first_low_stop = ta.lowest(low, p) + x * ta.atr(p)
stop_short = ta.highest(first_high_stop, q)
stop_long = ta.lowest(first_low_stop, q)
plot(stop_long, color=#2962FF, title="Stop Long")
plot(stop_short, color=#FF6D00, title="Stop Short")

------------------------
//@version=6
indicator(title="Connors RSI", shorttitle="CRSI", format=format.price, precision=2, timeframe="", timeframe_gaps=true)
src = close
lenrsi = input(3, "RSI Length")
lenupdown = input(2, "UpDown Length")
lenroc = input(100, "ROC Length")
updown(s) =>
	isEqual = s == s[1]
	isGrowing = s > s[1]
	ud = 0.0
	ud := isEqual ? 0 : isGrowing ? (nz(ud[1]) <= 0 ? 1 : nz(ud[1])+1) : (nz(ud[1]) >= 0 ? -1 : nz(ud[1])-1)
	ud
rsi = ta.rsi(src, lenrsi)
updownrsi = ta.rsi(updown(src), lenupdown)
percentrank = ta.percentrank(ta.roc(src, 1), lenroc)
crsi = math.avg(rsi, updownrsi, percentrank)
plot(crsi, "CRSI", #2962FF)
band1 = hline(70, "Upper Band", color = #787B86)
hline(50, "Middle Band", color=color.new(#787B86, 50))
band0 = hline(30, "Lower Band",  color = #787B86)
fill(band1, band0, color.rgb(33, 150, 243, 90), title = "Background")

------------------------
//@version=6
indicator(shorttitle="BB", title="Bollinger Bands", overlay=true, timeframe="", timeframe_gaps=true)

TT_LENGTH  = "The time period to be used in calculating the MA which creates the base for the Upper and Lower Bands."
TT_MA_TYPE = "Determines the type of Moving Average that is applied to the basis plot line."
TT_SOURCE  = "Determines what data from each bar will be used in calculations."
TT_MULT    = "The number of Standard Deviations away from the MA that the Upper and Lower Bands should be."
TT_OFFSET  = "Changing this number will move the Bollinger Bands either Forwards or Backwards relative to the current market."

length = input.int(20,       "Length", minval = 1, tooltip =  TT_LENGTH)
maType = input.string("SMA", "Basis MA Type",      options = ["SMA", "EMA", "SMMA (RMA)", "WMA", "VWMA"], tooltip = TT_MA_TYPE)
src =    input(close,        "Source", tooltip = TT_SOURCE)
mult =   input.float(2.0,    "StdDev", minval = 0.001, maxval = 50,  tooltip = TT_MULT)
offset = input.int(0,        "Offset", minval = -500,  maxval = 500, tooltip =  TT_OFFSET, display = display.none)

ma(source, length, _type) =>
    switch _type
        "SMA" => ta.sma(source, length)
        "EMA" => ta.ema(source, length)
        "SMMA (RMA)" => ta.rma(source, length)
        "WMA" => ta.wma(source, length)
        "VWMA" => ta.vwma(source, length)

basis = ma(src, length, maType)
dev = mult * ta.stdev(src, length)
upper = basis + dev
lower = basis - dev

plot(basis, "Basis", color=#2962FF, offset = offset)
p1 = plot(upper, "Upper", color=#F23645, offset = offset)
p2 = plot(lower, "Lower", color=#089981, offset = offset)
fill(p1, p2, title = "Background", color=color.rgb(33, 150, 243, 95))

------------------------
//@version=6
indicator(title = "Bollinger Bands %b", shorttitle = "BB %b", format=format.price, precision=2, timeframe="", timeframe_gaps=true)

string TT_LENGTH = "The time period to be used in calculating the SMA which creates the base for the Upper and Lower Bands"
string TT_SOURCE = "Determines what data from each bar will be used in calculations."
string TT_MULT   = "The number of Standard Deviations away from the SMA that the Upper and Lower Bands should be."

length = input.int(20,       "Length", minval = 1, tooltip = TT_LENGTH)
src    = input(close,        "Source",             tooltip = TT_SOURCE)
mult   = input.float(2.0,    "StdDev", minval = 0.001, maxval = 50, tooltip = TT_MULT)

basis = ta.sma(src, length)
dev = mult * ta.stdev(src, length)
upper = basis + dev
lower = basis - dev
bbr = (src - lower)/(upper - lower)
plot(bbr, "Bollinger Bands %b", color=#2962FF)

bandTop = hline(100, display = display.none, editable = false)
band1 = hline(1, "Overbought", color = color.new(#F23645, 50), linestyle=hline.style_dashed)
hline(0.5, "Middle Band", color=color.new(#2962FF, 50))
band0 = hline(0, "Oversold", color.new(#089981, 50), linestyle=hline.style_dashed)
bandBottom = hline(-100, display = display.none, editable = false)

fill(band1, band0, title="Middle Background", color = color.new(#2962FF, 90))
fill(bandTop, band1, title = "Overbought background", color = color.new(#F23645, 90))
fill(band0, bandBottom, title = "Oversold background", color = color.new(#089981, 90))

------------------------
//@version=6
indicator("Moving Average Ribbon", shorttitle = "MA Ribbon", overlay = true, timeframe = "", timeframe_gaps = true)

ma(source, length, MAtype) =>
    switch MAtype
        "SMA"        => ta.sma(source,  length) 
        "EMA"        => ta.ema(source,  length) 
        "SMMA (RMA)" => ta.rma(source,  length) 
        "WMA"        => ta.wma(source,  length) 
        "VWMA"       => ta.vwma(source, length) 
        => na

show_ma1   = input(true,         "MA #1", inline = "MA #1", display = display.none)
ma1_type   = input.string("SMA", "",      inline = "MA #1", active = show_ma1, options = ["SMA", "EMA", "SMMA (RMA)", "WMA", "VWMA"])
ma1_source = input(close,        "",      inline = "MA #1", active = show_ma1, display = display.none)
ma1_length = input.int(20,       "",      inline = "MA #1", active = show_ma1, minval  = 1)
ma1_color  = input(#f6c309,    "",      inline = "MA #1", active = show_ma1, display = display.none)

show_ma2   = input(true,         "MA #2", inline = "MA #2", display = display.none)
ma2_type   = input.string("SMA", "",      inline = "MA #2", active = show_ma2, options = ["SMA", "EMA", "SMMA (RMA)", "WMA", "VWMA"])
ma2_source = input(close,        "",      inline = "MA #2", active = show_ma2, display = display.none)
ma2_length = input.int(50,       "",      inline = "MA #2", active = show_ma2, minval  = 1)
ma2_color  = input(#fb9800,    "",      inline = "MA #2", active = show_ma2, display = display.none)

show_ma3   = input(true,         "MA #3", inline = "MA #3", display = display.none)
ma3_type   = input.string("SMA", "",      inline = "MA #3", active = show_ma3, options = ["SMA", "EMA", "SMMA (RMA)", "WMA", "VWMA"])
ma3_source = input(close,        "",      inline = "MA #3", active = show_ma3, display = display.none)
ma3_length = input.int(100,      "",      inline = "MA #3", active = show_ma3, minval  = 1)
ma3_color  = input(#fb6500,    "",      inline = "MA #3", active = show_ma3, display = display.none)

show_ma4   = input(true,         "MA #4", inline = "MA #4", display = display.none)
ma4_type   = input.string("SMA", "",      inline = "MA #4", active = show_ma4, options = ["SMA", "EMA", "SMMA (RMA)", "WMA", "VWMA"])
ma4_source = input(close,        "",      inline = "MA #4", active = show_ma4, display = display.none)
ma4_length = input.int(200,      "",      inline = "MA #4", active = show_ma4, minval  = 1)
ma4_color  = input(#f60c0c,    "",      inline = "MA #4", active = show_ma4, display = display.none)

ma1 = show_ma1 ? ma(ma1_source, ma1_length, ma1_type) : na
ma2 = show_ma2 ? ma(ma2_source, ma2_length, ma2_type) : na
ma3 = show_ma3 ? ma(ma3_source, ma3_length, ma3_type) : na
ma4 = show_ma4 ? ma(ma4_source, ma4_length, ma4_type) : na

plot(ma1, "MA #1", ma1_color, display = show_ma1 ? display.all : display.none)
plot(ma2, "MA #2", ma2_color, display = show_ma2 ? display.all : display.none)
plot(ma3, "MA #3", ma3_color, display = show_ma3 ? display.all : display.none)
plot(ma4, "MA #4", ma4_color, display = show_ma4 ? display.all : display.none)

------------------------
//@version=6
indicator("Technical Ratings", "Technicals", precision = 2)

import TradingView/TechnicalRating/3 as TVtr

// Constants
float LEVEL_STRONG = 0.5
float LEVEL_WEAK   = 0.1

string PC_TT = "If enabled and the indicator's timeframe is higher than the chart's, the plotted rating and alert"
 + " conditions update only after a bar on that timeframe is confirmed. Otherwise, they also update during open bars on"
 + " the timeframe. Does not affect the table display."

// Inputs
string timeframe     = input.timeframe("", "Indicator Timeframe")
string ratingSignal  = input.string("All", "Rating is based on", options = ["MAs", "Oscillators", "All"])
bool   plotConfirmed = input.bool(false, "Plot confirmed ratings only", tooltip = PC_TT)

string GRP1    = "Show MTF"
bool   useMtf1 = input(false,           "", inline = "mtf1", group = GRP1)
string mtf1    = input.timeframe("60",  "", inline = "mtf1", group = GRP1, active = useMtf1)
bool   useMtf2 = input(false,           "", inline = "mtf2", group = GRP1)
string mtf2    = input.timeframe("240", "", inline = "mtf2", group = GRP1, active = useMtf2)
bool   useMtf3 = input(true,            "", inline = "mtf3", group = GRP1)
string mtf3    = input.timeframe("1D",  "", inline = "mtf3", group = GRP1, active = useMtf3)
bool   useMtf4 = input(true,            "", inline = "mtf4", group = GRP1)
string mtf4    = input.timeframe("1W",  "", inline = "mtf4", group = GRP1, active = useMtf4)
bool   useMtf5 = input(true,            "", inline = "mtf5", group = GRP1)
string mtf5    = input.timeframe("1M",  "", inline = "mtf5", group = GRP1, active = useMtf5)

string GRP2            = "Table Settings"
string tableSizeInput  = input.string("small", "Size      ", inline = "Table Size",  group = GRP2, options = ["tiny", "small", "normal", "large", "huge", "auto"])
string tableYPosInput  = input.string("middle", "Position ", inline = "Table Pos",   group = GRP2, options = ["top", "middle", "bottom"])
string tableXPosInput  = input.string("right", "",           inline = "Table Pos",   group = GRP2, options = ["left", "center", "right"])
color  colText         = input(#ffffff, "Text     ",       inline = "Text Color",  group = GRP2)
color  colBuy          = input(#5b9cf6, "Buy  ",           inline = "Buy Colors",  group = GRP2)
color  colStrongBuy    = input(#2962ff, "",                inline = "Buy Colors",  group = GRP2)
color  colNeutral      = input(#a8adbc, "Neutral  ",       inline = "Neutral",     group = GRP2)
color  colSell         = input(#ef9a9a, "Sell  ",          inline = "Sell Colors", group = GRP2)
color  colStrongSell   = input(#f44336, "",                inline = "Sell Colors", group = GRP2)
color  tableTitleColor = input(#295b79, "Headers",         inline = "Headers",     group = GRP2)

//@function Retrieves a tuple of strings representing the status of `ratingTotal`, `ratingOsc`, and `ratingMA` on the 
//          requested timeframe (`tf`), but only if `enable` is `true`. If `false`, returns a tuple of `na` values.
reqRatingStatus(string tf, bool enable, float ratingTotal, float ratingOsc, float ratingMA) =>
    if enable
        request.security(
             "", tf, 
             [TVtr.ratingStatus(ratingTotal), TVtr.ratingStatus(ratingOsc), TVtr.ratingStatus(ratingMA)]
         ) 

//@function Retrieves an input color for cell background coloring based on the `status` string.
cellBgColor(string status) =>
    color cellColor = switch status
        "Sell"         => colSell
        "Strong\nSell" => colStrongSell
        "Buy"          => colBuy
        "Strong\nBuy " => colStrongBuy
        "Neutral"      => colNeutral
        "-"            => colNeutral
        =>                tableTitleColor

//@function Returns a value for cell text alignment based on whether `cellText` represents a title. 
cellAlign(string cellText) =>
    switch 
        cellText == "MAs" or cellText == "Osc" or cellText == "All" or cellText == "-" => text.align_center 
        => text.align_left

//@function Initializes a cell in the `t` table at the specified `column` and `row`, colored based on `cellText`.
method addCell(table t, int column, int row, string cellText, color textColor, string textSize) =>
    t.cell(
         column, row, cellText, text_color = textColor, text_halign = cellAlign(cellText), 
         bgcolor = cellBgColor(cellText), text_size = textSize
     )

//@variable A non-empty string representing the selected indicator timeframe.
string currentTf = timeframe == "" ? timeframe.period : timeframe

// Initialize arrays to store timeframes and their enabled status.
var array<string> timeframes = array.from("TF", currentTf, mtf1, mtf2, mtf3, mtf4, mtf5)
var array<bool>   enabled    = array.from(true, true, useMtf1, useMtf2, useMtf3, useMtf4, useMtf5)

// On the first bar, check for and deactivate duplicate timeframes.
if barstate.isfirst
    for [i, enable] in enabled
        if not enable or i == 0
            continue
        for j = 0 to i - 1
            if not enabled.get(j)
                continue
            if timeframes.get(j) == timeframes.get(i)
                enabled.set(i, false)
                break

// Calculate ratings.
[rt, ro, rma]  = TVtr.calcRatingAll()

// Request rating statuses for each enabled timeframe, and populate arrays for the table display.
[sTotal0, sOsc0, sMA0] = reqRatingStatus(timeframes.get(1), enabled.get(1), rt, ro, rma)
[sTotal1, sOsc1, sMA1] = reqRatingStatus(timeframes.get(2), enabled.get(2), rt, ro, rma)
[sTotal2, sOsc2, sMA2] = reqRatingStatus(timeframes.get(3), enabled.get(3), rt, ro, rma)
[sTotal3, sOsc3, sMA3] = reqRatingStatus(timeframes.get(4), enabled.get(4), rt, ro, rma)
[sTotal4, sOsc4, sMA4] = reqRatingStatus(timeframes.get(5), enabled.get(5), rt, ro, rma)
[sTotal5, sOsc5, sMA5] = reqRatingStatus(timeframes.get(6), enabled.get(6), rt, ro, rma)

array<string> allRatings = array.from("All", sTotal0, sTotal1, sTotal2, sTotal3, sTotal4, sTotal5)
array<string> oscRatings = array.from("Osc", sOsc0,   sOsc1,   sOsc2,   sOsc3,   sOsc4,   sOsc5)
array<string> maRatings  = array.from("MAs", sMA0,    sMA1,    sMA2,    sMA3,    sMA4,    sMA5)

//@variable References a table that displays rating statuses for each enabled timeframe.
var table display = table.new(
     tableYPosInput + "_" + tableXPosInput, 4, 7, frame_color = color.white, frame_width = 2, border_width = 1, 
     border_color = color.white
 )

// On last bar, populate the table with rating status information.
if barstate.islast
    int row = 0
    for [i, enable] in enabled
        if not enable
            continue
        display.addCell(0, row, timeframes.get(i), colText, tableSizeInput)
        switch ratingSignal
            "All" =>
                display.addCell(1, row, maRatings.get(i),  colText, tableSizeInput)
                display.addCell(2, row, oscRatings.get(i), colText, tableSizeInput)
                display.addCell(3, row, allRatings.get(i), colText, tableSizeInput)
            "Oscillators" =>
                display.addCell(1, row, oscRatings.get(i), colText, tableSizeInput)
            "MAs" =>
                display.addCell(1, row, maRatings.get(i), colText, tableSizeInput)
        row += 1

// Request ratings for the plot display.
[plotTotal, plotOsc, plotMA] = switch
    plotConfirmed and timeframe.in_seconds(currentTf) > timeframe.in_seconds() =>
        request.security("", currentTf, [rt[1], ro[1], rma[1]], lookahead = barmerge.lookahead_on)
    =>  request.security("", currentTf, [rt, ro, rma])

//@variable The selected rating on the indicator timeframe, for plotting and alerts.
float userRating = switch ratingSignal 
    "MAs"         => plotMA
    "Oscillators" => plotOsc
    =>               plotTotal

// Calculate conditions and gradient data based on `userRating`.
bool  condBuy      = userRating >  LEVEL_WEAK
bool  condSell     = userRating < -LEVEL_WEAK
float valsBuy      = condBuy  ? userRating : 0
float valsSell     = condSell ? userRating : 0
int   risingBuys   = TVtr.countRising(valsBuy) 
int   fallingSells = TVtr.countRising(valsSell)
int   gradientLvl  = condBuy ? risingBuys : condSell ? fallingSells : 0
color buyColor     = color.from_gradient(userRating,  0.0, 0.2, colNeutral, colStrongBuy)
color sellColor    = color.from_gradient(userRating, -0.2, 0.0, colStrongSell, colNeutral)
color gradColor    = color.from_gradient(userRating, -0.2, 0.2, sellColor, buyColor)

// Plot `userRating`, display threshold lines, and create alert conditions.
plot(userRating, "Rating (indicator timeframe)", color.new(gradColor, 50 - gradientLvl * 10), 1, plot.style_columns)

hline(1,    color = color.new(colBuy,  50), linestyle = hline.style_solid)
hline(0.5,  color = color.new(colBuy,  50), linestyle = hline.style_dashed)
hline(-1,   color = color.new(colSell, 50), linestyle = hline.style_solid)
hline(-0.5, color = color.new(colSell, 50), linestyle = hline.style_dashed)

alertcondition(ta.crossunder(userRating, -LEVEL_WEAK),   "Sell",        "Ratings changed to \"Sell\"")
alertcondition(ta.crossover(userRating,   LEVEL_WEAK),   "Buy",         "Ratings changed to \"Buy\"")
alertcondition(ta.crossunder(userRating, -LEVEL_STRONG), "Strong Sell", "Ratings changed to \"Strong Sell\"")
alertcondition(ta.crossover(userRating,   LEVEL_STRONG), "Strong Buy",  "Ratings changed to \"Strong Buy\"")

// Raise error if `currentTf` is lower than the chart's timeframe.
if timeframe.in_seconds(currentTf) < timeframe.in_seconds()
    runtime.error(
         str.format(
             "Cannot plot ratings for all bars from the ''{0}'' timeframe on the current chart. Select a higher timeframe.", currentTf
         )
     )

------------------------
//@version=6
indicator(title="Chaikin Oscillator", shorttitle="Chaikin Osc", format=format.volume, timeframe="", timeframe_gaps=true)
var cumVol = 0.
cumVol += nz(volume)
if barstate.islast and cumVol == 0
    runtime.error("No volume is provided by the data vendor.")
short = input.int(3, minval=1, title="Fast Length")
long = input.int(10, minval=1, title="Slow Length")
osc = ta.ema(ta.accdist, short) - ta.ema(ta.accdist, long)
plot(osc, title="Chaikin Oscillator", color=#EC407A)
hline(0, title="Zero", color=#787B86, linestyle=hline.style_dashed)

------------------------
//@version=6
indicator(title="Ease of Movement", shorttitle="EOM", format=format.volume, timeframe="", timeframe_gaps=true)
var cumVol = 0.
cumVol += nz(volume)
if barstate.islast and cumVol == 0
    runtime.error("No volume is provided by the data vendor.")
length = input.int(14, minval=1)
div = input.int(10000, title="Divisor", minval=1)
eom = ta.sma(div * ta.change(hl2) * (high - low) / volume, length)
plot(eom, "EOM", color=#43A047)

------------------------
//@version=6
indicator(title="Detrended Price Oscillator", shorttitle="DPO", format=format.price, precision=2, timeframe="", timeframe_gaps=true)

TT_CENTERED = "When the DPO is centered, the DPO line stays offset towards the left. When it is not centered, it shifts back to the right to match current price."

period_    = input.int(21,      "Length",   minval = 1)
isCentered = input(false,       "Centered", tooltip = TT_CENTERED)

barsback = period_/2 + 1
ma = ta.sma(close, period_)
dpo = isCentered ? close[barsback] - ma : close - ma[barsback]
plot(dpo, "DPO", offset = isCentered ? -barsback : 0, color = #43A047)
hline(0, title="Zero Line", color = #787B86)

------------------------
//@version=6
indicator(title="SMI Ergodic Oscillator", shorttitle="SMIO", format=format.price, precision=4, timeframe="", timeframe_gaps=true)
longlen = input.int(20, minval=1, title="Long Length")
shortlen = input.int(5, minval=1, title="Short Length")
siglen = input.int(5, minval=1, title="Signal Line Length")
erg = ta.tsi(close, shortlen, longlen)
sig = ta.ema(erg, siglen)
osc = erg - sig
plot(osc, color=#FF5252, style=plot.style_histogram, title="SMI Ergodic Oscillator")

------------------------
//@version=6
indicator(title="Chande Momentum Oscillator", shorttitle="ChandeMO", format=format.price, precision=2, timeframe="", timeframe_gaps=true)
length = input.int(9, minval=1)
src = input(close, "Source")
momm = ta.change(src)
f1(m) => m >= 0.0 ? m : 0.0
f2(m) => m >= 0.0 ? 0.0 : -m
m1 = f1(momm)
m2 = f2(momm)
sm1 = math.sum(m1, length)
sm2 = math.sum(m2, length)
percent(nom, div) => 100 * nom / div
chandeMO = percent(sm1-sm2, sm1+sm2)
plot(chandeMO, "Chande MO", color=#2962FF)
hline(0, color=#787B86, linestyle=hline.style_dashed, title="Zero Line")

------------------------
//@version=6
indicator("Pivot Points High Low", shorttitle="Pivots HL", overlay=true, max_labels_count=500)

lengthGroupTitle = "LENGTH LEFT / RIGHT"
colorGroupTitle = "Text Color / Label Color"
leftLenH = input.int(title="Pivot High", defval=10, minval=1, inline="Pivot High", group=lengthGroupTitle)
rightLenH = input.int(title="/", defval=10, minval=1, inline="Pivot High", group=lengthGroupTitle)
textColorH = input(title="Pivot High", defval=color.black, inline="Pivot High", group=colorGroupTitle)
labelColorH = input(title="", defval=color.white, inline="Pivot High", group=colorGroupTitle)

leftLenL = input.int(title="Pivot Low", defval=10, minval=1, inline="Pivot Low", group=lengthGroupTitle)
rightLenL = input.int(title="/", defval=10, minval=1, inline="Pivot Low", group=lengthGroupTitle)
textColorL = input(title="Pivot Low", defval=color.black, inline="Pivot Low", group=colorGroupTitle)
labelColorL = input(title="", defval=color.white, inline="Pivot Low", group=colorGroupTitle)

ph = ta.pivothigh(leftLenH, rightLenH)
pl = ta.pivotlow(leftLenL, rightLenL)

drawLabel(_offset, _pivot, _style, _color, _textColor) =>
    if not na(_pivot)
        label.new(bar_index[_offset], _pivot, str.tostring(_pivot, format.mintick), style=_style, color=_color, textcolor=_textColor)

drawLabel(rightLenH, ph, label.style_label_down, labelColorH, textColorH)
drawLabel(rightLenL, pl, label.style_label_up, labelColorL, textColorL)

------------------------

//@version=6
indicator("Pivot Points Standard", "Pivots", overlay = true, max_lines_count = 500, max_labels_count = 500)

string TT_DB = (
    "When not selected, the indicator uses intraday data instead of EOD data on intraday charts. If the chart includes "
    + "data from extended hours, the pivot level calculation takes that data into account. If intraday OHLC values "
    + "differ from EOD values (normal for stocks), the calculated pivot levels will also differ."
)
DW = display.data_window
string pivotTypeInput           = input.string("Traditional", "Type",                   options = ["Traditional", "Fibonacci", "Woodie", "Classic", "DM", "Camarilla"])
string pivotAnchorInput         = input.string("Auto",        "Pivots timeframe",       options = ["Auto", "Daily", "Weekly", "Monthly", "Quarterly", "Yearly", "Biyearly", "Triyearly", "Quinquennially", "Decennially"])
int    maxHistoricalPivotsInput = input.int(15,               "Number of pivots back",  1, 200, display = DW)
bool   isDailyBasedInput        = input.bool(true,            "Use daily-based values", tooltip = TT_DB, display = DW)

string GRP01                    = "Labels"
bool   showLabelsInput          = input.bool(true,            "Show labels",            group   = GRP01, display = DW)
bool   showPricesInput          = input.bool(true,            "Show prices",            group   = GRP01, display = DW)
string positionLabelsInput      = input.string("Left",        "Labels position",        options = ["Left", "Right"], group = GRP01, display = DW, active = showLabelsInput or showPricesInput)

color DEFAULT_COLOR  = #fb8c00
bool  showLevel2and3 = pivotTypeInput != "DM"
bool  showLevel4     = pivotTypeInput != "DM" and pivotTypeInput != "Fibonacci"
bool  showLevel5     = pivotTypeInput == "Traditional" or pivotTypeInput == "Camarilla"

string GRP02          = "Levels"
int    linewidthInput = input.int(1,               "Line width", 1, 100,        group = GRP02, display = DW)
color  pColorInput    = input.color(DEFAULT_COLOR, "P ",         inline = "10", group = GRP02, display = DW)
bool   pShowInput     = input.bool(true,           "",           inline = "10", group = GRP02, display = DW)
color  s1ColorInput   = input.color(DEFAULT_COLOR, "S1",         inline = "02", group = GRP02, display = DW)
bool   s1ShowInput    = input.bool(true,           "",           inline = "02", group = GRP02, display = DW)
color  r1ColorInput   = input.color(DEFAULT_COLOR, "   R1",      inline = "02", group = GRP02, display = DW)
bool   r1ShowInput    = input.bool(true,           "",           inline = "02", group = GRP02, display = DW)
color  s2ColorInput   = input.color(DEFAULT_COLOR, "S2",         inline = "03", group = GRP02, display = DW, active = showLevel2and3)
bool   s2ShowInput    = input.bool(true,           "",           inline = "03", group = GRP02, display = DW, active = showLevel2and3)
color  r2ColorInput   = input.color(DEFAULT_COLOR, "   R2",      inline = "03", group = GRP02, display = DW, active = showLevel2and3)
bool   r2ShowInput    = input.bool(true,           "",           inline = "03", group = GRP02, display = DW, active = showLevel2and3)
color  s3ColorInput   = input.color(DEFAULT_COLOR, "S3",         inline = "04", group = GRP02, display = DW, active = showLevel2and3)
bool   s3ShowInput    = input.bool(true,           "",           inline = "04", group = GRP02, display = DW, active = showLevel2and3)
color  r3ColorInput   = input.color(DEFAULT_COLOR, "   R3",      inline = "04", group = GRP02, display = DW, active = showLevel2and3)
bool   r3ShowInput    = input.bool(true,           "",           inline = "04", group = GRP02, display = DW, active = showLevel2and3)
color  s4ColorInput   = input.color(DEFAULT_COLOR, "S4",         inline = "05", group = GRP02, display = DW, active = showLevel4)
bool   s4ShowInput    = input.bool(true,           "",           inline = "05", group = GRP02, display = DW, active = showLevel4)
color  r4ColorInput   = input.color(DEFAULT_COLOR, "   R4",      inline = "05", group = GRP02, display = DW, active = showLevel4)
bool   r4ShowInput    = input.bool(true,           "",           inline = "05", group = GRP02, display = DW, active = showLevel4)
color  s5ColorInput   = input.color(DEFAULT_COLOR, "S5",         inline = "06", group = GRP02, display = DW, active = showLevel5)
bool   s5ShowInput    = input.bool(true,           "",           inline = "06", group = GRP02, display = DW, active = showLevel5)
color  r5ColorInput   = input.color(DEFAULT_COLOR, "   R5",      inline = "06", group = GRP02, display = DW, active = showLevel5)
bool   r5ShowInput    = input.bool(true,           "",           inline = "06", group = GRP02, display = DW, active = showLevel5)

// @type A custom type for creating objects containing the name, color, and visibility settings for pivot levels.
type graphicSettings
    string levelName
    color  levelColor
    bool   showLevel

// @type A custom type for creating objects that reference the line and label of a single pivot level.
type pivotGraphic
    line  pivotLine
    label pivotLabel

// @variable References an array of `graphicSettings` IDs for all pivot levels.
var array<graphicSettings> graphicSettingsArray = array.from(
    graphicSettings.new(" P", pColorInput,  pShowInput),
    graphicSettings.new("R1", r1ColorInput, r1ShowInput), graphicSettings.new("S1", s1ColorInput, s1ShowInput),
    graphicSettings.new("R2", r2ColorInput, r2ShowInput), graphicSettings.new("S2", s2ColorInput, s2ShowInput),
    graphicSettings.new("R3", r3ColorInput, r3ShowInput), graphicSettings.new("S3", s3ColorInput, s3ShowInput),
    graphicSettings.new("R4", r4ColorInput, r4ShowInput), graphicSettings.new("S4", s4ColorInput, s4ShowInput),
    graphicSettings.new("R5", r5ColorInput, r5ShowInput), graphicSettings.new("S5", s5ColorInput, s5ShowInput)
)

// @variable An automatic timeframe string based on the chart's timeframe and the "daily-based" input.
var string autoAnchor = switch
    timeframe.isintraday => timeframe.multiplier <= 15 ? isDailyBasedInput ? "1D" : "1440" : "1W"
    timeframe.isdaily    => "1M"
    => "12M"

// @variable The final timeframe string for the calculation based on the "Pivots timeframe" input.
var string pivotTimeframe = switch pivotAnchorInput
    "Auto"      => autoAnchor
    "Daily"     => isDailyBasedInput ? "1D" : "1440"
    "Weekly"    => "1W"
    "Monthly"   => "1M"
    "Quarterly" => "3M"
    => "12M"

// @variable The number of years in the selected Pivot period.
var int pivotYearMultiplier = switch pivotAnchorInput
    "Biyearly"       => 2
    "Triyearly"      => 3
    "Quinquennially" => 5
    "Decennially"    => 10
    => 1

// @variable References a matrix of `pivotGraphic` IDs for all displayed pivot levels.
var matrix<pivotGraphic> drawnGraphics = matrix.new<pivotGraphic>()

// @function Returns a running total of pivot periods based on a specified condition.
pivotTimeframeChangeCounter(bool condition) =>
    var int count = 0
    if condition and bar_index > 0
        count += 1
    count

// @function Deletes the line and label associated with the `pivotGraphic` object for a pivot level.
method delete(pivotGraphic graphic) =>
    graphic.pivotLine.delete()
    graphic.pivotLabel.delete()

// @function Calculates pivot points using chart data (when not using EOD values) or data requested from the selected
//           pivot timeframe. Returns IDs of arrays containing static and developing pivot levels, and a counter
//           indicating pivot period changes.
calculatePivots(simple bool isDailyBased) =>
    if isDailyBased
        bool pivotTimeframeChange = (
            timeframe.change(timeframe.period) and year(time_tradingday, syminfo.timezone) % pivotYearMultiplier == 0
        )
        [pivotPointsArrayStatic, pivotPointsArrayDeveloping, pivotCounter] = request.security(
            ticker.modify(syminfo.tickerid, settlement_as_close = settlement_as_close.on),
            pivotTimeframe, [
                ta.pivot_point_levels(pivotTypeInput, pivotTimeframeChange),
                ta.pivot_point_levels(pivotTypeInput, pivotTimeframeChange, developing = pivotTypeInput != "Woodie"),
                pivotTimeframeChangeCounter(pivotTimeframeChange)
            ], lookahead = barmerge.lookahead_on
        )
    else
        bool pivotTimeframeChange = (
            timeframe.change(pivotTimeframe) and year(time_tradingday, syminfo.timezone) % pivotYearMultiplier == 0
        )
        array<float> pivotPointsArrayStatic = ta.pivot_point_levels(pivotTypeInput, pivotTimeframeChange)
        array<float> pivotPointsArrayDeveloping = ta.pivot_point_levels(
            pivotTypeInput, pivotTimeframeChange, developing = pivotTypeInput != "Woodie"
        )
        int pivotCounter = pivotTimeframeChangeCounter(pivotTimeframeChange)
        [pivotPointsArrayStatic, pivotPointsArrayDeveloping, pivotCounter]

// @function Moves the ending points of the last drawn pivot line and label to a specified end time.
affixOldPivots(int endTime) =>
    int rows = drawnGraphics.rows()
    if rows > 0
        array<pivotGraphic> lastGraphics = drawnGraphics.row(rows - 1)
        for graphic in lastGraphics
            graphic.pivotLine.set_x2(endTime)
            if positionLabelsInput == "Right"
                graphic.pivotLabel.set_x(endTime)

//@function Creates pivot drawings from a specified start time to the approximate end of the pivot period.
drawNewPivots(int startTime, array<float> pivotPointsArray) =>
    array<pivotGraphic> newGraphics = array.new<pivotGraphic>()
    int endTime = startTime + timeframe.in_seconds(pivotTimeframe) * 1000 * pivotYearMultiplier
    [labelPosition, labelStyle] = switch positionLabelsInput
        "Left"  => [startTime, label.style_label_right]
        "Right" => [endTime,   label.style_label_left]
    for [index, level] in pivotPointsArray
        graphicSettings levelSettings = graphicSettingsArray.get(index)
        if not na(level) and levelSettings.showLevel
            line pivotLine = line.new(
                startTime, level, endTime, level, xloc = xloc.bar_time, color = levelSettings.levelColor,
                width = linewidthInput
            )
            label pivotLabel = label.new(
                labelPosition, level,
                (showLabelsInput ? levelSettings.levelName + " " : "")
                + (showPricesInput ? "(" + str.tostring(level, format.mintick) + ")" : ""),
                style = labelStyle, textcolor = levelSettings.levelColor, color = #00000000, xloc = xloc.bar_time
            )
            newGraphics.push(pivotGraphic.new(pivotLine, pivotLabel))
    if newGraphics.size() > 0
        drawnGraphics.add_row(array_id = newGraphics)
        if drawnGraphics.rows() > maxHistoricalPivotsInput
            array<pivotGraphic> oldGraphics = drawnGraphics.remove_row(0)
            for graphic in oldGraphics
                graphic.delete()

// Calculate pivot levels and count the number of pivot periods.
[pivotPointsArrayStatic, pivotPointsArrayDeveloping, pivotCount] = calculatePivots(isDailyBasedInput)

// If the session is open at the end of the last pivot point period, draw next pivots without waiting for the next bar.
var bool skipNextPivots = false
if barstate.islast and barstate.isconfirmed and pivotTypeInput != "Woodie"
    int nextBarOpenTime = time("", bars_back = -1)
    int nextPivotStartTime = time(pivotTimeframe, timeframe_bars_back = -1)
    if nextBarOpenTime >= nextPivotStartTime
        affixOldPivots(nextPivotStartTime)
        drawNewPivots(nextPivotStartTime, pivotPointsArrayDeveloping)
        skipNextPivots := true
if pivotCount != pivotCount[1]
    if skipNextPivots
        skipNextPivots := false
    else
        affixOldPivots(time)
        drawNewPivots(time, pivotPointsArrayStatic)
// Move the last drawn pivots if there are no pivots on the current line.
else if drawnGraphics.rows() > 0 and drawnGraphics.row(drawnGraphics.rows() - 1).last().pivotLine.get_x2() <= time[1]
    affixOldPivots(time)

// If no pivots are displayed by the last historical bar, draw pivots across all the current history if possible,
// or raise an error if not enough data is available.
var int firstBarTime = time
if barstate.islastconfirmedhistory and drawnGraphics.rows() == 0
    if pivotCount > 0 and not na(pivotPointsArrayStatic)
        drawNewPivots(firstBarTime, pivotPointsArrayStatic)
    else if timeframe.isintraday and not isDailyBasedInput
        runtime.error(
            "Not enough intraday data available for pivot point calculation. "
            + "Select a lower timeframe from the options in the 'Pivots timeframe' input, or try selecting the "
            + "'Use daily-based values' checkbox to request EOD data."
        )
    else
        runtime.error(
            "Not enough data available for pivot point calculation. "
            + "Select a lower timeframe from the options in the 'Pivots timeframe' input."
        )

------------------------
//@version=6
indicator(title="Know Sure Thing", shorttitle="KST", format=format.price, precision=4, timeframe="", timeframe_gaps=true)
roclen1 = input.int(10, minval=1, title = "ROC Length #1")
roclen2 = input.int(15, minval=1, title = "ROC Length #2")
roclen3 = input.int(20, minval=1, title = "ROC Length #3")
roclen4 = input.int(30, minval=1, title = "ROC Length #4")
smalen1 = input.int(10, minval=1, title = "SMA Length #1")
smalen2 = input.int(10, minval=1, title = "SMA Length #2")
smalen3 = input.int(10, minval=1, title = "SMA Length #3")
smalen4 = input.int(15, minval=1, title = "SMA Length #4")
siglen = input.int(9, minval=1, title = "Signal Line Length")
smaroc(roclen, smalen) => ta.sma(ta.roc(close, roclen), smalen)
kst = smaroc(roclen1, smalen1) + 2 * smaroc(roclen2, smalen2) + 3 * smaroc(roclen3, smalen3) + 4 * smaroc(roclen4, smalen4)
sig = ta.sma(kst, siglen)
plot(kst, color=#009688, title="KST")
plot(sig, color=#F44336, title="Signal")
hline(0, title="Zero", color = #787B86)

------------------------
//@version=6
indicator(title="Historical Volatility", shorttitle="HV", format=format.price, precision=2, timeframe="", timeframe_gaps=true)
length = input.int(10, minval=1)
annual = 365
per = timeframe.isintraday or timeframe.isdaily and timeframe.multiplier == 1 ? 1 : 7
hv = 100 * ta.stdev(math.log(close / close[1]), length) * math.sqrt(annual / per)
plot(hv, "HV", color=#2962FF)

------------------------
//@version=6
indicator(title="Chaikin Money Flow", shorttitle="CMF", format=format.price, precision=2, timeframe="", timeframe_gaps=true)
var cumVol = 0.
cumVol += nz(volume)
if barstate.islast and cumVol == 0
    runtime.error("No volume is provided by the data vendor.")
length = input.int(20, minval=1)
ad = close==high and close==low or high==low ? 0 : ((2*close-low-high)/(high-low))*volume
mf = math.sum(ad, length) / math.sum(volume, length)
plot(mf, "CMF",  color = #43A047)
hline(0, "Zero", color = #787B86, linestyle = hline.style_dashed)

------------------------
//@version=6
indicator("Cumulative Volume Delta", "CVD", format=format.volume)

import TradingView/ta/8

anchorInput = input.timeframe("1D", "Anchor period")
lowerTimeframeTooltip = "The indicator scans lower timeframe data to approximate up and down volume used in the delta calculation. By default, the timeframe is chosen automatically. These inputs override this with a custom timeframe."
 + " \n\nHigher timeframes provide more historical data, but the data will be less precise."
useCustomTimeframeInput = input.bool(false, "Use custom timeframe", tooltip = lowerTimeframeTooltip)
lowerTimeframeInput = input.timeframe("1", "Timeframe", active = useCustomTimeframeInput)

var lowerTimeframe = switch
    useCustomTimeframeInput => lowerTimeframeInput
    timeframe.isseconds     => "1S"
    timeframe.isintraday    => "1"
    timeframe.isdaily       => "5"
    => "60"


[openVolume, maxVolume, minVolume, lastVolume] = ta.requestVolumeDelta(lowerTimeframe, anchorInput)

col = lastVolume >= openVolume ? color.teal : color.red
hline(0)
plotcandle(openVolume, maxVolume, minVolume, lastVolume, "CVD", color = col, bordercolor = col, wickcolor = col)

var cumVol = 0.
cumVol += nz(volume)
if barstate.islast and cumVol == 0
    runtime.error("The data vendor doesn't provide volume data for this symbol.")

------------------------
//@version=6
indicator("Volatility Stop", "VStop", overlay=true, timeframe="", timeframe_gaps=true)
length = input.int(20, "Length", minval = 2)
src = input.source(close, "Source")
factor = input.float(2.0, "Multiplier", minval = 0.25, step = 0.25)
volStop(src, atrlen, atrfactor) =>
    if not na(src)
        var max     = src
        var min     = src
        var uptrend = true
        var float stop    = na
        atrM        = nz(ta.atr(atrlen) * atrfactor, ta.tr)
        max         := math.max(max, src)
        min         := math.min(min, src)
        stop        := nz(uptrend ? math.max(stop, max - atrM) : math.min(stop, min + atrM), src)
        uptrend     := src - stop >= 0.0
        if uptrend != uptrend[1] and not barstate.isfirst
            max    := src
            min    := src
            stop   := uptrend ? max - atrM : min + atrM
        [stop, uptrend]

[vStop, uptrend] = volStop(src, length, factor)

plot(vStop, "Volatility Stop", style=plot.style_cross, color= uptrend ? #009688 : #F44336)

------------------------
//@version=6
indicator(title = "Coppock Curve", timeframe="", timeframe_gaps=true)
wmaLength = input(title="WMA Length", defval=10)
longRoCLength = input(title="Long RoC Length", defval=14)
shortRoCLength = input(title="Short RoC Length", defval=11)
source = close
curve = ta.wma(ta.roc(source, longRoCLength) + ta.roc(source, shortRoCLength), wmaLength)
plot(curve, "Coppock Curve")

------------------------
//@version=6
indicator(title = "Advance Decline Line", shorttitle="ADL", format=format.price, precision=2)
adlCalc(difference) => ta.cum(difference > 0 ? math.sqrt(difference) : -math.sqrt(-difference))
adl = request.security("(USI:ADVN.NY - USI:DECL.NY) / (USI:UNCH.NY + 1)", timeframe.period, adlCalc(close))
plot(adl, "Advance Decline Line")

------------------------
//@version=6
indicator(title="MA Cross", overlay=true, timeframe="", timeframe_gaps=true)
shortlen = input.int(9, "Short MA Length", minval=1)
longlen = input.int(21, "Long MA Length", minval=1)
short = ta.sma(close, shortlen)
long = ta.sma(close, longlen)
plot(short, color = #FF6D00, title="Short MA")
plot(long, color = #43A047, title="Long MA")
plot(ta.cross(short, long) ? short : na, color=#2962FF, style = plot.style_cross, linewidth = 4, title="Cross")

------------------------
//@version=6
indicator(title="Moving Average Exponential", shorttitle="EMA", overlay=true, timeframe="", timeframe_gaps=true)
len = input.int(9, minval=1, title="Length")
src = input(close, title="Source")
offset = input.int(title="Offset", defval=0, minval=-500, maxval=500, display = display.none)
out = ta.ema(src, len)
plot(out, title="EMA", color=color.blue, offset=offset)

// Smoothing MA inputs
GRP = "Smoothing"
TT_BB = "Only applies when 'SMA + Bollinger Bands' is selected. Determines the distance between the SMA and the bands."
maTypeInput = input.string("None", "Type", options = ["None", "SMA", "SMA + Bollinger Bands", "EMA", "SMMA (RMA)", "WMA", "VWMA"], group = GRP, display = display.none)
var isBB = maTypeInput == "SMA + Bollinger Bands"
maLengthInput = input.int(14, "Length", group = GRP, display = display.none, active = maTypeInput != "None")
bbMultInput = input.float(2.0, "BB StdDev", minval = 0.001, maxval = 50, step = 0.5, tooltip = TT_BB, group = GRP, display = display.none, active = isBB)
var enableMA = maTypeInput != "None"

// Smoothing MA Calculation
ma(source, length, MAtype) =>
	switch MAtype
		"SMA"                   => ta.sma(source, length)
		"SMA + Bollinger Bands" => ta.sma(source, length)
		"EMA"                   => ta.ema(source, length)
		"SMMA (RMA)"            => ta.rma(source, length)
		"WMA"                   => ta.wma(source, length)
		"VWMA"                  => ta.vwma(source, length)

// Smoothing MA plots
smoothingMA = enableMA ? ma(out, maLengthInput, maTypeInput) : na
smoothingStDev = isBB ? ta.stdev(out, maLengthInput) * bbMultInput : na
plot(smoothingMA, "EMA-based MA", color=color.yellow, display = enableMA ? display.all : display.none, editable = enableMA)
bbUpperBand = plot(smoothingMA + smoothingStDev, title = "Upper Bollinger Band", color=color.green, display = isBB ? display.all : display.none, editable = isBB)
bbLowerBand = plot(smoothingMA - smoothingStDev, title = "Lower Bollinger Band", color=color.green, display = isBB ? display.all : display.none, editable = isBB)
fill(bbUpperBand, bbLowerBand, color= isBB ? color.new(color.green, 90) : na, title="Bollinger Bands Background Fill", display = isBB ? display.all : display.none, editable = isBB)

------------------------
//@version=6
indicator(title="Arnaud Legoux Moving Average", shorttitle="ALMA", overlay=true, timeframe="", timeframe_gaps=true)

TT_OFFSET = "Controls tradeoff between smoothness (closer to 1) and responsiveness (closer to 0)."
TT_SIGMA  = "This element is a standard deviation that is applied to the combo line in order for it to appear more sharp."

source = close
lengthInput =  input.int(9,      "Length", minval  = 1)
offsetInput =  input.float(0.85, "Offset", step = 0.01, tooltip = TT_OFFSET)
sigmaInput  =  input.float(6,    "Sigma",               tooltip = TT_SIGMA)

plot(ta.alma(source, lengthInput, offsetInput, sigmaInput), "ALMA")

------------------------
//@version=6
indicator(title = "Least Squares Moving Average", shorttitle="LSMA", overlay=true, timeframe="", timeframe_gaps=true)
length = input(title="Length", defval=25)
offset = input(title="Offset", defval=0)
src = input(close, title="Source")
lsma = ta.linreg(src, length, offset)
plot(lsma, "LSMA")

------------------------
//@version=6
strategy("MovingAvg Cross", overlay=true)
length = input(9, "Length")
confirmBars = input(1, "Confirm bars")
price = close
ma = ta.sma(price, length)
bcond = price > ma
bcount = 0
bcount := bcond ? nz(bcount[1]) + 1 : 0
if (bcount == confirmBars)
	strategy.entry("MACrossLE", strategy.long, comment="MACrossLE")
scond = price < ma
scount = 0
scount := scond ? nz(scount[1]) + 1 : 0
if (scount == confirmBars)
	strategy.entry("MACrossSE", strategy.short, comment="MACrossSE")
//plot(strategy.equity, title="equity", color=color.red, linewidth=2, style=plot.style_areabr)

------------------------
//@version=6
indicator(title="Smoothed Moving Average", shorttitle="SMMA", overlay=true, timeframe="", timeframe_gaps=true)
len = input.int(7, minval=1, title="Length")
src = input(close, title="Source")
smma = 0.0
smma := na(smma[1]) ? ta.sma(src, len) : (smma[1] * (len - 1) + src) / len
plot(smma, "SMMA", color = #673AB7)

------------------------
//@version=6
indicator(title="Hull Moving Average", shorttitle="HMA", overlay=true, timeframe="", timeframe_gaps=true)
length = input.int(9, "Length", minval = 2)
src    = input(close, "Source")
hullma = ta.wma(2*ta.wma(src, length/2)-ta.wma(src, length), math.floor(math.sqrt(length)))
plot(hullma, "HMA")

------------------------
//@version=6
indicator(title="Double EMA", shorttitle="DEMA", overlay=true, timeframe="", timeframe_gaps=true)
length = input.int(9, minval=1)
src = input(close, title="Source")
e1 = ta.ema(src, length)
e2 = ta.ema(e1, length)
dema = 2 * e1 - e2
plot(dema, "DEMA", color=#43A047)

------------------------
//@version=6
indicator("Auto Fib Retracement", overlay=true)

devTooltip = "Deviation is a multiplier that affects how much the price should deviate from the previous pivot in order for the bar to become a new pivot."
depthTooltip = "The minimum number of bars that will be taken into account when calculating the indicator."
// pivots threshold
threshold_multiplier = input.float(title="Deviation", defval=3, minval=0, tooltip=devTooltip)
depth = input.int(title="Depth", defval=10, minval=2, tooltip=depthTooltip)
reverse = input(false, "Reverse", display = display.none)
var extendLeft = input(false, "Extend Left    |    Extend Right", inline = "Extend Lines")
var extendRight = input(true, "", inline = "Extend Lines")
var extending = extend.none
if extendLeft and extendRight
    extending := extend.both
if extendLeft and not extendRight
    extending := extend.left
if not extendLeft and extendRight
    extending := extend.right
prices = input(true, "Show Prices", display = display.none)
levels = input(true, "Show Levels", inline = "Levels", display = display.none)
levelsFormat = input.string("Values", "", options = ["Values", "Percent"], inline = "Levels", display = display.none, active = levels)
labelsPosition = input.string("Left", "Labels Position", options = ["Left", "Right"], display = display.none)
var int backgroundTransparency = input.int(85, "Background Transparency", minval = 0, maxval = 100, display = display.none)

import TradingView/ZigZag/7 as zigzag

update()=>
    var settings = zigzag.Settings.new(threshold_multiplier, depth, color(na), false, false, false, false, "Absolute", true)
    var zigzag.ZigZag zigZag = zigzag.newInstance(settings)
    var zigzag.Pivot lastP = na
    var float startPrice = na
    var float height = na
    if barstate.islast and zigZag.pivots.size() < 2
        runtime.error("Not enough data to calculate Auto Fib Retracement on the current symbol. Change the chart's timeframe to a lower one or select a smaller calculation depth using the indicator's `Depth` settings.")
    settings.devThreshold := ta.atr(10) / close * 100 * threshold_multiplier
    if zigZag.update()
        lastP := zigZag.lastPivot()
        if not na(lastP)
            var line lineLast = na
            if na(lineLast)
                lineLast := line.new(lastP.start, lastP.end, xloc=xloc.bar_time, color=color.gray, width=1, style=line.style_dashed)
            else
                line.set_first_point(lineLast, lastP.start)
                line.set_second_point(lineLast, lastP.end)

            startPrice := reverse ? lastP.start.price : lastP.end.price
            endPrice = reverse ? lastP.end.price : lastP.start.price
            height := (startPrice > endPrice ? -1 : 1) * math.abs(startPrice - endPrice)
    [lastP, startPrice, height]

[lastP, startPrice, height] = update()

_draw_line(price, col) =>
    var id = line.new(lastP.start.time, lastP.start.price, time, price, xloc=xloc.bar_time, color=col, width=1, extend=extending)
    line.set_xy1(id, lastP.start.time, price)
    line.set_xy2(id, lastP.end.time, price)
	id


_draw_label(price, txt, txtColor) =>
    x = labelsPosition == "Left" ? lastP.start.time : not extendRight ? lastP.end.time : time
    labelStyle = labelsPosition == "Left" ? label.style_label_right : label.style_label_left
    align = labelsPosition == "Left" ? text.align_right : text.align_left
    labelsAlignStrLeft = txt + '\n ‏  ‏  ‏  ‏  ‏  ‏  ‏  ‏  ‏  ‏  ‏  ‏  ‏  ‏  ‏  ‏  ‏  ‏  ‏  ‏  ‏  ‏  ‏  ‏  ‏  ‏  ‏  ‏  ‏  ‏  ‏  ‏  ‏  ‏  ‏ \n'
    labelsAlignStrRight = '       ' + txt + '\n ‏  ‏  ‏  ‏  ‏  ‏  ‏  ‏  ‏  ‏  ‏  ‏  ‏  ‏  ‏  ‏  ‏  ‏  ‏  ‏  ‏  ‏  ‏  ‏  ‏  ‏  ‏  ‏  ‏  ‏  ‏  ‏  ‏  ‏  ‏ \n'
    labelsAlignStr = labelsPosition == "Left" ? labelsAlignStrLeft : labelsAlignStrRight
    var id = label.new(x=x, y=price, xloc=xloc.bar_time, text=labelsAlignStr, textcolor=txtColor, style=labelStyle, textalign=align, color=#00000000)
    label.set_xy(id, x, price)
    label.set_text(id, labelsAlignStr)
    label.set_textcolor(id, txtColor)

_wrap(txt) =>
    "(" + str.tostring(txt, format.mintick) + ")"

_label_txt(level, price) =>
    l = levelsFormat == "Values" ? str.tostring(level) : str.tostring(level * 100) + "%"
    (levels ? l : "") + (prices ? _wrap(price) : "")

_crossing_level(series float sr, series float r) =>
    (r > sr and r < sr[1]) or (r < sr and r > sr[1])

processLevel(bool show, float value, color colorL, line lineIdOther) =>
    float m = value
	r = startPrice + height * m
    crossed = _crossing_level(close, r)
    if show and not na(lastP)
		lineId = _draw_line(r, colorL)
        _draw_label(r, _label_txt(m, r), colorL)
        if crossed
            alert("Autofib: " + syminfo.ticker + " crossing level " + str.tostring(value))
        if not na(lineIdOther)
            linefill.new(lineId, lineIdOther, color = color.new(colorL, backgroundTransparency))
		lineId
    else
		lineIdOther

show_0  = input(true, "", inline = "Level0", display = display.none)
value_0 = input(0, "", inline = "Level0", display = display.none, active = show_0)
color_0 = input(#787b86, "", inline = "Level0", display = display.none, active = show_0)

show_0_236  = input(true, "", inline = "Level0", display = display.none)
value_0_236 = input(0.236, "", inline = "Level0", display = display.none, active = show_0_236)
color_0_236 = input(#f44336, "", inline = "Level0", display = display.none, active = show_0_236)

show_0_382  = input(true, "", inline = "Level1", display = display.none)
value_0_382 = input(0.382, "", inline = "Level1", display = display.none, active = show_0_382)
color_0_382 = input(#81c784, "", inline = "Level1", display = display.none, active = show_0_382)

show_0_5  = input(true, "", inline = "Level1", display = display.none)
value_0_5 = input(0.5, "", inline = "Level1", display = display.none, active = show_0_5)
color_0_5 = input(#4caf50, "", inline = "Level1", display = display.none, active = show_0_5)

show_0_618  = input(true, "", inline = "Level2", display = display.none)
value_0_618 = input(0.618, "", inline = "Level2", display = display.none, active = show_0_618)
color_0_618 = input(#009688, "", inline = "Level2", display = display.none, active = show_0_618)

show_0_65  = input(false, "", inline = "Level2", display = display.none)
value_0_65 = input(0.65, "", inline = "Level2", display = display.none, active = show_0_65)
color_0_65 = input(#009688, "", inline = "Level2", display = display.none, active = show_0_65)

show_0_786  = input(true, "", inline = "Level3", display = display.none)
value_0_786 = input(0.786, "", inline = "Level3", display = display.none, active = show_0_786)
color_0_786 = input(#64b5f6, "", inline = "Level3", display = display.none, active = show_0_786)

show_1  = input(true, "", inline = "Level3", display = display.none)
value_1 = input(1, "", inline = "Level3", display = display.none, active = show_1)
color_1 = input(#787b86, "", inline = "Level3", display = display.none, active = show_1)

show_1_272  = input(false, "", inline = "Level4", display = display.none)
value_1_272 = input(1.272, "", inline = "Level4", display = display.none, active = show_1_272)
color_1_272 = input(#81c784, "", inline = "Level4", display = display.none, active = show_1_272)

show_1_414  = input(false, "", inline = "Level4", display = display.none)
value_1_414 = input(1.414, "", inline = "Level4", display = display.none, active = show_1_414)
color_1_414 = input(#f44336, "", inline = "Level4", display = display.none, active = show_1_414)

show_1_618  = input(true, "", inline = "Level5", display = display.none)
value_1_618 = input(1.618, "", inline = "Level5", display = display.none, active = show_1_618)
color_1_618 = input(#2962ff, "", inline = "Level5", display = display.none, active = show_1_618)

show_1_65  = input(false, "", inline = "Level5", display = display.none)
value_1_65 = input(1.65, "", inline = "Level5", display = display.none, active = show_1_65)
color_1_65 = input(#2962ff, "", inline = "Level5", display = display.none, active = show_1_65)

show_2_618  = input(true, "", inline = "Level6", display = display.none)
value_2_618 = input(2.618, "", inline = "Level6", display = display.none, active = show_2_618)
color_2_618 = input(#f44336, "", inline = "Level6", display = display.none, active = show_2_618)

show_2_65  = input(false, "", inline = "Level6", display = display.none)
value_2_65 = input(2.65, "", inline = "Level6", display = display.none, active = show_2_65)
color_2_65 = input(#f44336, "", inline = "Level6", display = display.none, active = show_2_65)

show_3_618  = input(true, "", inline = "Level7", display = display.none)
value_3_618 = input(3.618, "", inline = "Level7", display = display.none, active = show_3_618)
color_3_618 = input(#9c27b0, "", inline = "Level7", display = display.none, active = show_3_618)

show_3_65  = input(false, "", inline = "Level7", display = display.none)
value_3_65 = input(3.65, "", inline = "Level7", display = display.none, active = show_3_65)
color_3_65 = input(#9c27b0, "", inline = "Level7", display = display.none, active = show_3_65)

show_4_236  = input(true, "", inline = "Level8", display = display.none)
value_4_236 = input(4.236, "", inline = "Level8", display = display.none, active = show_4_236)
color_4_236 = input(#e91e63, "", inline = "Level8", display = display.none, active = show_4_236)

show_4_618  = input(false, "", inline = "Level8", display = display.none)
value_4_618 = input(4.618, "", inline = "Level8", display = display.none, active = show_4_618)
color_4_618 = input(#81c784, "", inline = "Level8", display = display.none, active = show_4_618)

show_neg_0_236  = input(false, "", inline = "Level9", display = display.none)
value_neg_0_236 = input(-0.236, "", inline = "Level9", display = display.none, active = show_neg_0_236)
color_neg_0_236 = input(#f44336, "", inline = "Level9", display = display.none, active = show_neg_0_236)

show_neg_0_382  = input(false, "", inline = "Level9", display = display.none)
value_neg_0_382 = input(-0.382, "", inline = "Level9", display = display.none, active = show_neg_0_382)
color_neg_0_382 = input(#81c784, "", inline = "Level9", display = display.none, active = show_neg_0_382)

show_neg_0_618  = input(false, "", inline = "Level10", display = display.none)
value_neg_0_618 = input(-0.618, "", inline = "Level10", display = display.none, active = show_neg_0_618)
color_neg_0_618 = input(#009688, "", inline = "Level10", display = display.none, active = show_neg_0_618)

show_neg_0_65  = input(false, "", inline = "Level10", display = display.none)
value_neg_0_65 = input(-0.65, "", inline = "Level10", display = display.none, active = show_neg_0_65)
color_neg_0_65 = input(#009688, "", inline = "Level10", display = display.none, active = show_neg_0_65)


lineId0 = processLevel(show_neg_0_65, value_neg_0_65, color_neg_0_65, line(na))
lineId1 = processLevel(show_neg_0_618, value_neg_0_618, color_neg_0_618, lineId0)
lineId2 = processLevel(show_neg_0_382, value_neg_0_382, color_neg_0_382, lineId1)
lineId3 = processLevel(show_neg_0_236, value_neg_0_236, color_neg_0_236, lineId2)
lineId4 = processLevel(show_0, value_0, color_0, lineId3)
lineId5 = processLevel(show_0_236, value_0_236, color_0_236, lineId4)
lineId6 = processLevel(show_0_382, value_0_382, color_0_382, lineId5)
lineId7 = processLevel(show_0_5, value_0_5, color_0_5, lineId6)
lineId8 = processLevel(show_0_618, value_0_618, color_0_618, lineId7)
lineId9 = processLevel(show_0_65, value_0_65, color_0_65, lineId8)
lineId10 = processLevel(show_0_786, value_0_786, color_0_786, lineId9)
lineId11 = processLevel(show_1, value_1, color_1, lineId10)
lineId12 = processLevel(show_1_272, value_1_272, color_1_272, lineId11)
lineId13 = processLevel(show_1_414, value_1_414, color_1_414, lineId12)
lineId14 = processLevel(show_1_618, value_1_618, color_1_618, lineId13)
lineId15 = processLevel(show_1_65, value_1_65, color_1_65, lineId14)
lineId16 = processLevel(show_2_618, value_2_618, color_2_618, lineId15)
lineId17 = processLevel(show_2_65, value_2_65, color_2_65, lineId16)
lineId18 = processLevel(show_3_618, value_3_618, color_3_618, lineId17)
lineId19 = processLevel(show_3_65, value_3_65, color_3_65, lineId18)
lineId20 = processLevel(show_4_236, value_4_236, color_4_236, lineId19)
lineId21 = processLevel(show_4_618, value_4_618, color_4_618, lineId20)

------------------------
//@version=6
indicator(title="Fisher Transform", shorttitle="Fisher", format=format.price, precision=2, timeframe="", timeframe_gaps=true)
len = input.int(9, minval=1, title="Length")
high_ = ta.highest(hl2, len)
low_ = ta.lowest(hl2, len)
round_(val) => val > .99 ? .999 : val < -.99 ? -.999 : val
value = 0.0
value := round_(.66 * ((hl2 - low_) / (high_ - low_) - .5) + .67 * nz(value[1]))
fish1 = 0.0
fish1 := .5 * math.log((1 + value) / (1 - value)) + .5 * nz(fish1[1])
fish2 = fish1[1]
hline(1.5, "1.5", color=#E91E63)
hline(0.75,"0.75", color=#787B86)
hline(0, "0", color=#E91E63)
hline(-0.75, "-0.75", color=#787B86)
hline(-1.5, "-1.5", color=#E91E63)
plot(fish1, color=#2962FF, title="Fisher")
plot(fish2, color=#FF6D00, title="Trigger")

------------------------
//@version=6
indicator(title="Volume Weighted Average Price", shorttitle="VWAP", overlay=true, timeframe="", timeframe_gaps=true)

hideonDWM = input(false, title="Hide VWAP on 1D or Above", group="VWAP Settings", display = display.none)
var anchor = input.string(defval = "Session", title="Anchor Period",
 options=["Session", "Week", "Month", "Quarter", "Year", "Decade", "Century", "Earnings", "Dividends", "Splits"], group="VWAP Settings")
src = input(title = "Source", defval = hlc3, group="VWAP Settings", display = display.none)
offset = input.int(0, title="Offset", group="VWAP Settings", display = display.none)

BANDS_GROUP = "Bands Settings"
CALC_MODE_TOOLTIP = "Determines the units used to calculate the distance of the bands. When 'Percentage' is selected, a multiplier of 1 means 1%."
calcModeInput = input.string("Standard Deviation", "Bands Calculation Mode", options = ["Standard Deviation", "Percentage"], group = BANDS_GROUP, tooltip = CALC_MODE_TOOLTIP, display = display.none)
showBand_1 = input(true, title = "", group = BANDS_GROUP, inline = "band_1", display = display.none)
bandMult_1 = input.float(1.0, title = "Bands Multiplier #1", group = BANDS_GROUP, inline = "band_1", step = 0.5, minval=0, display = display.none, active = showBand_1)
showBand_2 = input(false, title = "", group = BANDS_GROUP, inline = "band_2", display = display.none)
bandMult_2 = input.float(2.0, title = "Bands Multiplier #2", group = BANDS_GROUP, inline = "band_2", step = 0.5, minval=0, display = display.none, active = showBand_2)
showBand_3 = input(false, title = "", group = BANDS_GROUP, inline = "band_3", display = display.none)
bandMult_3 = input.float(3.0, title = "Bands Multiplier #3", group = BANDS_GROUP, inline = "band_3", step = 0.5, minval=0, display = display.none, active = showBand_3)

cumVolume = ta.cum(volume)
if barstate.islast and cumVolume == 0
    runtime.error("No volume is provided by the data vendor.")

isNewPeriod = switch anchor
	"Earnings" => 
		new_earnings_actual = request.earnings(syminfo.tickerid, earnings.actual, barmerge.gaps_on, barmerge.lookahead_on, ignore_invalid_symbol=true)
		new_earnings_standardized = request.earnings(syminfo.tickerid, earnings.standardized, barmerge.gaps_on, barmerge.lookahead_on, ignore_invalid_symbol=true)
		not na(new_earnings_actual) or not na(new_earnings_standardized)
	"Dividends" => 
		new_dividends = request.dividends(syminfo.tickerid, dividends.gross, barmerge.gaps_on, barmerge.lookahead_on, ignore_invalid_symbol=true)
		not na(new_dividends)
	"Splits"    => 
		new_split = request.splits(syminfo.tickerid, splits.denominator, barmerge.gaps_on, barmerge.lookahead_on, ignore_invalid_symbol=true)
		not na(new_split)
	"Session"   => timeframe.change("D")
	"Week"      => timeframe.change("W")
	"Month"     => timeframe.change("M")
	"Quarter"   => timeframe.change("3M")
	"Year"      => timeframe.change("12M")
	"Decade"    => timeframe.change("12M") and year % 10 == 0
	"Century"   => timeframe.change("12M") and year % 100 == 0
	=> false

isEsdAnchor = anchor == "Earnings" or anchor == "Dividends" or anchor == "Splits"
if na(src[1]) and not isEsdAnchor
	isNewPeriod := true

float vwapValue = na
float upperBandValue1 = na
float lowerBandValue1 = na
float upperBandValue2 = na
float lowerBandValue2 = na
float upperBandValue3 = na
float lowerBandValue3 = na

if not (hideonDWM and timeframe.isdwm)
    [_vwap, _stdevUpper, _] = ta.vwap(src, isNewPeriod, 1)
	vwapValue := _vwap
    stdevAbs = _stdevUpper - _vwap
	bandBasis = calcModeInput == "Standard Deviation" ? stdevAbs : _vwap * 0.01
	upperBandValue1 := _vwap + bandBasis * bandMult_1
	lowerBandValue1 := _vwap - bandBasis * bandMult_1
	upperBandValue2 := _vwap + bandBasis * bandMult_2
	lowerBandValue2 := _vwap - bandBasis * bandMult_2
	upperBandValue3 := _vwap + bandBasis * bandMult_3
	lowerBandValue3 := _vwap - bandBasis * bandMult_3

plot(vwapValue, title = "VWAP", color = #2962FF, offset = offset)

displayBand1 = showBand_1 ? display.all : display.none
upperBand_1 = plot(upperBandValue1, title="Upper Band #1", color = color.green, offset = offset, display = displayBand1, editable = showBand_1)
lowerBand_1 = plot(lowerBandValue1, title="Lower Band #1", color = color.green, offset = offset, display = displayBand1, editable = showBand_1)
fill(upperBand_1, lowerBand_1,      title="Bands Fill #1", color = color.new(color.green, 95),   display = displayBand1, editable = showBand_1)

displayBand2 = showBand_2 ? display.all : display.none
upperBand_2 = plot(upperBandValue2, title="Upper Band #2", color = color.olive, offset = offset, display = displayBand2, editable = showBand_2)
lowerBand_2 = plot(lowerBandValue2, title="Lower Band #2", color = color.olive, offset = offset, display = displayBand2, editable = showBand_2)
fill(upperBand_2, lowerBand_2,      title="Bands Fill #2", color = color.new(color.olive, 95),   display = displayBand2, editable = showBand_2)

displayBand3 = showBand_3 ? display.all : display.none
upperBand_3 = plot(upperBandValue3, title="Upper Band #3", color = color.teal, offset = offset, display = displayBand3, editable = showBand_3)
lowerBand_3 = plot(lowerBandValue3, title="Lower Band #3", color = color.teal, offset = offset, display = displayBand3, editable = showBand_3)
fill(upperBand_3, lowerBand_3,      title="Bands Fill #3", color = color.new(color.teal, 95),   display = displayBand3, editable = showBand_3)

--------------------
//@version=6
indicator(title = "Visible Average Price", shorttitle = "Avg Price", overlay = true)

src = input(title = "Source", defval = close)

var float[] src_vals = array.new<float>()

timeLeft = chart.left_visible_bar_time
timeRight= chart.right_visible_bar_time

if time >= timeLeft and time <= timeRight 
    array.unshift(src_vals, src)

avgSRC = array.avg(src_vals)
    
plot(avgSRC, 'Avg Price', color = #787B86, trackprice = true, show_last = 1, offset=-100000)

--------------------
//@version=6
indicator(title="Time Weighted Average Price", shorttitle="TWAP", overlay=true, timeframe="", timeframe_gaps=true)

anchor = input.timeframe(defval = "1D", title = "Anchor Period")
src = input(title = "Source", defval = ohlc4)
offset = input(0, title = "Offset", display = display.none)

twap(source, anchorChange) =>
    var prices = 0.0
    var count = 0

    if anchorChange
        prices := 0
        count := 0

	prices += source
	count += 1

    prices / count

twapValue = twap(src, timeframe.change(anchor))

plot(twapValue, title = "TWAP", color = #dd7a28, offset = offset)

--------------------
//@version=6
indicator("Correlation Coefficient", shorttitle = "CC", format = format.price, precision = 2)
symbolInput = input.symbol("GOOG", "Symbol", confirm = true)
sourceInput = input.source(close, "Source")
lengthInput = input.int(20, "Length")
// This takes into account additional settings enabled on chart, e.g. divident adjustment or extended session 
adjustedSeries = ticker.modify(symbolInput)
requestedData = request.security(adjustedSeries, timeframe.period, sourceInput)
correlation = ta.correlation(sourceInput, requestedData, lengthInput)
plot(correlation, "Correlation", color = color.blue)
hline(1)
hline(0, color = color.new(color.gray, 50))
hline(-1)

--------------------
//@version=6
indicator("Performance")

import TradingView/ValueAtTime/2 as VAT

string TT_SL = "A list of symbols or ticker IDs, separated by commas and optional spaces."
string TT_LT = "A list of timeframe strings, separated by commas and optional spaces. A valid timeframe string contains"
 + " a number followed by 'D', 'W', 'M', or 'Y'. Additionally, 'YTD' is supported."
string TT_PC = "The base color for table cells that show positive values."
string TT_NC = "The base color for table cells that show negative values."
string TT_CP = "The change percentage cutoff for maximum color intensity. Absolute percentages at or above this level"
 + " correspond to the same color intensity."
string TT_WT = "The table width, expressed as a percentage. If the value is 0, the width automatically adapts to the"
 + " table's contents. Note that using a large list of timeframe strings can cause the table's width to exceed the"
 + " width of the chart pane."
string TT_HG = "The table height, expressed as a percentage. If the value is 0, the height automatically adapts to the"
 + " table's contents. Note that using a large list of symbols or ticker IDs can cause the table's height to exceed the"
 + " height of the chart pane."

// Symbol settings
bool   includeCurrentSymbolInput = input.bool(true, "Include chart symbol")
string symbolListInput           = input.text_area("AAPL, NASDAQ:AMZN, EURUSD, ES1!, BTCUSD", "Symbol list", TT_SL)
string tfListInput               = input.text_area("1W, 1M, 3M, 6M, 12M, YTD, 5Y", "Timeframe list",         TT_LT)

// Color settings
string COLOR_GRP           = "Color settings"
int    HEAVY_TRANSP        = 70
int    LOW_TRANSP          = 90
color  neutralColor        = color.new(color.gray, 80)
color  posColorInput       = color.new(input.color(#089981, "Positive Color", TT_PC, group = COLOR_GRP), 0)
color  negColorInput       = color.new(input.color(#F23745, "Negative Color", TT_NC, group = COLOR_GRP), 0)
int    cutoffPercentInput  = input.int(10, "Color intensity cutoff (%)", tooltip = TT_CP, group = COLOR_GRP, display = display.none)

// Table settings
string TABLE_GRP           = "Table settings"
string tableXPositionInput = input.string("center", "Table position", ["left", "center", "right"], inline = "31", group = TABLE_GRP, display = display.none)
string tableYPositionInput = input.string("middle", "",               ["top", "middle", "bottom"], inline = "31", group = TABLE_GRP, display = display.none)
float  tableWidthInput     = input.float(100, "Table width (%)",  0, 100, 1, TT_WT, group = TABLE_GRP, display = display.none)
float  tableHeightInput    = input.float(95,  "Table height (%)", 0, 100, 1, TT_HG, group = TABLE_GRP, display = display.none)

getTickers()=>
    symbols = VAT.getArrayFromString(str.upper(symbolListInput))
    for [i, sym] in symbols
        symbols.set(i, ticker.inherit(syminfo.tickerid, sym))
    if includeCurrentSymbolInput and not symbols.includes(syminfo.ticker)
        symbols.insert(0, syminfo.tickerid)
    symbols

// Construct arrays from inputs.
var array<string> timeframesArray = VAT.getArrayFromString(str.upper(tfListInput))
var array<string> symbolsArray = getTickers()

// Create a table on the first bar.
var table changesTable = table.new(
     str.format("{0}_{1}", tableYPositionInput, tableXPositionInput), timeframesArray.size() + 1,
     symbolsArray.size() + 1, border_width = 3
 )

// Populate the table on the last bar.
if barstate.islast
    float cellWidth  = tableWidthInput  / (timeframesArray.size() + 1)
    float cellHeight = tableHeightInput / (symbolsArray.size()    + 1)

     // Fill the first row with timeframe strings.
    for [i, timeframe] in timeframesArray
        changesTable.cell(
             i + 1, 0, timeframe, bgcolor = neutralColor, text_color = chart.fg_color, width = cellWidth, height = cellHeight, text_size = size.auto
         )

     // Fill the first column with symbol descriptions, and all remaining cells with performance data.
    for [i, symbol] in symbolsArray
        [historicalClosesArray, timestampsArray, currClose, description] = request.security(
             symbol, "1D",
             VAT.getDataAtPeriodOffsets(timeframesArray, close, last_bar_time), lookahead = barmerge.lookahead_on
         )

        changesTable.cell(
             0, i + 1, description, tooltip = description, bgcolor = neutralColor, text_color = chart.fg_color,
             width = cellWidth, height = cellHeight, text_size = size.auto
         )

        // Calculate performance data from each item in `historicalClosesArray`, format each timestamp in
        // `timestampsArray`, and populate corresponding cells.
        for [j, value] in historicalClosesArray
            float changePercent = (currClose - value) / value * 100
            color cellColorBase = changePercent >= 0 ? posColorInput : negColorInput
            color cellColor = color.from_gradient(
                 math.abs(changePercent), 0, cutoffPercentInput, color.new(cellColorBase, LOW_TRANSP),
                 color.new(cellColorBase, HEAVY_TRANSP)
             )
            string cellText = str.tostring(changePercent, format.percent)
            string cellTooltip = str.format_time(timestampsArray.get(j), "dd MMM yyyy")

            if na(changePercent)
                cellColorBase := chart.fg_color
                cellColor     := color.new(neutralColor, LOW_TRANSP)
                cellText      := "No data"
                cellTooltip   := na

            changesTable.cell(
                 j + 1, i + 1, cellText, tooltip = cellTooltip, bgcolor = cellColor,
                 text_color = cellColorBase, width = cellWidth, height = cellHeight, text_size = size.auto
             )

--------------------
//@version=6
indicator("Kaufman's Adaptive Moving Average", "KAMA", true, timeframe = "", timeframe_gaps = true)

import TradingView/ta/11 as TVta

// Inputs
float sourceInput  = input.source(close, "Source")
int   erLenInput   = input.int(10, "ER length",   1)
int   fastLenInput = input.int(2,  "Fast length", 1)
int   slowLenInput = input.int(30, "Slow length", 1)

// Calculate and plot the KAMA value.
plot(TVta.kama(sourceInput, erLenInput, fastLenInput, slowLenInput), "KAMA")

--------------------
//@version=6
indicator(title="Keltner Channels", shorttitle="KC", overlay=true, timeframe="", timeframe_gaps=true)
length = input.int(20, minval=1)
mult = input(2.0, "Multiplier")
src = input(close, title="Source")
exp = input(true, "Use Exponential MA", display = display.none)
BandsStyle = input.string("Average True Range", options = ["Average True Range", "True Range", "Range"], title="Bands Style", display = display.none)
atrlength = input(10, "ATR Length", display = display.none)
esma(source, length)=>
	s = ta.sma(source, length)
	e = ta.ema(source, length)
	exp ? e : s
ma = esma(src, length)
rangema = BandsStyle == "True Range" ? ta.tr(true) : BandsStyle == "Average True Range" ? ta.atr(atrlength) : ta.rma(high - low, length)
upper = ma + rangema * mult
lower = ma - rangema * mult
u = plot(upper, color=#2962FF, title="Upper")
plot(ma, color=#2962FF, title="Basis")
l = plot(lower, color=#2962FF, title="Lower")
fill(u, l, color=color.rgb(33, 150, 243, 95), title="Background")

--------------------
//@version=6
indicator("Linear Regression Channel", shorttitle="LinReg", overlay=true)

lengthInput = input.int(100,      "Length", minval = 1, maxval = 5000)
sourceInput = input.source(close, "Source")

group1 = "Channel Settings"
useUpperDevInput = input.bool(true, "Upper Deviation",             inline = "Upper Deviation", group = group1)
upperMultInput   = input.float(2.0, "", active = useUpperDevInput, inline = "Upper Deviation", group = group1)
useLowerDevInput = input.bool(true, "Lower Deviation",             inline = "Lower Deviation", group = group1)
lowerMultInput   = input.float(2.0, "", active = useLowerDevInput, inline = "Lower Deviation", group = group1)

group2 = "Display Settings"
showPearsonInput = input.bool(true,  "Show Pearson's R",   group = group2)
extendLeftInput  = input.bool(false, "Extend Lines Left",  group = group2)
extendRightInput = input.bool(true,  "Extend Lines Right", group = group2)

extendStyle = switch
    extendLeftInput and extendRightInput => extend.both
    extendLeftInput => extend.left
    extendRightInput => extend.right
    => extend.none

group3 = "Color Settings"
colorUpper = input.color(color.new(color.blue, 85), "", inline = group3, group = group3)
colorLower = input.color(color.new(color.red,  85), "", inline = group3, group = group3)

calcSlope(source, length) =>
    max_bars_back(source, 5000)
    if not barstate.islast or length <= 1
        [float(na), float(na), float(na)]
    else
        sumX = 0.0
        sumY = 0.0
        sumXSqr = 0.0
        sumXY = 0.0
        for i = 0 to length - 1 by 1
            val = source[i]
            per = i + 1.0
            sumX += per
            sumY += val
            sumXSqr += per * per
            sumXY += val * per
        slope = (length * sumXY - sumX * sumY) / (length * sumXSqr - sumX * sumX)
        average = sumY / length
        intercept = average - slope * sumX / length + slope
        [slope, average, intercept]
        
[s, a, i] = calcSlope(sourceInput, lengthInput)
startPrice = i + s * (lengthInput - 1)
endPrice = i
var line baseLine = na
if na(baseLine) and not na(startPrice)
    baseLine := line.new(bar_index - lengthInput + 1, startPrice, bar_index, endPrice, width=1, extend=extendStyle, color=color.new(colorLower, 0))
else
    line.set_xy1(baseLine, bar_index - lengthInput + 1, startPrice)
    line.set_xy2(baseLine, bar_index, endPrice)
    na
    
calcDev(source, length, slope, average, intercept) =>
    upDev = 0.0
    dnDev = 0.0
    stdDevAcc = 0.0
    dsxx = 0.0
    dsyy = 0.0
    dsxy = 0.0
    periods = length - 1
    daY = intercept + slope * periods / 2
    val = intercept
    for j = 0 to periods by 1
        price = high[j] - val
        if price > upDev
            upDev := price
        price := val - low[j]
        if price > dnDev
            dnDev := price
        price := source[j]
        dxt = price - average
        dyt = val - daY
        price -= val
        stdDevAcc += price * price
        dsxx += dxt * dxt
        dsyy += dyt * dyt
        dsxy += dxt * dyt
        val += slope
    stdDev = math.sqrt(stdDevAcc / (periods == 0 ? 1 : periods))
    pearsonR = dsxx == 0 or dsyy == 0 ? 0 : dsxy / math.sqrt(dsxx * dsyy)
    [stdDev, pearsonR, upDev, dnDev]
    
[stdDev, pearsonR, upDev, dnDev] = calcDev(sourceInput, lengthInput, s, a, i)
upperStartPrice = startPrice + (useUpperDevInput ? upperMultInput * stdDev : upDev)
upperEndPrice = endPrice + (useUpperDevInput ? upperMultInput * stdDev : upDev)
var line upper = na
lowerStartPrice = startPrice + (useLowerDevInput ? -lowerMultInput * stdDev : -dnDev)
lowerEndPrice = endPrice + (useLowerDevInput ? -lowerMultInput * stdDev : -dnDev)
var line lower = na
if na(upper) and not na(upperStartPrice)
    upper := line.new(bar_index - lengthInput + 1, upperStartPrice, bar_index, upperEndPrice, width=1, extend=extendStyle, color=color.new(colorUpper, 0))
else
    line.set_xy1(upper, bar_index - lengthInput + 1, upperStartPrice)
    line.set_xy2(upper, bar_index, upperEndPrice)
    na
if na(lower) and not na(lowerStartPrice)
    lower := line.new(bar_index - lengthInput + 1, lowerStartPrice, bar_index, lowerEndPrice, width=1, extend=extendStyle, color=color.new(colorUpper, 0))
else
    line.set_xy1(lower, bar_index - lengthInput + 1, lowerStartPrice)
    line.set_xy2(lower, bar_index, lowerEndPrice)
    na
linefill.new(upper, baseLine, color = colorUpper)
linefill.new(baseLine, lower, color = colorLower)

float trend = math.sign(startPrice - endPrice)
alertcondition(sourceInput > line.get_price(upper, bar_index) or sourceInput < line.get_price(lower, bar_index), title='Regression Channel Exited', message="The price movement has exited Regression Channel's bounds")
alertcondition(trend[1] >= 0 and trend < 0, title='Switched to Uptrend',   message='The Regression Channel trend switched from Downtrend to Uptrend')
alertcondition(trend[1] <= 0 and trend > 0, title='Switched to Downtrend', message='The Regression Channel trend switched from Uptrend to Downtrend')

// Pearson's R
var label r = na
label.delete(r[1])
if showPearsonInput and not na(pearsonR)
    r := label.new(bar_index - lengthInput + 1, lowerStartPrice, str.tostring(pearsonR, "#.################"), color = color.new(color.white, 100), textcolor=color.new(colorUpper, 0), size=size.normal, style=label.style_label_up)


--------------------
//@version=6
indicator("Gaps", overlay = true, max_boxes_count = 500)

closeGapsPartially = input.bool(false, "Close Gaps Partially", display = display.none)
boxLimitInput = input.int(15, "Max Number of Gaps", minval = 1, maxval = 500, display = display.none)
minimalDeviationTooltip = "Specifies the minimal size of detected gaps, as a percentage of the average high-low range for the last 14 bars."
minimalDeviationInput = nz(input.float(30.0, "Minimal Deviation (%)", tooltip = minimalDeviationTooltip, minval=1, maxval=100, display = display.none) / 100 * ta.sma(high-low, 14))
limitBoxLengthBoolInput = input.bool(false, "Limit Max Gap Trail Length (bars)", inline = "Length Limit", display = display.none)
limitBoxLengthIntInput = input.int(300, "", inline = "Length Limit", minval = 1, display = display.none, active = limitBoxLengthBoolInput)

groupName = "Border and fill colors"
colorUpBorderInput = input.color(color.green, "Up Gaps", inline = "Gap Up", group = groupName, display = display.none)
colorUpBackgroundInput = input.color(color.new(color.green, 85), "", inline = "Gap Up", group = groupName, display = display.none)
colorDownBorderInput = input.color(color.red, "Down Gaps", inline = "Gap Down", group = groupName, display = display.none)
colorDownBackgroundInput = input.color(color.new(color.red, 85), "", inline = "Gap Down", group = groupName, display = display.none)

type AlertInfo
    int countOpenGap
    int countClosedGap

method hasOpenedGap(AlertInfo this) =>
    this.countOpenGap > 0

method hasClosedGap(AlertInfo this) =>
    this.countClosedGap > 0

AlertInfo alertInfo = AlertInfo.new(0, 0)

//@type A representation of a chart gap and all box drawings that it consists of.
//@field isActive If 'true', the gap has not yet been closed and is still being extended on the chart.
//@field isBull The direction of the gap: 'true' for upward gaps and 'false' for downward ones.
//@field inactiveBoxes An array of all boxes that have been drawn for this gap. The last element of the array is the box on the chart that is currently extended further.
type Gap
    bool isActive
    bool isBull
    array<box> boxes

//@function Deletes all of the boxes that were drawn to represent the gap.
method delete(Gap this) =>
    for _box in this.boxes
        _box.delete()

//@function Closes the gap partially, stopping the previous box and creating a new, smaller box to continue the gap instead.
method partialClose(Gap this) =>
    activeBox = this.boxes.last()
    activeBox.set_extend(extend.none)

    top = this.isBull ? activeBox.get_top() : low
    bottom = this.isBull ? high : activeBox.get_bottom()

    this.boxes.push(box.new(
      bar_index,
      top,
      bar_index,
      bottom, 
      this.isBull ? colorDownBorderInput : colorUpBorderInput, 
      bgcolor = this.isBull ? colorDownBackgroundInput : colorUpBackgroundInput))
    

//@function Closes the gap fully, stopping the box from being extended.
method fullClose(Gap this) =>
    alertInfo.countClosedGap += 1
    activeBox = this.boxes.last()
    activeBox.set_extend(extend.none)
    this.isActive := false
    if closeGapsPartially
        activeBox.delete()    

method checkForClose(Gap this) =>
    if this.isActive
        activeBox = this.boxes.last()
        top = activeBox.get_top() 
        bot = activeBox.get_bottom()
        isBull = this.isBull
        activeBox.set_right(bar_index)

        if (high > bot and isBull) or (low < top and not isBull)
            if closeGapsPartially
                this.partialClose()                
            else
                this.fullClose()

        bool forceCloseBoxExceededLengthLimit = (limitBoxLengthBoolInput and bar_index - activeBox.get_left() >= limitBoxLengthIntInput)
        if ((high > top and isBull) or (low < bot and not isBull)) or forceCloseBoxExceededLengthLimit
            this.fullClose()

var allGaps = array.new<Gap>()

// Detect gaps.
isGapDown = high < low[1] and low[1] - high >= minimalDeviationInput
isGapUp = low > high[1] and low - high[1] >= minimalDeviationInput
isGap = isGapDown or isGapUp
boxBorderColor = isGapDown ? colorDownBorderInput : colorUpBorderInput
boxBgcolor = isGapDown ? colorDownBackgroundInput : colorUpBackgroundInput

registerNewGap(bool isGapDown) => 
    alertInfo.countOpenGap += 1
    
    newBox = box.new(
      bar_index - 1,
      (isGapDown ? low[1] : low),
      bar_index,
      (isGapDown ? high : high[1]),
      border_color = boxBorderColor,
      bgcolor = boxBgcolor,
      extend = extend.right)

    allGaps.push(Gap.new(true, isGapDown, array.from(newBox)))

    if allGaps.size() > boxLimitInput
        allGaps.shift().delete()

// Detect covering of gaps.
for gap in allGaps
    gap.checkForClose()

// Add a box for each new gap, removing the oldest one if needed.
if isGap    
    registerNewGap(isGapDown)
        
if barstate.islastconfirmedhistory and allGaps.size() == 0
    noGapText = "No gaps found on the current chart. \n The cause could be that some exchanges align the open of new bars on the close of the previous one, resulting in charts with no gaps. Alternatively, your Minimal Deviation might be too high."
    var infoTable = table.new(position.bottom_right, 1, 1)
    table.cell(infoTable, 0, 0, text = noGapText, text_color = chart.bg_color, bgcolor = chart.fg_color)

alertcondition(alertInfo.hasOpenedGap(), "New Gap Appeared", "A new gap has appeared.")
alertcondition(alertInfo.hasClosedGap(), "Gap Closed", "A gap was closed.")

------------------------
//@version=6
indicator("Average Daily Range", shorttitle="ADR", timeframe="", timeframe_gaps=true)
lengthInput = input.int(14, title="Length")
adr = ta.sma(high - low, lengthInput)
plot(adr, title="ADR")

------------------------
//@version=6
indicator(title="Average True Range", shorttitle="ATR", overlay=false, timeframe="", timeframe_gaps=true)
length = input.int(title="Length", defval=14, minval=1)
smoothing = input.string(title="Smoothing", defval="RMA", options=["RMA", "SMA", "EMA", "WMA"])
ma_function(source, length) =>
	switch smoothing
		"RMA" => ta.rma(source, length)
		"SMA" => ta.sma(source, length)
		"EMA" => ta.ema(source, length)
		=> ta.wma(source, length)
plot(ma_function(ta.tr(true), length), title = "ATR", color=color.new(#B71C1C, 0))

------------------------
//@version=6
indicator("24-hour Volume", "24H Vol", format=format.volume)

import PineCoders/getSeries/1 as gs

priceTooltip = "If the symbol's volume is expressed in base units, it is multiplied by this value to convert it into a price."
price = input.source(close, "Price Source", tooltip = priceTooltip)
currencyInput = input.string(title = "Target Currency", defval="Default", options=["Default", "USD", "EUR", "CAD", "JPY", "GBP", "HKD", "CNY", "NZD", "RUB"], display = display.none)
currency = currencyInput == "Default" ? "" : currencyInput
    
sumVolTF = switch
    timeframe.isminutes or timeframe.isseconds => "1"
    timeframe.isdaily => "5"
    => "60"

sum24hVol(src) =>
    msIn24h = 24 * 60 * 60 * 1000
    sourceValues = gs.rollOnTimeWhen(src, msIn24h)
    sourceValues.sum()
        
noVolumeError = "The data vendor doesn't provide volume data for this symbol."
if syminfo.volumetype == "tick" and syminfo.type == "crypto"
    runtime.error(noVolumeError)

var cumVol = 0.
cumVol += nz(volume)
if barstate.islast and cumVol == 0
    runtime.error(noVolumeError)
    
expr = syminfo.volumetype == "quote" ? volume : price * volume
vol24h = request.security(syminfo.tickerid, sumVolTF, sum24hVol(expr * request.currency_rate(syminfo.currency, currency)))
plot(vol24h, title = "24H Volume", style = plot.style_columns)

------------------------
//@version=6
indicator("Up/Down Volume", "Up/Dn Vol", format = format.volume)

import TradingView/ta/8

lowerTimeframeTooltip = "The indicator scans lower timeframe data to approximate Up/Down volume." 
 + "  By default, the timeframe is chosen automatically. These inputs override this with a custom timeframe."
 + " \n\nHigher timeframes provide more historical data, but the data will be less precise."
useCustomTimeframeInput = input.bool(false, "Use custom timeframe", tooltip = lowerTimeframeTooltip)
lowerTimeframeInput     = input.timeframe("1", "Timeframe", active = useCustomTimeframeInput)

lowerTimeframe = switch
    useCustomTimeframeInput => lowerTimeframeInput
    timeframe.isseconds     => "1S"
    timeframe.isintraday    => "1"
    timeframe.isdaily       => "5"
    => "60"

[upVolume, downVolume, delta] = ta.requestUpAndDownVolume(lowerTimeframe)
plot(upVolume, "Up Volume", style = plot.style_columns, color=color.new(color.green, 60))
plot(downVolume, "Down Volume", style = plot.style_columns, color=color.new(color.red, 60))
plotchar(delta, "delta", "—", location.absolute, color = delta > 0 ? color.green : color.red, size = size.tiny)

var cumVol = 0.
cumVol += nz(volume)
if barstate.islast and cumVol == 0
    runtime.error("The data vendor doesn't provide volume data for this symbol.")

------------------------
//@version=6
indicator(title="Net Volume", format=format.volume)

import TradingView/ta/8

lowerTimeframeTooltip = "The indicator scans lower timeframe data to approximate Net volume. By default, the timeframe is chosen automatically. These inputs override this with a custom timeframe."
 + " \n\nHigher timeframes provide more historical data, but the data will be less precise."
useCustomTimeframeInput = input.bool(false, "Use custom timeframe", tooltip = lowerTimeframeTooltip)
lowerTimeframeInput = input.timeframe("1", "Timeframe", active = useCustomTimeframeInput)

lowerTimeframe = switch
    useCustomTimeframeInput => lowerTimeframeInput
    timeframe.isseconds     => "1S"
    timeframe.isintraday    => "1"
    timeframe.isdaily       => "5"
    => "60"

[upVolume, downVolume, delta] = ta.requestUpAndDownVolume(lowerTimeframe)

plot(delta, color=color.blue, title="Net Volume")
hline(0)

var cumVol = 0.
cumVol += nz(volume)
if barstate.islast and cumVol == 0
    runtime.error("The data vendor doesn't provide volume data for this symbol.")

------------------------
//@version=6
indicator("Relative Volume at Time", "RelVol")

import TradingView/ta/7

anchorTimeframeInput = input.timeframe("1D", "Anchor Timeframe", tooltip = "When Chart Timeframe >= `Anchor Timeframe`, the indicator will use last `Length` bars in its calculations.")
lengthInput          = input.int(10, "Length", minval = 1)
calculationModeInput = input.string("Cumulative", "Calculation Mode", options = ["Cumulative", "Regular"])
const string TT_AR = "If checked, the volume on bars that have not yet closed will be adjusted based on the previous volume data for the current session, extrapolating the volume at the end of the period."
adjustRealtimeInput  = input.bool(true, "Adjust Unconfirmed", tooltip = TT_AR)

[currentVolume, pastVolume, _] = ta.relativeVolume(lengthInput, anchorTimeframeInput, calculationModeInput == "Cumulative", adjustRealtimeInput)

plot(currentVolume / pastVolume, "Relative Volume Ratio", color.new(currentVolume / pastVolume > 1 ? color.green: color.red, 70), 1, plot.style_columns, histbase = 1)
hline(1, color = color.new(color.gray, 50))

var cumVol = 0.
cumVol += nz(volume)
if barstate.islast and cumVol == 0
    runtime.error("The data vendor doesn't provide volume data for this symbol.")

------------------------
//@version=6
indicator('Open Interest', 'OI', format = format.volume, dynamic_requests = true)
var tickerOI = str.format('{0}_OI', ticker.standard(syminfo.tickerid))
[oiOpen, oiHigh, oiLow, oiClose, oiColorCond] = if timeframe.isintraday
    request.security(tickerOI, timeframe.period, [open, high, low, close, close > close[1]], ignore_invalid_symbol = true)
else
    [na, na, na, na, false]
[oiCloseD, oiColorCondD] = request.security(tickerOI, "1D", [close, close > close[1]], ignore_invalid_symbol = true)
if barstate.islastconfirmedhistory and na(oiClose) and na(oiCloseD)
    runtime.error(str.format('No Open Interest data found for the `{0}` symbol.', syminfo.prefix + ':' + syminfo.ticker))
var hasIntraday = false
if not na(oiClose)
    hasIntraday := true
plot(hasIntraday ? na : oiCloseD, 'Open Interest', oiColorCondD ? color.teal : color.red, style = plot.style_stepline, linewidth = 4)
openInterestColor = oiColorCond ? color.teal : color.red
plotcandle(oiOpen, oiHigh, oiLow, oiClose, 'Open Interest', color = openInterestColor, wickcolor = openInterestColor, bordercolor = openInterestColor)

------------------------
//@version=6
indicator(title="Ichimoku Cloud", shorttitle="Ichimoku", overlay=true)
conversionPeriods = input.int(9, minval=1, title="Conversion Line Length")
basePeriods = input.int(26, minval=1, title="Base Line Length")
laggingSpan2Periods = input.int(52, minval=1, title="Leading Span B Length")
displacement = input.int(26, minval=1, title="Lagging Span")
donchian(len) => math.avg(ta.lowest(len), ta.highest(len))
conversionLine = donchian(conversionPeriods)
baseLine = donchian(basePeriods)
leadLine1 = math.avg(conversionLine, baseLine)
leadLine2 = donchian(laggingSpan2Periods)
plot(conversionLine, color=#2962FF, title="Conversion Line")
plot(baseLine, color=#B71C1C, title="Base Line")
plot(close, offset = -displacement + 1, color=#43A047, title="Lagging Span")
p1 = plot(leadLine1, offset = displacement - 1, color=#A5D6A7,
	 title="Leading Span A")
p2 = plot(leadLine2, offset = displacement - 1, color=#EF9A9A,
	 title="Leading Span B")
plot(leadLine1 > leadLine2 ? leadLine1 : leadLine2, offset = displacement - 1, title = "Kumo Cloud Upper Line", display = display.none) 
plot(leadLine1 < leadLine2 ? leadLine1 : leadLine2, offset = displacement - 1, title = "Kumo Cloud Lower Line", display = display.none) 
fill(p1, p2, title = "Cloud Fill", color = leadLine1 > leadLine2 ? color.rgb(67, 160, 71, 90) : color.rgb(244, 67, 54, 90))

------------------------
//@version=6
indicator("Price Target", overlay = true)

posColorInput = input.color(color.new(#089981, 90), "Positive Color")
negColorInput = input.color(color.new(#f23645, 90), "Negative Color")

int YearFromNow = syminfo.target_price_date + timeframe.in_seconds("12M") * 1000

changePercentString(value) =>
    round = (value / close) * 100 - 100
    (round >= 0 ? "+" : "") + str.tostring(round, format.percent)

deletePastDrawings() =>
    for _label in label.all
        _label.delete()

    for _line in line.all
        _line.delete()

calcColor(price, comparedTo = close, transp = 0) => 
    color.new(price >= comparedTo ? posColorInput : negColorInput, transp)

drawTarget(price, labelText, currLine) =>
    priceChange = changePercentString(price)
    label.new(YearFromNow, price, labelText + " " + priceChange, color = calcColor(price), textcolor = color.white, xloc = xloc.bar_time, style = label.style_label_right)
    l = line.new(time, close, YearFromNow, price, color = calcColor(price), xloc = xloc.bar_time, style = line.style_dotted)
    linefill.new(currLine, l, price > close ? posColorInput : negColorInput)
updateTarget()=>
    for la in label.all
        text_ = la.get_text()
        if str.contains(text_, "Max")
            la.set_text("Max" + " " + changePercentString(syminfo.target_price_high))
        else if str.contains(text_, "Avg")
            la.set_text("Avg" + " " + changePercentString(syminfo.target_price_average))
        else if str.contains(text_, "Low")
            la.set_text("Low" + " " + changePercentString(syminfo.target_price_low))  
var targetShown = false
var float closeDuringPrediction = na 

if not na(syminfo.target_price_date) and na(syminfo.target_price_date[1])
    targetShown := true
    closeDuringPrediction := close

    deletePastDrawings()
    
    currLine = line.new(time, close, YearFromNow, close, xloc.bar_time, color = color.blue, style = line.style_dotted)
    drawTarget(syminfo.target_price_high,    "Max", currLine)
    drawTarget(syminfo.target_price_average, "Avg", currLine)
    drawTarget(syminfo.target_price_low,     "Min", currLine)

    nameLabel = label.new(bar_index, close, "⬤", color = color.new(#2962ff, 100), style = label.style_label_center, textcolor = color.new(#2962ff,0),
      tooltip = str.format("The {0} analysts offering 1 year price forecasts for {1} have a max estimate of {2} and a min estimate of {3}.", 
      syminfo.target_price_estimates, syminfo.ticker, syminfo.target_price_high, syminfo.target_price_low))
updateTarget()
if barstate.islast and not targetShown 
    t = table.new(position.top_right, 1, 1, chart.fg_color)
    warningText = "No analyst predictions found."
    if barstate.isconfirmed    
        warningText += "\nIf there are any new predictions for this symbol, they should appear once the market opens."
    t.cell(0, 0, warningText, text_color = chart.bg_color)

plot(syminfo.target_price_high,    "Max", color = calcColor(syminfo.target_price_high,    closeDuringPrediction), display = display.price_scale)
plot(syminfo.target_price_average, "Avg", color = calcColor(syminfo.target_price_average, closeDuringPrediction), display = display.price_scale)
plot(syminfo.target_price_low,     "Min", color = calcColor(syminfo.target_price_low,     closeDuringPrediction), display = display.price_scale)

------------------------
//@version=6
indicator("Negative Volume Index", "NVI", timeframe = "", timeframe_gaps = true)

int maLengthInput = input.int(255, "EMA length", 1)

// Calculate and plot the NVI and its EMA.
float nvi = ta.nvi * 1000.0
float ema = ta.ema(nvi, maLengthInput)

plot(nvi, "NVI")
plot(ema, "NVI-based EMA", #ff9800)

// Raise an error if no volume data is available.
if ta.cum(nz(volume)) == 0.0 and barstate.islastconfirmedhistory
    runtime.error("No volume is provided by the data vendor.")

------------------------
//@version=6
indicator("Percentage Price Oscillator", "PPO", false, format.percent, 2, timeframe = "", timeframe_gaps = true)

// Inputs
float  sourceInput  = input.source(close, "Source")
int    fastLenInput = input.int(12, "Fast length",   1)
int    slowLenInput = input.int(26, "Slow length",   1)
int    sigLenInput  = input.int(9,  "Signal length", 1)
string oscTypeInput = input.string("EMA", "Oscillator MA type", ["EMA", "SMA"], display = display.none)
string sigTypeInput = input.string("EMA", "Signal MA type",     ["EMA", "SMA"], display = display.none)

// @function    Calculates an EMA or SMA of a `source` series.
ma(float source, int length, simple string maType) =>
    switch maType
        "EMA" => ta.ema(source, length)
        "SMA" => ta.sma(source, length)

// Calculate and plot the PPO, signal, and histogram values.
float maFast = ma(sourceInput, fastLenInput, oscTypeInput)
float maSlow = ma(sourceInput, slowLenInput, oscTypeInput)
float ppo    = 100.0 * (maFast - maSlow) / maSlow
float signal = ma(ppo, sigLenInput, sigTypeInput)
float hist   = ppo - signal
color hColor = hist >= 0 ? hist > hist[1] ? #26a69a : #b2dfdb : hist > hist[1] ? #ffcdd2 : #ff5252

hline(0, "Zero", #787b8680)
plot(hist, "Histogram", hColor, style = plot.style_columns)
plot(ppo, "PPO")
plot(signal, "Signal line", #ff6d00)

------------------------
//@version=6
indicator("Percentage Volume Oscillator", "PVO", false, format.percent, 2, timeframe = "", timeframe_gaps = true)

// Inputs
int    fastLenInput = input.int(12, "Fast length",   1)
int    slowLenInput = input.int(26, "Slow length",   1)
int    sigLenInput  = input.int(9,  "Signal length", 1)
string oscTypeInput = input.string("EMA", "Oscillator MA type", ["EMA", "SMA"], display = display.none)
string sigTypeInput = input.string("EMA", "Signal MA type",     ["EMA", "SMA"], display = display.none)

// @function    Calculates an EMA or SMA of a `source` series.
ma(float source, int length, simple string maType) =>
    switch maType
        "EMA" => ta.ema(source, length)
        "SMA" => ta.sma(source, length)

// Calculate and plot the PVO, signal, and histogram values.
float maFast = ma(volume, fastLenInput, oscTypeInput)
float maSlow = ma(volume, slowLenInput, oscTypeInput)
float pvo    = 100.0 * (maFast - maSlow) / maSlow
float signal = ma(pvo, sigLenInput, sigTypeInput)
float hist   = pvo - signal
color hColor = hist >= 0 ? hist > hist[1] ? #26a69a : #b2dfdb : hist > hist[1] ? #ffcdd2 : #ff5252

hline(0, "Zero", #787b8680)
plot(hist, "Histogram", hColor, style = plot.style_columns)
plot(pvo, "PVO")
plot(signal, "Signal line", #ff6d00)

// Raise an error if no volume data is available.
if ta.cum(nz(volume)) == 0.0 and barstate.islastconfirmedhistory
    runtime.error("No volume is provided by the data vendor.")

------------------------
//@version=6
indicator("Moon Phases", overlay = true)

waxingMoonColorInput = input.color(color.blue, "Waxing Moon")
waningMoonColorInput = input.color(color.white, "Waning Moon")

if timeframe.ismonthly   
    runtime.error("Unsupported timeframe.")

dayofyear(_time) =>
    _year = year(_time)
    leapYear = (_year % 400 == 0) or (_year % 4 == 0 and _year % 100 != 0)
    dayCount = array.from(31, leapYear ? 29 : 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31)
    timeMonth = month(_time)
    dayofyear = 0
    if timeMonth > 1
        for i = 0 to timeMonth - 2
            dayofyear += dayCount.get(i)
    dayofyear + dayofmonth(_time)

getUNIXTimeFromJD(julianDay) =>
    z = math.floor(julianDay + 0.5)
    f = (julianDay + 0.5) % 1
    alpha = math.floor((z - 1867216.25) / 36524.25)
    a = (z < 2299161) ? z : (z + 1 + alpha - math.floor(alpha / 4.0))
    b = a + 1524
    c = math.floor((b - 122.1) / 365.25)
    d = math.floor(365.25 * c)
    e = math.floor((b - d) / 30.6001)
    dayFloat = b - d - math.floor(30.6001 * e) + f
    _day = int(dayFloat)
    _month = (e < 13.5) ? int(e - 1) : int(e - 13)
    _year = (_month > 2.5) ? int(c - 4716) : int(c - 4715)
    secondTotal = int((dayFloat % 1) * 60 * 60 * 24)
    _hour = secondTotal / (60 * 60)
    _minute = (secondTotal - (_hour * 60 * 60)) / 60
    _second = secondTotal % 60
    timestamp(_year, _month, _day, _hour, _minute, _second)

getLastNewMoon(_time) =>
    _year = year(_time)
    dayOfYear = dayofyear(_time)
    k = (dayOfYear / 364.25 + _year - 1900) * 12.3685
    int moonPhase = na

    // 0 is equal to the fractional part of the new moon
    // 0.25 - first quarter, 0.5 - full moon, 0.75 - third quarter
    if ((k % 1.0) < 0.5)
        k := math.floor(k)
        moonPhase := +1
    else
        k := math.floor(k) + 0.5
        moonPhase := -1

    t = k / 1236.85
    
    // mean anomaly of the sun at the time julianDate
    anomalySun = math.toradians(359.2242 + (29.10535608 * k) - (0.0000333 * math.pow(t, 2)) - (0.00000347 * math.pow(t, 3)))
    // mean anomaly of the moon at the time julianDate
    anomalyMoon = math.toradians(306.0253 + (385.81691806 * k) + (0.0107306 * math.pow(t, 2)) + (0.00001236 * math.pow(t, 3)))
    // argument of latitude of the moon
    f = math.toradians(21.2964 + ((390.67050646 * k) - (0.0016528 * math.pow(t, 2)) - (0.00000239 * math.pow(t, 3))))
    dev = (0.1734 - (0.000393 * t)) * math.sin(anomalySun)
          + 0.0021 * math.sin(2 * anomalySun)
          - 0.4068 * math.sin(anomalyMoon)
          + 0.0161 * math.sin(2 * anomalyMoon)
          - 0.0004 * math.sin(3 * anomalyMoon)
          + 0.0104 * math.sin(2 * f)
          - 0.0051 * math.sin(anomalySun + anomalyMoon)
          - 0.0074 * math.sin(anomalySun - anomalyMoon)
          + 0.0004 * math.sin(2 * f + anomalySun)
          - 0.0004 * math.sin(2 * f - anomalySun)
          - 0.0006 * math.sin(2 * f + anomalyMoon)
          + 0.0010 * math.sin(2 * f - anomalyMoon)
          + 0.0005 * math.sin(anomalySun + 2 * anomalyMoon)

    julianDate = 2415020.75933 + (29.53058868 * k) + (0.0001178 * math.pow(t, 2)) - (0.000000155 * math.pow(t, 3)) +
          (0.00033 * math.sin(math.toradians(166.56) + (math.toradians(132.87) * t) - (math.toradians(0.009173) * math.pow(t, 2)))) + dev
    timeLastMoonPhase = getUNIXTimeFromJD(julianDate)
    timeLastMoonPhase := timeLastMoonPhase >= _time ? timeLastMoonPhase[1] : timeLastMoonPhase

    var int moonPhaseAdjusted = moonPhase
	isChangeTimeLastMoonPhase = ta.change(timeLastMoonPhase) != 0
    moonPhaseAdjusted := barstate.isfirst or isChangeTimeLastMoonPhase ? moonPhase : moonPhaseAdjusted[1]
    moonType = ta.change(moonPhaseAdjusted) != 0 ? moonPhase : na
    [moonPhaseAdjusted, moonType]

[moonPhase, moonType] = getLastNewMoon(time_close)
plotshape(moonType == +1, "New Moon",  shape.circle, location.abovebar, color.new(waxingMoonColorInput, 50), size=size.normal, display = display.pane)   
plotshape(moonType == -1, "Full Moon", shape.circle, location.belowbar, color.new(waningMoonColorInput, 50), size=size.normal, display = display.pane)
bgcolor(color.new(moonPhase == 1 ? waxingMoonColorInput : waningMoonColorInput, 95))

------------------------
//@version=6
indicator("Moving Average Convergence Divergence", "MACD", timeframe = "", timeframe_gaps = true)

// Inputs
float  sourceInput  = input.source(close, "Source")
int    fastLenInput = input.int(12, "Fast length",   1)
int    slowLenInput = input.int(26, "Slow length",   1)
int    sigLenInput  = input.int(9,  "Signal length", 1)
string oscTypeInput = input.string("EMA", "Oscillator MA type", ["EMA", "SMA"], display = display.none)
string sigTypeInput = input.string("EMA", "Signal MA type",     ["EMA", "SMA"], display = display.none)

// @function    Calculates an EMA or SMA of a `source` series.
ma(float source, int length, simple string maType) =>
    switch maType
        "EMA" => ta.ema(source, length)
        "SMA" => ta.sma(source, length)

// Calculate and plot the MACD, signal, and histogram values.
float maFast = ma(sourceInput, fastLenInput, oscTypeInput)
float maSlow = ma(sourceInput, slowLenInput, oscTypeInput)
float macd   = maFast - maSlow
float signal = ma(macd, sigLenInput, sigTypeInput)
float hist   = macd - signal
color hColor = hist >= 0 ? hist > hist[1] ? #26a69a : #b2dfdb : hist > hist[1] ? #ffcdd2 : #ff5252

hline(0, "Zero", #787b8680)
plot(hist, "Histogram", hColor, style = plot.style_columns)
plot(macd, "MACD")
plot(signal, "Signal line", #ff6d00)

// Create alert conditions.
alertcondition(hist[1] >= 0 and hist < 0, "Rising to falling", "MACD histogram switched from a rising to falling state")
alertcondition(hist[1] <= 0 and hist > 0, "Falling to rising", "MACD histogram switched from a falling to rising state")

------------------------
//@version=6
indicator("Trading Sessions", overlay = true, max_boxes_count = 500, max_lines_count = 500, max_labels_count = 500)

bool showSessionNames     = input.bool(true, "Show session names")
bool showSessionOC        = input.bool(true, "Draw session open and close lines")
bool showSessionTickRange = input.bool(true, "Show tick range for each session")
bool showSessionAverage   = input.bool(true, "Show average price per session")

const string TZ_TOOLTIP_TEXT = "The session's time zone, specified in either GMT notation (e.g., 'GMT-5') or as an IANA time zone database name (e.g., 'America/New_York')."
 + " We recommend the latter since it includes other time-related changes, such as daylight savings."

const string FIRST_SESSION_GROUP = "First Session"
showFirst         = input.bool(true, "Show session", group = FIRST_SESSION_GROUP, display = display.none)
firstSessionName  = input.string("Tokyo", "Displayed name", group = FIRST_SESSION_GROUP, display = display.none, active = showFirst)
firstSessionTime  = input.session("0900-1500", "Session time", group = FIRST_SESSION_GROUP, display = display.none, active = showFirst)
firstSessionTZ    = input.string("Asia/Tokyo", "Session timezone", group = FIRST_SESSION_GROUP, display = display.none, tooltip = TZ_TOOLTIP_TEXT, active = showFirst)
firstSessionColor = input.color(color.new(#2962FF, 85), "Session color", group = FIRST_SESSION_GROUP, active = showFirst)

const string SECOND_SESSION_GROUP = "Second session"
showSecond         = input.bool(true, "Show session", group = SECOND_SESSION_GROUP, display = display.none)
secondSessionName  = input.string("London", "Displayed name", group = SECOND_SESSION_GROUP, display = display.none, active = showSecond)
secondSessionTime  = input.session("0830-1630", "Session time", group = SECOND_SESSION_GROUP, display = display.none, active = showSecond)
secondSessionTZ    = input.string("Europe/London", "Session timezone", group = SECOND_SESSION_GROUP, display = display.none, tooltip = TZ_TOOLTIP_TEXT, active = showSecond)
secondSessionColor = input.color(color.new(#FF9800, 85), "Session color", group = SECOND_SESSION_GROUP, active = showSecond)

const string THIRD_SESSION_GROUP = "Third session"
showThird         = input.bool(true, "Show session", group = THIRD_SESSION_GROUP, display = display.none)
thirdSessionName  = input.string("New York", "Displayed name", group = THIRD_SESSION_GROUP, display = display.none, active = showThird)
thirdSessionTime  = input.session("0930-1600", "Session time", group = THIRD_SESSION_GROUP, display = display.none, active = showThird)
thirdSessionTZ    = input.string("America/New_York", "Session timezone", group = THIRD_SESSION_GROUP, display = display.none, tooltip = TZ_TOOLTIP_TEXT, active = showThird)
thirdSessionColor = input.color(color.new(#089981, 85), "Session color", group = THIRD_SESSION_GROUP, active = showThird)

type SessionDisplay
    box   sessionBox
    label sessionLabel
    line  openLine
    line  avgLine
    line  closeLine
    float sumClose
    int   numOfBars

type SessionInfo
    color  color
    string name
    string session
    string timezone
    SessionDisplay active = na

method setName(SessionDisplay this, string name) =>
    sessionLabel = this.sessionLabel
    sessionBox = this.sessionBox
    boxText = array.new<string>()
    if showSessionTickRange
        boxText.push("Range: " + str.tostring((sessionBox.get_top() - sessionBox.get_bottom()) / syminfo.mintick, format.mintick))
    if showSessionAverage
        boxText.push("Avg: " + str.tostring(this.sumClose / this.numOfBars, format.mintick))
    if showSessionNames
        boxText.push(name)
    
    sessionLabel.set_y(sessionBox.get_bottom())
    sessionLabel.set_text(array.join(boxText, "\n"))

method createSessionDisplay(SessionInfo this) =>
    boxColor = this.color
    opaqueColor = color.new(boxColor, 0)
    dis = SessionDisplay.new(
      sessionBox = box.new(bar_index, high, bar_index, low, bgcolor = boxColor, border_color = na),
      sessionLabel = label.new(bar_index, low, "", style = label.style_label_upper_left, textalign = text.align_left, textcolor = opaqueColor, color = color(na)),
      openLine   = showSessionOC ? line.new(bar_index, open, bar_index, open, color = opaqueColor, style = line.style_dashed, width = 1) : na,
      closeLine  = showSessionOC ? line.new(bar_index, close, bar_index, close, color = opaqueColor, style = line.style_dashed, width = 1) : na,
      avgLine    = showSessionAverage ? line.new(bar_index, close, bar_index, close, style = line.style_dotted, width = 2, color = opaqueColor) : na,
      sumClose   = close,
      numOfBars  = 1
      )
    linefill.new(dis.openLine, dis.closeLine, boxColor)
    dis.setName(this.name)
    this.active := dis
    
method updateSessionDisplay(SessionInfo this) =>
    sessionDisp = this.active
    sessionBox = sessionDisp.sessionBox
    openLine = sessionDisp.openLine
    closeLine = sessionDisp.closeLine
    avgLine = sessionDisp.avgLine
    sessionDisp.sumClose += close
    sessionDisp.numOfBars += 1

    sessionBox.set_top(math.max(sessionBox.get_top(), high))
    sessionBox.set_bottom(math.min(sessionBox.get_bottom(), low))
    sessionBox.set_right(bar_index)
    sessionDisp.setName(this.name)

    if showSessionOC
        openLine.set_x2(bar_index)
        closeLine.set_x2(bar_index)
        closeLine.set_y1(close)
        closeLine.set_y2(close)

    if showSessionAverage
        avgLine.set_x2(bar_index)
        avg = sessionDisp.sumClose / sessionDisp.numOfBars
        avgLine.set_y1(avg)
        avgLine.set_y2(avg)
    sessionDisp

method update(SessionInfo this) =>
	bool isChange = timeframe.change("1D")
    if (not na(time("", this.session, this.timezone))) // inSession
        if na(this.active) or isChange
            this.createSessionDisplay()
        else 
            this.updateSessionDisplay()
    else if not na(this.active)
        this.active := na

getSessionInfos()=>
    array<SessionInfo> sessionInfos = array.new<SessionInfo>()
    if showFirst
        sessionInfos.push(SessionInfo.new(firstSessionColor, firstSessionName, firstSessionTime, firstSessionTZ))
    if showSecond
        sessionInfos.push(SessionInfo.new(secondSessionColor, secondSessionName, secondSessionTime, secondSessionTZ))
    if showThird
        sessionInfos.push(SessionInfo.new(thirdSessionColor, thirdSessionName, thirdSessionTime, thirdSessionTZ))
    sessionInfos

var array<SessionInfo> sessionInfos = getSessionInfos()
if timeframe.isdwm
    runtime.error("This indicator can only be used on intraday timeframes.")

for info in sessionInfos
    info.update()

------------------------
//@version=6
indicator("Positive Volume Index", "PVI", timeframe = "", timeframe_gaps = true)

int maLengthInput = input.int(255, "EMA length", 1)

// Calculate and plot the PVI and its EMA.
float pvi = ta.pvi * 1000.0
float ema = ta.ema(pvi, maLengthInput)

plot(pvi, "PVI")
plot(ema, "PVI-based EMA", #ff9800)

// Raise an error if no volume data is available.
if ta.cum(nz(volume)) == 0.0 and barstate.islastconfirmedhistory
    runtime.error("No volume is provided by the data vendor.")

------------------------
//@version=6
indicator("Price Momentum Oscillator", "PMO", timeframe = "", timeframe_gaps = true)

import TradingView/ta/11 as TVta

// Inputs
float sourceInput  = input.source(close, "Source")
int   length1Input = input.int(35, "Length 1", 1)
int   length2Input = input.int(20, "Length 2", 1)
int   signalInput  = input.int(10, "Signal length", 1)

// Calculate the PMO and signal line.
[pmo, signal] = TVta.pmo(sourceInput, length1Input, length2Input, signalInput)

// Plot the values, and display a zero line.
plot(pmo, "PMO")
plot(signal, "Signal", #ff6d00)
hline(0, "Zero")

------------------------
//@version=6
indicator("Pring's Special K", "Special K", timeframe = "", timeframe_gaps = true)

import TradingView/ta/11 as TVta

// Inputs
float sourceInput  = input.source(close, "Source")
int   length1Input = input.int(100, "Signal length 1", 1)
int   length2Input = input.int(100, "Signal length 2", 1)

// Calculate the Special K and twice-smoothed signal line.
[specialK, signal] = TVta.specialK(sourceInput, length1Input, length2Input)

// Plot the values, and display a zero line.
plot(specialK, "Special K")
plot(signal, "Signal", #ff6d00)
hline(0, "Zero")

// Raise an error if the chart's history is insufficient.
if last_bar_index < 724
    runtime.error("Not enough history on the chart. Choose a symbol or timeframe with a larger number of bars.")

------------------------
//@version=6
indicator("RCI Ribbon", "RCI Ribbon", precision = 2, timeframe = "", timeframe_gaps = true)

source 		 = input.source(close, title = "Source")
shortLength  = input.int(10, title = "Short RCI Length", minval = 1)
middleLength = input.int(30, title = "Middle RCI Length", minval = 1)
longLength 	 = input.int(50, title = "Long RCI Length", minval = 1)

plot(ta.rci(source, shortLength), title = "Short RCI", color = color.blue)
plot(ta.rci(source, middleLength), title = "Middle RCI", color = color.red)
plot(ta.rci(source, longLength), title = "Long RCI", color = color.green)

hline(0, "Middle band")
upper = hline(80, "Upper band")
lower = hline(-80, "Lower band")
fill(upper, lower, color.new(color.blue, 90))

------------------------
//@version=6
//Creator: Rob Booker.
plot(close, "Close Price", color = #00BCD4)
indicator(title="Rob Booker - Ziv Ghost Pivots", shorttitle="Ghost Pivots", overlay=true)
s4 = input(true, title="Show Next 4 HR Pivot") 
sd = input(true, title="Show Next Day (8 HR) Pivot")
sw = input(true, title="Show Next Week Pivot")
sm = input(true, title="Show Next Month Pivot")
//TODO: Need to change offsets so pivot is drawn ahead of last bar. The offset
// changes depending on the current time frame being displayed.
fourHR_offset = 0
day_offset = 0
week_offset = 0
month_offset = 0
// 8 HR pivot
etime_pivot = sd == true? request.security(syminfo.tickerid, "240", hlc3[0], barmerge.gaps_off, barmerge.lookahead_on): na
//tomorrows pivot
dtime_pivot = sd == true? request.security(syminfo.tickerid, "D", hlc3[0], barmerge.gaps_off, barmerge.lookahead_on): na
//Next Weeks pivot
wtime_pivot = sw == true? request.security(syminfo.tickerid, "W", hlc3[0], barmerge.gaps_off, barmerge.lookahead_on): na
//Next Months pivot
mtime_pivot = sm == true? request.security(syminfo.tickerid, "M", hlc3[0], barmerge.gaps_off, barmerge.lookahead_on): na
plotchar(etime_pivot, color=#00BCD4, char="8",text="", location = location.absolute, offset=fourHR_offset)
plotchar(dtime_pivot, color=#2962FF, char="d",text="", location = location.absolute, offset=day_offset)
plotchar(wtime_pivot, color=#673AB7, char="w",text="", location = location.absolute, offset=week_offset)
plotchar(mtime_pivot, color=#E91E63, char="m",text="", location = location.absolute, offset=month_offset)

------------------------
//@version=6
indicator(title="Parabolic SAR", shorttitle="SAR", overlay=true, timeframe="", timeframe_gaps=true)
start = input(0.02)
increment = input(0.02)
maximum = input(0.2, "Max value")
out = ta.sar(start, increment, maximum)
plot(out, "ParabolicSAR", style=plot.style_cross, color=#2962FF)

------------------------
//@version=6
indicator(title="Simple Moving Average", shorttitle="SMA", overlay=true, timeframe="", timeframe_gaps=true)
len = input.int(9, minval=1, title="Length")
src = input(close, title="Source")
offset = input.int(title="Offset", defval=0, minval=-500, maxval=500, display = display.none)
out = ta.sma(src, len)
plot(out, color=color.blue, title="MA", offset=offset)

// Smoothing MA inputs
GRP = "Smoothing"
TT_BB = "Only applies when 'SMA + Bollinger Bands' is selected. Determines the distance between the SMA and the bands."
maTypeInput = input.string("None", "Type", options = ["None", "SMA", "SMA + Bollinger Bands", "EMA", "SMMA (RMA)", "WMA", "VWMA"], group = GRP, display = display.none)
var isBB = maTypeInput == "SMA + Bollinger Bands"
maLengthInput = input.int(14, "Length", group = GRP, display = display.none, active = maTypeInput != "None")
bbMultInput = input.float(2.0, "BB StdDev", minval = 0.001, maxval = 50, step = 0.5, tooltip = TT_BB, group = GRP, display = display.none, active = isBB)
var enableMA = maTypeInput != "None"

// Smoothing MA Calculation
ma(source, length, MAtype) =>
	switch MAtype
		"SMA"                   => ta.sma(source, length)
		"SMA + Bollinger Bands" => ta.sma(source, length)
		"EMA"                   => ta.ema(source, length)
		"SMMA (RMA)"            => ta.rma(source, length)
		"WMA"                   => ta.wma(source, length)
		"VWMA"                  => ta.vwma(source, length)

// Smoothing MA plots
smoothingMA = enableMA ? ma(out, maLengthInput, maTypeInput) : na
smoothingStDev = isBB ? ta.stdev(out, maLengthInput) * bbMultInput : na
plot(smoothingMA, "SMA-based MA", color=color.yellow, display = enableMA ? display.all : display.none, editable = enableMA)
bbUpperBand = plot(smoothingMA + smoothingStDev, title = "Upper Bollinger Band", color=color.green, display = isBB ? display.all : display.none, editable = isBB)
bbLowerBand = plot(smoothingMA - smoothingStDev, title = "Lower Bollinger Band", color=color.green, display = isBB ? display.all : display.none, editable = isBB)
fill(bbUpperBand, bbLowerBand, color= isBB ? color.new(color.green, 90) : na, title="Bollinger Bands Background Fill", display = isBB ? display.all : display.none, editable = isBB)

------------------------
//@version=6
indicator("Zig Zag", overlay = true, max_lines_count = 500, max_labels_count = 500)

import TradingView/ZigZag/7 as ZigZagLib 

deviationInput = input.float(5.0, "Price deviation for reversals (%)", 0.00001, 100.0, 0.5, "0.00001 - 100"),
depthInput     = input.int(10, "Pivot legs", 2),
lineColorInput = input(#2962FF, "Line color", display = display.none),
extendInput    = input(true, "Extend to last bar", display = display.none),
showPriceInput = input(true, "Display reversal price", display = display.none),
showVolInput   = input(true, "Display cumulative volume", display = display.none),
showChgInput   = input(true, "Display reversal price change", inline = "priceRev", display = display.none),
priceDiffInput = input.string("Absolute", "", ["Absolute", "Percent"], inline = "priceRev", display = display.none, active = showChgInput)

// Create Zig Zag instance from user settings.
var zigZag = ZigZagLib.newInstance(
  	 ZigZagLib.Settings.new(
	 	 deviationInput, depthInput, lineColorInput, extendInput, showPriceInput, showVolInput, showChgInput, 
	 	 priceDiffInput, true)
 )

// Update 'zigZag' object on each bar with new ​pivots, ​volume, lines, labels.
zigZag.update()

------------------------
//@version=6
indicator(title="Stochastic", shorttitle="Stoch", format=format.price, precision=2, timeframe="", timeframe_gaps=true)
periodK = input.int(14, title="%K Length", minval=1)
smoothK = input.int(1, title="%K Smoothing", minval=1)
periodD = input.int(3, title="%D Smoothing", minval=1)
k = ta.sma(ta.stoch(close, high, low, periodK), smoothK)
d = ta.sma(k, periodD)
plot(k, title="%K", color=#2962FF)
plot(d, title="%D", color=#FF6D00)
h0 = hline(80, "Upper Band", color=#787B86)
hline(50, "Middle Band", color=color.new(#787B86, 50))
h1 = hline(20, "Lower Band", color=#787B86)
fill(h0, h1, color=color.rgb(33, 150, 243, 90), title="Background")

------------------------
//@version=6
indicator("Bull Bear Power", shorttitle="BBP")
lengthInput = input.int(13, title="Length")
bullPower = high - ta.ema(close, lengthInput)
bearPower = low - ta.ema(close, lengthInput)
bbp = bullPower + bearPower 
plot(bbp, color = bbp >= 0 ? #089981 : #f23645, title="BBPower", style = plot.style_columns)
hline(0, "Zero line")

------------------------
//@version=6
indicator("Bollinger Bars", overlay = true, explicit_plot_zorder = true, behind_chart = false)

plotcandle(high, high, low, low, "Bollinger Bars Wicks", color = #0D349E, bordercolor = #0D349E, wickcolor = na, display = display.pane)
col = close > open ? #089981 : #F23645
plotcandle(open, high, low, close, "Bollinger Bars Body", color = col, bordercolor = col, wickcolor = na)

------------------------
//@version=6
strategy("BarUpDn Strategy", overlay=true, default_qty_type = strategy.percent_of_equity, default_qty_value = 10)
maxIdLossPcnt = input.float(1, "Max intraday loss (%)")
strategy.risk.max_intraday_loss(maxIdLossPcnt, strategy.percent_of_equity)
if (close > open and open > close[1])
	strategy.entry("BarUp", strategy.long)
if (close < open and open < close[1])
	strategy.entry("BarDn", strategy.short)
//plot(strategy.equity, title="equity", color=color.red, linewidth=2, style=plot.style_areabr)

------------------------
//@version=6
indicator(title="Accumulation/Distribution", shorttitle="Accum/Dist", format=format.volume, overlay=false, timeframe="", timeframe_gaps=true)
var cumVol = 0.
cumVol += nz(volume)
if barstate.islast and cumVol == 0
    runtime.error("No volume is provided by the data vendor.")
ad = ta.cum(close==high and close==low or high==low ? 0 : ((2*close-low-high)/(high-low))*volume)
plot(ad, title = "Accumulation/Distribution", color=#999915)

------------------------
//@version=6
indicator("Seasonality", overlay = false, max_boxes_count = 500)

//#region ———————————————————— Constants, inputs, and global variables

// Tooltips
string TT_SY = "The year to start seasonality calculations. Box drawings start one year after this value."
string TT_PC = "The base color for boxes and table cells that show positive values."
string TT_NC = "The base color for boxes and table cells that show negative values."
string TT_CP = "The cutoff for maximum color intensity. Absolute values at or above this level have the same color."
string TT_WT = "The table width as a percentage of the pane where the table is located. If this value is 0, the width fits the contents of the table, and the table can be wider than the pane."
string TT_HG = "The table height as a percentage of the pane where the table is located. If this value is 0, the height fits the contents of the table, and the table can be taller than the pane."
string TT_SA = "Toggles the 'Avgs' row, which shows average change percentages for each month."
string TT_SD = "Toggles the 'StDev' row, which shows the standard deviation of each month's percentages."
string TT_SP = "Toggles the 'Pos%' row, which shows the percentage of positive changes in each month's column."
string TT_SM = "Specifies months to skip. Write months in the 'YYYY-MM' format, separated by commas and spaces."


// Start year setting 
int startYearInput = input.int(2015, "Starting year", minval = 1800, tooltip = TT_SY, display = display.none)

// Color settings 
string COLOR_GRP          = "Color settings"
color  posColorInput      = color.new(input.color(#089981, "Positive Color", group = COLOR_GRP, tooltip = TT_PC), 0)
color  negColorInput      = color.new(input.color(#F23745, "Negative Color", group = COLOR_GRP, tooltip = TT_NC), 0)
int    cutoffPercentInput = input.int(10, "Color intensity cutoff (%)", group = COLOR_GRP, tooltip = TT_CP, display = display.none)

// Table settings
string HEATMAP_GRP          = "Heatmap settings"
string tablePositionInput   = input.string("Center", "Table Position", options = ["Left", "Center", "Right"], group = HEATMAP_GRP, display = display.none)
float  tableWidthInput      = input.float(100, "Table Width (%)", maxval = 100, minval = 0, group = HEATMAP_GRP, tooltip = TT_WT,  display = display.none)
float  tableHeightInput     = input.float(95, "Table Height (%)", maxval = 100, minval = 0, group = HEATMAP_GRP, tooltip = TT_HG,  display = display.none)
bool   showAvgInput         = input.bool(true, "Show Averages",            group = HEATMAP_GRP, tooltip = TT_SA)
bool   showStDevInput       = input.bool(true, "Show Standard Deviation",  group = HEATMAP_GRP, tooltip = TT_SD)
bool   showPosInput         = input.bool(true, "Show Percent Positive",    group = HEATMAP_GRP, tooltip = TT_SP)
//@variable Controls the display of metric rows at the bottom of the Heatmap.
bool showMetrics = showAvgInput or showStDevInput or showPosInput

// Additional settings
string ADD_GRP            = "Additional settings"
string skippedMonthsInput = input.text_area("YYYY-MM, YYYY-MM", "Ignored months", group = ADD_GRP, tooltip = TT_SM)

//@variable An "int" array with all specific months to ignore, formatted as "YYYYMM".
var ignoredMonthsArray = array.new<int>()
if barstate.isfirst
    var ignoredStrArray = str.split(str.replace_all(skippedMonthsInput, " ", ""), ",")
    var ignoredIntArray = array.new<int>()
    for item in ignoredStrArray
        num = str.tonumber(str.replace_all(item, "-", ""))
        ignoredIntArray.push(math.round(num))
    ignoredMonthsArray := ignoredIntArray


//@variable The current year at the time.
int currYear = year(time_close - 1)
//@variable The current month at the time.
int currMonth = month(time_close - 1)

prevTimeClose = time_close[1] - 1
int prevBarYear  = year(prevTimeClose)
int prevBarMonth = month(prevTimeClose)
//#endregion


//#region ———————————————————— Functions and methods

//@function                 Calculates color used by the boxes and Heatmap cells.
//@param value              The percentage value for the calculation.
//@param topTranspValue     The cutoff value. An absolute `value` at or above this level returns the most intense color. 
//@returns                  The calculated color.
calcColor(float value, int topTranspValue = na) =>
    color naColor     = color.gray
    float heavyTransp = 50
    float lightTransp = 90
    color heavyColor  = color.new(value >= 0 ? posColorInput : negColorInput, heavyTransp)
    color lightColor  = color.new(value >= 0 ? posColorInput : negColorInput, lightTransp)
    color baseColor   = na(value) ? naColor : value >= 0 ? posColorInput : negColorInput
    color transpColor = color.from_gradient(math.abs(value), 0, topTranspValue, lightColor, heavyColor)
    color result      = na(topTranspValue) ? baseColor : transpColor

//@function                 Returns the one-bar change percentage of the `source`.
changePercent(float source) => 100.0 * (source - source[1]) / math.abs(source[1])

//@function                 Returns the number of non-na values in `this` array.
method nonNA(array<float> this) =>
    int result = 0
    for item in this
        if not na(item)
            result += 1
    result

//@function                 Returns the percentage of positive non-na values in `this` array.
method percentPositive(array<float> this) =>
    int nonNA = 0
    int pos   = 0
    for item in this
        if not na(item)
            nonNA += 1
            if item >= 0
                pos += 1
    float result = 100.0 * pos / nonNA

//@function                 Calculates a matrix of monthly changes, starting from the beginning of a specified year.
//@param startYear          The year where the calculations start.
//@returns                  A tuple containing an array of year indices and the matrix of monthly changes.
calculateMontlyChanges(int startYear, int prevBarYear, int prevBarMonth) =>
    var matrix<float> dataMatrix        = matrix.new<float>(0, 13)
    var array<int>    yearIndexArray    = array.new<int>()
    float             prevChangePercent = changePercent(close[1])
    if prevBarYear >= startYear and not ignoredMonthsArray.includes(prevBarYear * 100 + prevBarMonth)
        if prevBarYear != prevBarYear[1] or dataMatrix.rows() == 0
            dataMatrix.add_row()
            yearIndexArray.push(prevBarYear)
        dataMatrix.set(dataMatrix.rows() - 1, prevBarMonth, prevChangePercent)
    [yearIndexArray, dataMatrix]
//#endregion


//#region ———————————————————— Main calculations and outputs

// A tuple containing year indices and monthly changes.
[yearIndexArray, changesMatrix] = request.security(
     syminfo.tickerid, "1M", calculateMontlyChanges(startYearInput, prevBarYear, prevBarMonth), lookahead = barmerge.lookahead_on
 )

// Box drawing and plot calculations
var float currMonthAverage       = na
var float currMonthStDev         = na
var float currAvgNumberOfMonths  = na
var float currMonthExpectedPrice = na
if timeframe.change("1M") and not na(changesMatrix)
    currMonthAverage       := changesMatrix.col(currMonth).avg()
    currMonthStDev         := changesMatrix.col(currMonth).stdev(false)
    currAvgNumberOfMonths  := changesMatrix.col(currMonth).nonNA()
    currMonthExpectedPrice := close[1] + close[1] * currMonthAverage / 100
    // Draw a new monthly projection box.
    box.new(
         left          = time,
         top           = currMonthExpectedPrice,
         right         = time_close("1M"),
         bottom        = close[1],
         xloc          = xloc.bar_time,
         bgcolor       = calcColor(currMonthAverage, cutoffPercentInput),
         border_color  = calcColor(currMonthAverage),
         text          = str.tostring(currMonthAverage, format.percent),
         text_color    = color.new(chart.fg_color, 60),
         border_style  = line.style_dashed,
         force_overlay = true
     )

//@variable The display location for series plots, excluding `currAvgNumberOfMonths`.
displayLoc = display.data_window + display.status_line 
// Plot `currMonthExpectedPrice`, `currMonthAverage`, and `currMonthStDev` in the status line and Data Window.
plot(
     currMonthExpectedPrice, "Expected price for current month", color = calcColor(currMonthAverage), 
     display = displayLoc
 )
plot(
     currMonthAverage, "Historical average for current month", color = calcColor(currMonthAverage), 
     display = displayLoc, format = format.percent
 )
plot(
     currMonthStDev, "Historical standard deviation for current month", color = color.gray, 
     display = displayLoc, precision = 2
 )
// Plot `currAvgNumberOfMonths` in the Data Window.
plot(currAvgNumberOfMonths, "No. of months used in the current average", display = display.data_window, precision = 0)

//@variable An array containing the abbreviated names for each month.
var monthNames = array.from("Year", "Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec")

//@function Calculates the total number of rows to be displayed in the Heatmap table.
countRows(changesMatrix, showMetrics, showAvgInput, showStDevInput, showPosInput) =>
    totalRowCount = 1                       // Months header 
    totalRowCount += changesMatrix.rows()   // Number of years
    if showMetrics
        totalRowCount += 1 // Metrics divider
        totalRowCount += showAvgInput ? 1 : 0
        totalRowCount += showStDevInput ? 1 : 0
        totalRowCount += showPosInput ? 1 : 0
    totalRowCount


// Heatmap calculations
if barstate.islast

    tablePosition = switch tablePositionInput
        "Left" => position.bottom_left
        "Center" => position.bottom_center
        "Right" => position.bottom_right

    table dataTable           = table.new(tablePosition, 13, changesMatrix.rows() + 5)
    color informerCellBgcolor = color.new(color.gray, 80)
    color textColor           = chart.fg_color
    int   totalRowCount       = countRows(changesMatrix, showMetrics, showAvgInput, showStDevInput, showPosInput)
    float cellHeight          = tableHeightInput / totalRowCount
    float cellWidth           = tableWidthInput / 13.0

    // Month headers 
    for [index, item] in monthNames
        dataTable.cell(index, 0, item, bgcolor = informerCellBgcolor, text_color = textColor, height = cellHeight, width = cellWidth)
    // Monthly change data cell logic
    for [arrIndex, arr] in changesMatrix
        thisYear = yearIndexArray.get(arrIndex)
        for [itemIndex, item] in arr
            if itemIndex == 0
                dataTable.cell(
                         itemIndex, arrIndex + 1, str.tostring(thisYear), bgcolor = informerCellBgcolor, 
                         text_color = textColor, height = cellHeight, width = cellWidth
                     )
            else
                isSkipped = ignoredMonthsArray.includes(int(thisYear * 100 + itemIndex))
                cellText  = isSkipped ? "SKIP" : str.tostring(item, format.percent)
                cellColor = isSkipped ? color.new(color.gray, 50) : calcColor(item, cutoffPercentInput)
                dataTable.cell(itemIndex, arrIndex + 1, cellText, bgcolor = cellColor, text_color = textColor, height = cellHeight, width = cellWidth)
    // Metrics cell logic
    if showMetrics
        // Divider row for metrics display.
        dividerRow = changesMatrix.rows() + 1
        dataTable.cell(0, dividerRow, "", text_color = na, bgcolor = informerCellBgcolor, text_size = size.tiny, height = cellHeight, width = cellWidth)
        dataTable.merge_cells(0, dividerRow, 12, dividerRow)

        if showAvgInput
            // "Avgs" data cell calculations
            avgsRow = changesMatrix.rows() + 2
            dataTable.cell(0, avgsRow, "Avgs:", bgcolor = informerCellBgcolor, text_color = textColor, height = cellHeight, width = cellWidth)
            for i = 1 to changesMatrix.columns() - 1
                avgValue = changesMatrix.col(i).avg()
                dataTable.cell(
                     i, avgsRow, str.tostring(avgValue, format.percent), 
                     bgcolor = calcColor(avgValue, cutoffPercentInput), text_color = textColor, height = cellHeight, width = cellWidth
                 )
        // "StDev" data cell calculations
        if showStDevInput
            stDevRow = changesMatrix.rows() + 3
            dataTable.cell(0, stDevRow, "StDev:", bgcolor = informerCellBgcolor, text_color = textColor, height = cellHeight, width = cellWidth)
            for i = 1 to changesMatrix.columns() - 1
                stdevValue = changesMatrix.col(i).stdev(false)
                dataTable.cell(
                     i, stDevRow, str.tostring(stdevValue, "##.##"), bgcolor = color.new(color.gray, 80), 
                     text_color = textColor, height = cellHeight, width = cellWidth
                 )
        // "Pos%" data cell calculations
        if showPosInput
            ratioRow = changesMatrix.rows() + 4
            dataTable.cell(0, ratioRow, "Pos%:", bgcolor = informerCellBgcolor, text_color = textColor, height = cellHeight, width = cellWidth)
            for i = 1 to changesMatrix.columns() - 1
                ratioValue = changesMatrix.col(i).percentPositive()
                dataTable.cell(
                     i, ratioRow, str.tostring(ratioValue, '#') + "%", bgcolor = calcColor(ratioValue - 50, 50), 
                     text_color = textColor, height = cellHeight, width = cellWidth
                 )
//#endregion

------------------------
//@version=6
indicator(title="Triple EMA", shorttitle="TEMA", overlay=true, timeframe="", timeframe_gaps=true)
length = input.int(9, minval=1)
ema1 = ta.ema(close, length)
ema2 = ta.ema(ema1, length)
ema3 = ta.ema(ema2, length)
out = 3 * (ema1 - ema2) + ema3
plot(out, "TEMA", color=#2962FF)

------------------------
//@version=6
indicator(title="TRIX", shorttitle="TRIX", format=format.price, precision=2, timeframe="", timeframe_gaps=true)
length = input.int(18, minval=1)
out = 10000 * ta.change(ta.ema(ta.ema(ta.ema(math.log(close), length), length), length))
plot(out, color=#F44336, title="TRIX")
hline(0, color=#787B86, title="Zero")

------------------------
//@version=6
indicator(title="Moving Average Weighted", shorttitle="WMA", overlay=true, timeframe="", timeframe_gaps=true)
len = input.int(9, minval=1, title="Length")
src = input(close, title="Source")
offset = input.int(title="Offset", defval=0, minval=-500, maxval=500, display = display.none)
out = ta.wma(src, len)
plot(out, title="WMA", color=color.blue, offset=offset)

------------------------
//@version=6
indicator(title="Median", overlay=true, timeframe="", timeframe_gaps=true)
source = input(hl2, title="Median Source")
length = input(3, title="Median Length")
atr_length = input(14, title="ATR Length")
atr_mult = input(2, title="ATR Multiplier")

median = ta.percentile_nearest_rank(source, length, 50)
median_plot = plot(median, color=color.red, linewidth=3, title="Median")

atr_ = atr_mult * ta.atr(atr_length)

plot(median + atr_, color=color.lime, title="Upper Band")
plot(median - atr_, color=color.fuchsia, title="Lower Band")

median_ema = ta.ema(median, length)
ema_plot = plot(median_ema, color=color.blue, title="Median EMA")

fill(median_plot, ema_plot,  title="Fill color", color = median > median_ema ? color.new(color.lime, 10) : color.new(color.fuchsia, 10))

------------------------
//@version=6
indicator(title = "Advance Decline Ratio", shorttitle="ADR", format=format.price, precision=2)
ratio(t1, t2, source) => request.security(t1, timeframe.period, source) / request.security(t2, timeframe.period, source)
plot(ratio("USI:ADVN.NY", "USI:DECL.NY", close))

------------------------
//@version=6
indicator("Advance/Decline Ratio (Bars)", shorttitle="ADR_B", format=format.price, precision=2, timeframe="", timeframe_gaps=true)
length = input.int(9, minval=1)
isUp = (close - open) >= 0.0
upBars = math.sum(isUp ? 1 : 0, length)
downBars = math.sum(not isUp ? 1 : 0, length)
ad = downBars == 0 ? upBars : upBars / downBars
plot(ad, "ADR_B", #2962FF)
hline(1.0, "Equality Line", #787B86)

------------------------
//@version=6
indicator(title="Rate Of Change", shorttitle="ROC", format=format.price, precision=2, timeframe="", timeframe_gaps=true)
length = input.int(9, minval=1)
source = input(close, "Source")
roc = 100 * (source - source[length])/source[length]
plot(roc, color=#2962FF, title="ROC")
hline(0, color=#787B86, title="Zero Line")

------------------------
//@version=6
indicator("Ulcer Index", timeframe = "", timeframe_gaps = true)

import TradingView/ta/11 as TVta

// Inputs
float sourceInput = input.source(close, "Source")
int   lengthInput = input.int(14, "Length", 1)

// Calculate and plot the Ulcer Index.
float ui = TVta.ulcerIndex(sourceInput, lengthInput)

uiPlot   = plot(ui, "Ulcer Index")
zeroPlot = plot(0, "", display = display.none, editable = false)
fill(uiPlot, zeroPlot, #2196f31a)
hline(0, "Zero")

------------------------
//@version=6
indicator(title = "Chop Zone", format=format.price, precision=0, timeframe="", timeframe_gaps=true)
colorTurquoise = #26C6DA
colorDarkGreen = #43A047
colorPaleGreen = #A5D6A7
colorLime = #009688
colorDarkRed = #D50000
colorRed = #E91E63
colorOrange = #FF6D00
colorLightOrange = #FFB74D
colorYellow = #FDD835
source = close
avg = hlc3
pi = math.atan(1) * 4
periods = 30
highestHigh = ta.highest(periods)
lowestLow = ta.lowest(periods)
span = 25 / (highestHigh - lowestLow) * lowestLow
ema34 = ta.ema(source, 34)
x1_ema34 = 0
x2_ema34 = 1
y1_ema34 = 0
y2_ema34 = (ema34[1] - ema34) / avg * span
c_ema34 = math.sqrt((x2_ema34 - x1_ema34)*(x2_ema34 - x1_ema34) + (y2_ema34 - y1_ema34)*(y2_ema34 - y1_ema34))
emaAngle_1 = math.round(180 * math.acos((x2_ema34 - x1_ema34)/c_ema34) / pi)
emaAngle = y2_ema34 > 0? - emaAngle_1: emaAngle_1
chopZoneColor = emaAngle >= 5 ? colorTurquoise : emaAngle < 5 and emaAngle >= 3.57 ? colorDarkGreen : emaAngle < 3.57 and emaAngle >= 2.14 ? colorPaleGreen : emaAngle < 2.14 and emaAngle >= .71 ? colorLime : emaAngle <= -1 * 5 ? colorDarkRed : emaAngle > -1 * 5 and emaAngle <= -1 * 3.57 ? colorRed : emaAngle > -1 * 3.57 and emaAngle <= -1 * 2.14 ? colorOrange : emaAngle > -1 * 2.14 and emaAngle <= -1 * .71 ? colorLightOrange : colorYellow
plot(1, "Chop Zone", color = chopZoneColor, style = plot.style_columns)

------------------------
//@version=6
indicator(title="Woodies CCI", timeframe="", timeframe_gaps=true)
cciTurboLength = input.int(title="CCI Turbo Length", defval=6, minval=3, maxval=14)
cci14Length = input.int(title="CCI 14 Length", defval=14, minval=7, maxval=20)
source = close
cciTurbo = ta.cci(source, cciTurboLength)
cci14 = ta.cci(source, cci14Length)
last5IsDown = cci14[5] < 0 and cci14[4] < 0 and cci14[3] < 0 and cci14[2] < 0 and cci14[1] < 0
last5IsUp = cci14[5] > 0 and cci14[4] > 0 and cci14[3] > 0 and cci14[2] > 0 and cci14[1] > 0
histogramColor = last5IsUp ? #009688 : last5IsDown ? #F44336 : cci14 < 0 ? #009688 : #F44336
plot(cci14, title="CCI Turbo Histogram", color=histogramColor, style=plot.style_histogram)
plot(cciTurbo, title="CCI Turbo", color=#009688 , style=plot.style_line)
plot(cci14, title="CCI 14", color= #F44336, style=plot.style_line)
hline(0, title="Zero Line", color=#787B86, linestyle=hline.style_solid)
hline(100, title="Hundred Line", color=#787B86, linestyle=hline.style_dotted)
hline(-100, title="Minus Line", color=#787B86, linestyle=hline.style_dotted)

------------------------
//@version=6
indicator(title="Price Volume Trend", shorttitle="PVT", format=format.volume, timeframe="", timeframe_gaps=true)
var cumVol = 0.
cumVol += nz(volume)
if barstate.islast and cumVol == 0
    runtime.error("No volume is provided by the data vendor.")
src = close
vt = ta.cum(ta.change(src)/src[1]*volume)
plot(vt, color=#2962FF, title="PVT")

------------------------
//@version=6
indicator(title="Momentum", shorttitle="Mom", timeframe="", timeframe_gaps=true)
len = input.int(10, minval=1, title="Length")
src = input(close, title="Source")
mom = src - src[len]
plot(mom, color=#2962FF, title="MOM")

------------------------

