Đây là phần tài liệu tham khảo của Pine Script v6 được công bố chính thức từ Trading View
------------------------

strategy("Rob Booker - ADX Breakout", shorttitle="ADX Breakout", overlay=true)
//Developer: Andrew Palladino. 
//Creator: Rob Booker.
//Date: 9/29/2017


adxSmoothPeriod = input(14, title="ADX Smoothing Period")
adxPeriod = input(14, title="ADX Period")
adxLowerLevel = input(18, title="ADX Lower Level")
profitTargetMultiple = input(1, title="Profit Target Box Width Multiple")
stopLossMultiple = input(0.5, title="Stop Loss Box Width Multiple")
boxLookBack = input(20, title="BreakoutBox Lookback Period")
enableDirection = input(0, title="Both(0), Long(1), Short(-1)")



// When the ADX drops below threshold limit, then we consider the pair in consolidation. 
// Set Box around highs and lows of the last 20 candles. with upper and lower boundaries. 
// When price breaks outside of box, a trade is taken. (on close or on touch?)
// Stop is placed, default 50%, of the size of the box. So if box is 200 pips, stop is at 100 pips. 
// Profit target is 100% of the size of the box. Default. User can set a profit target of 0.5, 1 full size, 2 or 3. 


dirmov(len) =>
	up = change(high)
	down = -change(low)
	truerange = rma(tr, len)
	plus = fixnan(100 * rma(up > down and up > 0 ? up : 0, len) / truerange)
	minus = fixnan(100 * rma(down > up and down > 0 ? down : 0, len) / truerange)
	[plus, minus]

adx(dilen, adxlen) => 
	[plus, minus] = dirmov(dilen)
	sum = plus + minus
	adx = 100 * rma(abs(plus - minus) / (sum == 0 ? 1 : sum), adxlen)

adxHigh(dilen, adxlen) => 
	[plus, minus] = dirmov(dilen)
	plus
	
adxLow(dilen, adxlen) => 
	[plus, minus] = dirmov(dilen)
	minus
	
sig = adx(adxSmoothPeriod, adxPeriod)
//sigHigh = adxHigh(dilen, adxlen)
//sigLow = adxLow(dilen, adxlen)

isADXLow = sig < adxLowerLevel


boxUpperLevel = strategy.position_size == 0 ? highest(high, boxLookBack)[1] : boxUpperLevel[1]
boxLowerLevel = strategy.position_size == 0 ? lowest(low, boxLookBack)[1] : boxLowerLevel[1]
boxWidth = boxUpperLevel - boxLowerLevel

profitTarget = strategy.position_size > 0  ? strategy.position_avg_price + profitTargetMultiple*boxWidth : strategy.position_size < 0 ?  strategy.position_avg_price - profitTargetMultiple*boxWidth : na
stopLoss = strategy.position_size > 0 ? strategy.position_avg_price - stopLossMultiple*boxWidth : strategy.position_size < 0 ? strategy.position_avg_price + stopLossMultiple*boxWidth : na


plot(boxUpperLevel, "Box Upper Level", color = black)
plot(boxLowerLevel, "Box Lower Level", color = black)

bgcolor(isADXLow ? purple : na)
plot(stopLoss, color=red, linewidth=2, title="StopLossLine")
plot(profitTarget, color=blue, linewidth=2, title="ProfitTargetLine")

isBuyValid = strategy.position_size == 0 and cross(close, boxUpperLevel) and isADXLow
isSellValid = strategy.position_size == 0 and cross(close, boxLowerLevel) and isADXLow

//Long Entry Condition
entry_long = isBuyValid and strategy.opentrades == 0 and (enableDirection == 1 or enableDirection == 0)
strategy.order("open_long", true, when=entry_long)
strategy.exit(id="close_long", from_entry="open_long", stop=stopLoss, limit=profitTarget)

//Short Entry condition
entryShort = isSellValid and strategy.opentrades == 0 and (enableDirection == -1 or enableDirection == 0)
strategy.order("open_short", false, when=entryShort)
strategy.exit(id="close_short", from_entry="open_short", stop=stopLoss, limit=profitTarget)

