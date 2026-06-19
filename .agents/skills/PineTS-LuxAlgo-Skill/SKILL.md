---
name: pinets
description: Expert guide for working with PineTS — the open-source transpiler and runtime that runs Pine Script® indicators in Node.js and the browser. Use this skill whenever the user mentions PineTS, Pine Script, TradingView indicators in JavaScript/TypeScript, porting indicators to Node.js, writing TA functions (ta.ema, ta.rsi, ta.sma, etc.), converting Pine Script to JavaScript, debugging time-series calculations, or integrating trading indicators into their own infrastructure. Also trigger when the user asks about Series, context object ($), incremental TA calculation, or the PineTS transpiler pipeline.
---

# PineTS Skill

PineTS is a transpiler + runtime that runs Pine Script® v5+ indicators in Node.js and the browser. Two input formats exist — always identify which one the user is working with before proceeding.

## Input Format Detection (Critical)

| Format | Marker | Path |
|---|---|---|
| Native Pine Script | `//@version=5` (or higher) | → pineToJS pipeline → PineTS runtime |
| PineTS syntax | No version marker, uses `($) => {}` | → PineTS runtime directly |
| JS function | Arrow/named function passed to `.run()` | → Converted to string → PineTS runtime |

**Never mix the two.** A single `pineTS.run()` call takes ONE format.

## Quick Reference: Syntax Comparison

```pine
// Pine Script (native)
//@version=5
indicator("EMA Cross")
fast = ta.ema(close, 9)
slow = ta.ema(close, 21)
plot(fast, "Fast EMA")
```

```typescript
// PineTS equivalent
pineTS.run(($) => {
    const { close } = $.data;
    const { ta, plot } = $.pine;
    const fast = ta.ema(close, 9);
    const slow = ta.ema(close, 21);
    plot(fast, 'Fast EMA');
    plot(slow, 'Slow EMA');
});
```

## Project Setup (Node.js)

```bash
npm install @luxalgo/pinets
```

```typescript
import { PineTS } from '@luxalgo/pinets';
import { Provider } from '@luxalgo/pinets/marketData/Provider.class';

// With Binance live data
const pineTS = new PineTS(
    Provider.Binance,
    'BTCUSDT',      // symbol
    '60',           // timeframe in minutes (or '1D', '1W')
    null,
    new Date('2024-01-01').getTime(),
    new Date('2024-01-10').getTime()
);

const { plots } = await pineTS.run(($) => {
    const { close } = $.data;
    const { ta, plot } = $.pine;
    const rsi = ta.rsi(close, 14);
    plot(rsi, 'RSI');
});

console.log(plots['RSI'].data); // [{ time: 1704067200000, value: 58.23 }, ...]
```

## Time-Series: The Most Important Concept

PineTS stores data **forward** (oldest → newest) but provides **reverse access** (0 = current, 1 = previous):

```typescript
// NEVER do this
const current = close[close.length - 1]; // ❌ Raw array access

// Always do this
const current = $.get(close, 0);   // ✅ Current bar
const previous = $.get(close, 1);  // ✅ Previous bar

// Or in TA functions:
const current = Series.from(source).get(0);
```

## Writing a New TA Function

See **references/ta-functions.md** for the complete guide. Key rules:

1. **Factory pattern** — outer function takes `context`, returns the actual function
2. **`_callId` parameter** — required for state isolation between multiple calls
3. **Incremental calculation** — O(1) per bar, not O(n) recalculation
4. **Return `NaN`** during initialization (insufficient data)
5. **`context.precision()`** — wrap all numeric outputs
6. **Double brackets for tuples** — `return [[val1, val2]]` not `return [val1, val2]`

```typescript
// Minimal correct TA function template
export function myIndicator(context: any) {
    return (source: any, period: any, _callId?: string) => {
        const stateKey = _callId || `myInd_${period}`;
        if (!context.taState[stateKey]) {
            context.taState[stateKey] = { /* initial state */ };
        }
        const state = context.taState[stateKey];
        const current = Series.from(source).get(0);

        if (isNaN(current)) return NaN;

        // ... incremental update logic ...

        return context.precision(result);
    };
}
```

After adding: run `npm run generate:ta-index` to regenerate the barrel file.

## Debugging

```typescript
// 1. View transpiled code
import { transpile } from '@luxalgo/pinets/transpiler';
const fn = transpile(myCode, { debug: true }); // prints transpiled JS to console

// 2. Inspect context state
console.log('Variables:', context.let);
console.log('TA state:', context.taState);
console.log('Bar index:', context.idx);
```

**Common errors and fixes:**

| Error symptom | Cause | Fix |
|---|---|---|
| All values are NaN | Insufficient warmup bars | Add `--warmup N` or increase date range |
| State shared between calls | Missing `_callId` | Add `_callId?: string` parameter |
| Wrong historical values | Direct array access | Use `$.get(source, n)` |
| Tuple unpacking fails | Single brackets | Use `return [[v1, v2]]` |
| Transpile error: mixed syntax | `//@version=5` + `($) =>` together | Use one format only |

## Running Tests

PineTS uses **Vitest** (not Jest):

```bash
npm test -- --run                    # Run all tests once
npm test -- ta-sma.test.ts --run     # Run specific file
npm run test:coverage                # With coverage
```

## Reference Files

- **references/ta-functions.md** — Full guide: writing, testing, state management for TA functions
- **references/integration.md** — Node.js/browser integration patterns, data providers, streaming
- **references/transpiler.md** — Transpiler pipeline internals, variable transformation table, scope rules
- **Link source:** — https://github.com/LuxAlgo/PineTS