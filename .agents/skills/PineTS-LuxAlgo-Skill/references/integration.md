# PineTS Integration Guide

## Table of Contents
- [Data providers](#data-providers)
- [Initialization options](#initialization-options)
- [Output format](#output-format)
- [Browser usage](#browser-usage)
- [Live streaming](#live-streaming)
- [Custom data source](#custom-data-source)
- [Multi-timeframe (request.security)](#multi-timeframe)

---

## Data Providers

```typescript
import { Provider } from '@luxalgo/pinets/marketData/Provider.class';

// Binance (live OHLCV data)
Provider.Binance

// Mock (for testing, deterministic)
Provider.Mock

// Custom: implement IProvider interface
```

---

## Initialization Options

```typescript
const pineTS = new PineTS(
    provider,       // Provider.Binance | Provider.Mock | custom
    symbol,         // 'BTCUSDT', 'ETHUSDT.P' (perpetual)
    timeframe,      // '1','3','5','15','30','60','120','240','1D','1W','1M'
    inputs,         // null or { paramName: value } for input() calls
    startDate,      // timestamp ms (or null for last N candles)
    endDate,        // timestamp ms
);
```

**Warmup pattern** — fetch extra bars so indicators initialize properly:

```typescript
// Fetch 700 bars, use last 500 (200 warmup for long-period indicators)
// Achieved by setting startDate further back:
const warmupBars = 200;
const targetBars = 500;
const msPerBar = 60 * 60 * 1000; // 1h in ms
const endDate = Date.now();
const startDate = endDate - (targetBars + warmupBars) * msPerBar;

const { plots } = await pineTS.run(indicator);
// plots will contain all bars; slice the last 500 yourself
const last500 = plots['MyPlot'].data.slice(-500);
```

---

## Output Format

```typescript
const { plots, indicator: meta } = await pineTS.run(myIndicator);

// meta: { title: string, overlay: boolean }
// plots: Record<string, PlotData>

interface PlotData {
    title: string;
    options: { color?: string; linewidth?: number; /* ... */ };
    data: Array<{ time: number; value: number }>;
}

// Access values
const allValues = plots['RSI'].data;              // all bars
const lastValue = plots['RSI'].data.at(-1)!.value; // most recent
const lastTime  = plots['RSI'].data.at(-1)!.time;  // ms timestamp
```

**Filtering signal-based indicators** (mostly null/false):

```typescript
// Only keep bars where a signal fired
const signals = plots['Buy'].data.filter(d => d.value !== null && d.value !== false);
```

---

## Browser Usage

```html
<script type="module">
import { PineTS } from 'https://cdn.jsdelivr.net/npm/@luxalgo/pinets/dist/browser/index.js';
import { Provider } from 'https://cdn.jsdelivr.net/npm/@luxalgo/pinets/dist/browser/marketData/Provider.js';

const pineTS = new PineTS(Provider.Binance, 'BTCUSDT', '60', null,
    new Date('2024-01-01').getTime(), new Date('2024-01-10').getTime());

const { plots } = await pineTS.run(($) => {
    const { close } = $.data;
    const { ta, plot } = $.pine;
    plot(ta.rsi(close, 14), 'RSI');
});
</script>
```

---

## Live Streaming

```typescript
// Enable streaming with eDate = null and a callback
const pineTS = new PineTS(
    Provider.Binance,
    'BTCUSDT',
    '60',
    null,
    new Date('2024-01-01').getTime(),
    null, // null eDate enables streaming
);

await pineTS.run(indicator, {
    onBar: (bar, plots) => {
        console.log('New bar:', bar.time, plots);
    }
});
```

---

## Custom Data Source

Implement the `IProvider` interface to use your own data (CSV, database, other exchanges):

```typescript
import { IProvider } from '@luxalgo/pinets/marketData/IProvider';

class MyProvider implements IProvider {
    async getCandles(symbol: string, timeframe: string, start: number, end: number) {
        // Return array of OHLCV objects:
        return [
            { time: 1704067200000, open: 42000, high: 42500, low: 41800, close: 42300, volume: 1234 },
            // ...
        ];
    }
}

const pineTS = new PineTS(new MyProvider(), 'MYASSET', '1D', null, startMs, endMs);
```

---

## Multi-Timeframe

`request.security()` works inside PineTS indicators:

```typescript
pineTS.run(($) => {
    const { close } = $.data;
    const { ta, plot, request } = $.pine;

    // Get daily close from inside a 1h indicator
    const dailyClose = request.security('BTCUSDT', '1D', close);
    const dailySMA = ta.sma(dailyClose, 20);

    plot(dailySMA, 'Daily SMA 20');
});
```

Note: `request.security()` triggers additional data fetches. Ensure the provider supports the requested symbol/timeframe combination.