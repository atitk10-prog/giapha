# Writing TA Functions in PineTS

## Table of Contents
- [File location](#file-location)
- [Full template](#full-template)
- [State management patterns](#state-management-patterns)
- [Handling NaN](#handling-nan)
- [Tuple-returning functions](#tuple-returning-functions)
- [Test pattern](#test-pattern)
- [Common TA implementations](#common-ta-implementations)

---

## File Location

```
src/namespaces/ta/methods/yourfunction.ts
tests/compatibility/namespace/ta/methods/indicators/yourfunction.pine.ts
```

After creating the file, always run:
```bash
npm run generate:ta-index
```

---

## Full Template

```typescript
import { Series } from '../../../Series';

export function yourfunction(context: any) {
    return (source: any, period: any, _callId?: string) => {
        // 1. Unique state key — always use _callId
        const stateKey = _callId || `yourfunc_${period}`;

        // 2. Initialize state on first call
        if (!context.taState[stateKey]) {
            context.taState[stateKey] = {
                window: [] as number[],
                sum: 0,
                count: 0,
            };
        }
        const state = context.taState[stateKey];

        // 3. Get current value using Series
        const current = Series.from(source).get(0);

        // 4. Handle NaN input — never let NaN corrupt state
        if (isNaN(current)) return NaN;

        // 5. Incremental update (O(1) per bar)
        state.window.push(current);
        state.sum += current;
        if (state.window.length > period) {
            state.sum -= state.window.shift()!;
        }

        // 6. Return NaN during initialization
        if (state.window.length < period) return NaN;

        // 7. Always wrap output in context.precision()
        return context.precision(state.sum / period);
    };
}
```

---

## State Management Patterns

### Rolling Window (SMA-style)
```typescript
context.taState[stateKey] = { window: [], sum: 0 };

state.window.push(current);
state.sum += current;
if (state.window.length > period) {
    state.sum -= state.window.shift()!;
}
```

### EMA-style (single value state)
```typescript
context.taState[stateKey] = { ema: NaN, initialized: false };

const k = 2 / (period + 1);
if (!state.initialized) {
    state.ema = current;
    state.initialized = true;
} else {
    state.ema = current * k + state.ema * (1 - k);
}
return context.precision(state.ema);
```

### Two-pass state (RSI-style: requires tracking gains/losses)
```typescript
context.taState[stateKey] = {
    prevValue: NaN,
    avgGain: NaN,
    avgLoss: NaN,
    count: 0,
    tempGains: [] as number[],
    tempLosses: [] as number[],
};

// Phase 1: accumulate initial period
// Phase 2: apply Wilder smoothing
```

---

## Handling NaN

```typescript
// Check before ANY state update
if (isNaN(current)) return NaN;

// Also check previous values when needed
const prev = Series.from(source).get(1);
if (isNaN(prev)) return NaN;

// Safe addition (NaN-safe)
const safeAdd = (a: number, b: number) => isNaN(a) ? b : isNaN(b) ? a : a + b;
```

---

## Tuple-Returning Functions

Functions that return multiple values (like MACD, Bollinger Bands) MUST use double brackets:

```typescript
// ✅ CORRECT
return [[macd, signal, histogram]];

// ❌ WRONG — will break tuple destructuring
return [macd, signal, histogram];
```

Usage in PineTS code:
```typescript
const [macd, signal, hist] = ta.macd(close, 12, 26, 9);
```

---

## Test Pattern

```typescript
import { describe, it, expect } from 'vitest';
import { PineTS } from '../../../src/PineTS.class';
import { Provider } from '@pinets/marketData/Provider.class';

describe('ta.yourfunction', () => {
    const makePineTS = () => new PineTS(
        Provider.Mock,
        'BTCUSDC',
        '60',
        null,
        new Date('2024-01-01').getTime(),
        new Date('2024-01-10').getTime()
    );

    it('calculates correctly', async () => {
        const pineTS = makePineTS();
        const { plots } = await pineTS.run(($) => {
            const { close } = $.data;
            const { ta, plotchar } = $.pine;
            const result = ta.yourfunction(close, 14);
            plotchar(result, 'result');
        });

        expect(plots['result']).toBeDefined();
        expect(plots['result'].data.length).toBeGreaterThan(0);

        const last = plots['result'].data.at(-1)!.value;
        expect(last).toBeCloseTo(EXPECTED_VALUE, 8);
    });

    it('returns NaN for insufficient data', async () => {
        const pineTS = makePineTS();
        const { plots } = await pineTS.run(($) => {
            const { close } = $.data;
            const { ta, plotchar } = $.pine;
            const result = ta.yourfunction(close, 500); // period > data length
            plotchar(result, 'result');
        });
        const values = plots['result'].data.map((d: any) => d.value);
        expect(values.every(isNaN)).toBe(true);
    });

    it('maintains independent state for multiple calls', async () => {
        const pineTS = makePineTS();
        const { plots } = await pineTS.run(($) => {
            const { close } = $.data;
            const { ta, plotchar } = $.pine;
            const r1 = ta.yourfunction(close, 10);
            const r2 = ta.yourfunction(close, 20);
            plotchar(r1, 'r1');
            plotchar(r2, 'r2');
        });
        // r1 and r2 should be different
        const last1 = plots['r1'].data.at(-1)!.value;
        const last2 = plots['r2'].data.at(-1)!.value;
        expect(last1).not.toBeCloseTo(last2, 2);
    });
});
```

---

## Common TA Implementations Reference

| Function | Key state | Notes |
|---|---|---|
| `ta.sma` | `{ window[], sum }` | Rolling window |
| `ta.ema` | `{ ema, initialized }` | Wilder smoothing k=2/(n+1) |
| `ta.rsi` | `{ avgGain, avgLoss, prev, count }` | Two-phase init |
| `ta.atr` | `{ atr, prevClose }` | Wilder smoothing on TR |
| `ta.macd` | Combination of 3 EMAs | Returns `[[macd, signal, hist]]` |
| `ta.bbands` | `{ window[], sum, sumSq }` | Mean ± k*stddev |
| `ta.stoch` | `{ highWindow[], lowWindow[] }` | Rolling high/low windows |