------------------------
//@version=6
strategy("Bollinger Bands Strategy", overlay=true)
source = close
length = input.int(20, minval=1)
mult = input.float(2.0, minval=0.001, maxval=50)
basis = ta.sma(source, length)
dev = mult * ta.stdev(source, length)
upper = basis + dev
lower = basis - dev
buyEntry = ta.crossover(source, lower)
sellEntry = ta.crossunder(source, upper)
if (ta.crossover(source, lower))
	strategy.entry("BBandLE", strategy.long, stop=lower, oca_name="BollingerBands", oca_type=strategy.oca.cancel, comment="BBandLE")
else
	strategy.cancel(id="BBandLE")
if (ta.crossunder(source, upper))
	strategy.entry("BBandSE", strategy.short, stop=upper, oca_name="BollingerBands", oca_type=strategy.oca.cancel, comment="BBandSE")
else
	strategy.cancel(id="BBandSE")
//plot(strategy.equity, title="equity", color=color.red, linewidth=2, style=plot.style_areabr)

------------------------
//@version=6
strategy("Bollinger Bands Strategy directed", overlay=true)
source = close
length = input.int(20, minval=1)
mult = input.float(2.0, minval=0.001, maxval=50)
direction = input.int(0, title = "Strategy Direction", minval=-1, maxval=1)
strategy.risk.allow_entry_in(direction == 0 ? strategy.direction.all : (direction < 0 ? strategy.direction.short : strategy.direction.long))
basis = ta.sma(source, length)
dev = mult * ta.stdev(source, length)
upper = basis + dev
lower = basis - dev
if (ta.crossover(source, lower))
	strategy.entry("BBandLE", strategy.long, stop=lower, oca_name="BollingerBands", oca_type=strategy.oca.cancel, comment="BBandLE")
else
	strategy.cancel(id="BBandLE")
if (ta.crossunder(source, upper))
	strategy.entry("BBandSE", strategy.short, stop=upper, oca_name="BollingerBands", oca_type=strategy.oca.cancel, comment="BBandSE")
else
	strategy.cancel(id="BBandSE")
//plot(strategy.equity, title="equity", color=color.red, linewidth=2, style=plot.style_areabr)

------------------------
//@version=6
strategy(title="Technical Ratings Strategy", shorttitle="Technicals Strategy", default_qty_type = strategy.percent_of_equity, default_qty_value = 5, overlay=true)
res = input.timeframe("", title="Indicator Timeframe")
ratingSignal = input.string(defval = "All", title = "Rating is based on", options = ["MAs", "Oscillators", "All"])

import TradingView/TechnicalRating/3 as rating

StrongBound = 0.5
WeakBound = 0.1

getSignal(ratingTotal, ratingOther, ratingMA) =>
    if ratingSignal == "MAs"
        ratingMA
    else if ratingSignal == "Oscillators"
        ratingOther
    else
    	ratingTotal
    
[ratingTotal, ratingOther, ratingMA]  = request.security(syminfo.tickerid, res, rating.calcRatingAll())
tradeSignal = getSignal(ratingTotal, ratingOther, ratingMA)

dynSLpoints(factor) => factor * ta.atr(14) / syminfo.mintick

if tradeSignal > StrongBound
    strategy.entry("long", strategy.long)
if tradeSignal < -StrongBound
    strategy.entry("short", strategy.short)
strategy.exit("sl/tp", loss = dynSLpoints(3), trail_points = dynSLpoints(5), trail_offset = dynSLpoints(2))

------------------------
//@version=6
strategy("Greedy Strategy", pyramiding = 100, calc_on_order_fills=false, overlay=true)
tp = input(10, "Take profit")
sl = input(10, "Stop loss")
maxidf = input(title="Max intraday filled orders", defval=5)
strategy.risk.max_intraday_filled_orders(maxidf)
upGap = open > high[1]
dnGap = open < low[1]
dn = strategy.position_size < 0 and open > close
up = strategy.position_size > 0 and open < close
if upGap
    strategy.entry("GapUp", strategy.long, stop = high[1])
else
    strategy.cancel("GapUp")
if dn
    strategy.entry("Dn", strategy.short, stop = close)
else
    strategy.cancel("Dn")
if dnGap
    strategy.entry("GapDn", strategy.short, stop = low[1])
else
    strategy.cancel("GapDn")
if up
    strategy.entry("Up", strategy.long, stop = close)
else
    strategy.cancel("Up")
XQty = strategy.position_size < 0 ? -strategy.position_size : strategy.position_size
dir = strategy.position_size < 0 ? -1 : 1
lmP = strategy.position_avg_price + dir*tp*syminfo.mintick
slP = strategy.position_avg_price - dir*sl*syminfo.mintick
float nav = na
revCond = strategy.position_size > 0 ? dnGap : (strategy.position_size < 0 ? upGap : false)
if not revCond and XQty > 0
    strategy.order("TP", strategy.position_size < 0 ? strategy.long : strategy.short, XQty, lmP, nav, "TPSL",  strategy.oca.reduce, "TPSL")
    strategy.order("SL", strategy.position_size < 0 ? strategy.long : strategy.short, XQty, nav, slP, "TPSL",  strategy.oca.reduce, "TPSL")
if XQty == 0 or revCond
    strategy.cancel("TP")
    strategy.cancel("SL")
//plot(strategy.equity, title="equity", color=color.red, linewidth=2, style=plot.style_areabr)

------------------------
//@version=6
strategy("InSide Bar Strategy", overlay=true)
if (high < high[1] and low > low[1])
	if (close > open)
		strategy.entry("InsBarLE", strategy.long, comment="InsBarLE")
	if (close < open)
		strategy.entry("InsBarSE", strategy.short, comment="InsBarSE")
//plot(strategy.equity, title="equity", color=color.red, linewidth=2, style=plot.style_areabr)

------------------------
//@version=6
strategy("Price Channel Strategy", overlay=true)
length = input(20)
hh = ta.highest(high, length)
ll = ta.lowest(low, length)
if (not na(close[length]))
	strategy.entry("PChLE", strategy.long, comment="PChLE", stop=hh)
	strategy.entry("PChSE", strategy.short, comment="PChSE", stop=ll)
//plot(strategy.equity, title="equity", color=color.red, linewidth=2, style=plot.style_areabr)

------------------------
//@version=6
strategy(title="Keltner Channels Strategy", overlay=true)
length = input.int(20, minval=1)
mult = input.float(2.0, "Multiplier")
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
crossUpper = ta.crossover(src, upper)
crossLower = ta.crossunder(src, lower)
bprice = 0.0
bprice := crossUpper ? high+syminfo.mintick : nz(bprice[1])
sprice = 0.0
sprice := crossLower ? low -syminfo.mintick : nz(sprice[1])
crossBcond = false
crossBcond := crossUpper ? true : crossBcond[1]
crossScond = false
crossScond := crossLower ? true : crossScond[1]
cancelBcond = crossBcond and (src < ma or high >= bprice )
cancelScond = crossScond and (src > ma or low <= sprice )
if (cancelBcond)
	strategy.cancel("KltChLE")
if (crossUpper)
	strategy.entry("KltChLE", strategy.long, stop=bprice, comment="KltChLE")
if (cancelScond)
	strategy.cancel("KltChSE")
if (crossLower)
	strategy.entry("KltChSE", strategy.short, stop=sprice, comment="KltChSE")

------------------------
//@version=6
strategy("MACD Strategy", overlay=true)
fastLength = input(12, "Fast length")
slowlength = input(26, "Slow length")
MACDLength = input(9, "MACD length")
MACD = ta.ema(close, fastLength) - ta.ema(close, slowlength)
aMACD = ta.ema(MACD, MACDLength)
delta = MACD - aMACD
if (ta.crossover(delta, 0))
	strategy.entry("MacdLE", strategy.long, comment="MacdLE")
if (ta.crossunder(delta, 0))
	strategy.entry("MacdSE", strategy.short, comment="MacdSE")
//plot(strategy.equity, title="equity", color=color.red, linewidth=2, style=plot.style_areabr)

------------------------
//@version=6
strategy("Pivot Extension Strategy", overlay=true)
leftBars = input(4, "Pivot Lookback Left")
rightBars = input(2, "Pivot Lookback Right")
ph = ta.pivothigh(leftBars, rightBars)
pl = ta.pivotlow(leftBars, rightBars)
if (not na(pl))
	strategy.entry("PivExtLE", strategy.long, comment="PivExtLE")
if (not na(ph))
	strategy.entry("PivExtSE", strategy.short, comment="PivExtSE")
//plot(strategy.equity, title="equity", color=color.red, linewidth=2, style=plot.style_areabr)

------------------------
//@version=6
strategy("OutSide Bar Strategy", overlay=true)
if (high > high[1] and low < low[1])
	if (close > open)
		strategy.entry("OutBarLE", strategy.long, comment="OutBarLE")
	if (close < open)
		strategy.entry("OutBarSE", strategy.short, comment="OutBarSE")
//plot(strategy.equity, title="equity", color=color.red, linewidth=2, style=plot.style_areabr)

------------------------
//@version=6
strategy("Parabolic SAR Strategy", overlay=true)
start = input(0.02)
increment = input(0.02)
maximum = input(0.2)
var bool uptrend = false
var float EP = na
var float SAR = na
var float AF = start
var float nextBarSAR = na
if bar_index > 0
	firstTrendBar = false
	SAR := nextBarSAR
	if bar_index == 1
		float prevSAR = na
		float prevEP = na
		lowPrev = low[1]
		highPrev = high[1]
		closeCur = close
		closePrev = close[1]
		if closeCur > closePrev
			uptrend := true
			EP := high
			prevSAR := lowPrev
			prevEP := high
		else
			uptrend := false
			EP := low
			prevSAR := highPrev
			prevEP := low
		firstTrendBar := true
		SAR := prevSAR + start * (prevEP - prevSAR)
	if uptrend
		if SAR > low
			firstTrendBar := true
			uptrend := false
			SAR := math.max(EP, high)
			EP := low
			AF := start
	else
		if SAR < high
			firstTrendBar := true
			uptrend := true
			SAR := math.min(EP, low)
			EP := high
			AF := start
	if not firstTrendBar
		if uptrend
			if high > EP
				EP := high
				AF := math.min(AF + increment, maximum)
		else
			if low < EP
				EP := low
				AF := math.min(AF + increment, maximum)
	if uptrend
		SAR := math.min(SAR, low[1])
		if bar_index > 1
			SAR := math.min(SAR, low[2])
	else
		SAR := math.max(SAR, high[1])
		if bar_index > 1
			SAR := math.max(SAR, high[2])
	nextBarSAR := SAR + AF * (EP - SAR)
	if barstate.isconfirmed
		if uptrend
			strategy.entry("ParSE", strategy.short, stop=nextBarSAR, comment="ParSE")
			strategy.cancel("ParLE")
		else
			strategy.entry("ParLE", strategy.long, stop=nextBarSAR, comment="ParLE")
			strategy.cancel("ParSE")

plot(SAR,        "SAR",          style = plot.style_cross, linewidth = 3, color = color.orange)
plot(nextBarSAR, "Next bar SAR", style = plot.style_cross, linewidth = 3, color = color.aqua)
//plot(strategy.equity, title="equity", color=color.red, linewidth=2, style=plot.style_areabr)

------------------------
//@version=6
strategy("ChannelBreakOutStrategy", overlay=true)
length = input.int(title="Length", minval=1, maxval=1000, defval=5)
upBound = ta.highest(high, length)
downBound = ta.lowest(low, length)
if (not na(close[length]))
	strategy.entry("ChBrkLE", strategy.long, stop=upBound + syminfo.mintick, comment="ChBrkLE")
strategy.entry("ChBrkSE", strategy.short, stop=downBound - syminfo.mintick, comment="ChBrkSE")
//plot(strategy.equity, title="equity", color=color.red, linewidth=2, style=plot.style_areabr)

------------------------
//@version=6
strategy("Pivot Reversal Strategy", overlay=true)
leftBars = input(4, "Pivot Lookback Left")
rightBars = input(2, "Pivot Lookback Right")
swh = ta.pivothigh(leftBars, rightBars)
swl = ta.pivotlow(leftBars, rightBars)
swh_cond = not na(swh)
hprice = 0.0
hprice := swh_cond ? swh : hprice[1]
le = false
le := swh_cond ? true : (le[1] and high > hprice ? false : le[1])
if (le)
	strategy.entry("PivRevLE", strategy.long, comment="PivRevLE", stop=hprice + syminfo.mintick)
swl_cond = not na(swl)
lprice = 0.0
lprice := swl_cond ? swl : lprice[1]
se = false
se := swl_cond ? true : (se[1] and low < lprice ? false : se[1])
if (se)
	strategy.entry("PivRevSE", strategy.short, comment="PivRevSE", stop=lprice - syminfo.mintick)
//plot(strategy.equity, title="equity", color=color.red, linewidth=2, style=plot.style_areabr)

------------------------
//@version=6
strategy("RSI Strategy", overlay=true)
length = input(14, "Length")
overSold = input(30, "Oversold")
overBought = input(70, "Overbought")
price = close
vrsi = ta.rsi(price, length)
co = ta.crossover(vrsi, overSold)
cu = ta.crossunder(vrsi, overBought)
if (not na(vrsi))
	if (co)
		strategy.entry("RsiLE", strategy.long, comment="RsiLE")
	if (cu)
		strategy.entry("RsiSE", strategy.short, comment="RsiSE")
//plot(strategy.equity, title="equity", color=color.red, linewidth=2, style=plot.style_areabr)

------------------------
//@version=6
strategy("Supertrend Strategy", overlay=true, default_qty_type=strategy.percent_of_equity, default_qty_value=15)

atrPeriod = input(10, "ATR Length")
factor = input.float(3.0, "Factor", step = 0.01)

[_, direction] = ta.supertrend(factor, atrPeriod)

if ta.change(direction) < 0
    strategy.entry("My Long Entry Id", strategy.long)

if ta.change(direction) > 0
    strategy.entry("My Short Entry Id", strategy.short)

//plot(strategy.equity, title="equity", color=color.red, linewidth=2, style=plot.style_areabr)

------------------------
//@version=6
strategy("Stochastic Slow Strategy", overlay=true)
length = input.int(14, "Length", minval=1)
OverBought = input(80, "Overbought")
OverSold = input(20, "Oversold")
smoothK = 3
smoothD = 3
k = ta.sma(ta.stoch(close, high, low, length), smoothK)
d = ta.sma(k, smoothD)
co = ta.crossover(k,d)
cu = ta.crossunder(k,d)
if (not na(k) and not na(d))
	if (co and k < OverSold)
		strategy.entry("StochLE", strategy.long, comment="StochLE")
	if (cu and k > OverBought)
		strategy.entry("StochSE", strategy.short, comment="StochSE")
//plot(strategy.equity, title="equity", color=color.red, linewidth=2, style=plot.style_areabr)

------------------------
//@version=6
strategy("Consecutive Up/Down Strategy", overlay=true)
consecutiveBarsUp = input(3, "Consecutive bars up")
consecutiveBarsDown = input(3, "Consecutive bars down")
price = close
ups = 0.0
ups := price > price[1] ? nz(ups[1]) + 1 : 0
dns = 0.0
dns := price < price[1] ? nz(dns[1]) + 1 : 0
if (ups >= consecutiveBarsUp)
	strategy.entry("ConsUpLE", strategy.long, comment="ConsUpLE")
if (dns >= consecutiveBarsDown)
	strategy.entry("ConsDnSE", strategy.short, comment="ConsUpLE")
//plot(strategy.equity, title="equity", color=color.red, linewidth=2, style=plot.style_areabr)

------------------------
//@version=6
strategy("Volty Expan Close Strategy", overlay=true)
length = input(5, "Length")
numATRs = input(0.75, "ATR Mult")
atrs = ta.sma(ta.tr, length)*numATRs
if (not na(close[length]))
	strategy.entry("VltClsLE", strategy.long, stop=close+atrs, comment = "VltClsLE")
	strategy.entry("VltClsSE", strategy.short, stop=close-atrs, comment = "VltClsSE")
//plot(strategy.equity, title="equity", color=color.red, linewidth=2, style=plot.style_areabr)

------------------------
//@version=6
strategy("Momentum Strategy", overlay=true)
length = input(12)
price = close
momentum(seria, length) =>
	mom = seria - seria[length]
	mom
mom0 = momentum(price, length)
mom1 = momentum( mom0, 1)
if (mom0 > 0 and mom1 > 0)
	strategy.entry("MomLE", strategy.long, stop=high+syminfo.mintick, comment="MomLE")
else
	strategy.cancel("MomLE")
if (mom0 < 0 and mom1 < 0)
	strategy.entry("MomSE", strategy.short, stop=low-syminfo.mintick, comment="MomSE")
else
	strategy.cancel("MomSE")
//plot(strategy.equity, title="equity", color=color.red, linewidth=2, style=plot.style_areabr)

------------------------


