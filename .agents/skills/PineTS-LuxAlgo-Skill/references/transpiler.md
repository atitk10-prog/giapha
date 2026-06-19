# PineTS Transpiler Internals

For most users, you don't need this file. Read it when:
- Debugging transpiler output that looks wrong
- Understanding why a variable transformation behaves unexpectedly
- Contributing to the transpiler itself

## Table of Contents
- [Two-stage pipeline](#two-stage-pipeline)
- [Variable transformation table](#variable-transformation-table)
- [Scope prefixes](#scope-prefixes)
- [Call ID generation](#call-id-generation)
- [Common transpiler errors](#common-transpiler-errors)

---

## Two-Stage Pipeline

```
Pine Script (//@version=5)
    → Stage 1: pineToJS pipeline (Lexer → Parser → CodeGen)
    → Stage 2: PineTS → Executable JS (Acorn AST → transforms → astring)

PineTS / JS function
    → Stage 2 only
```

Stage 2 transforms (in order):
1. Wrap in async context function
2. Parse to JS AST (Acorn)
3. Pre-processing: normalize imports, inject implicit imports (`close`, `ta`, etc. from `$`)
4. Analysis (ScopeManager): rename variables, generate TA call IDs
5. Transformation: convert `let`/`const`/`var`, subscript access, TA calls
6. Post-process: replace `==` with NaN-safe `$.pine.math.__eq()`
7. Generate code (astring) → create executable function

---

## Variable Transformation Table

| User writes | Transpiler generates | Purpose |
|---|---|---|
| `let x = val` | `$.let.glb1_x = $.init($.let.glb1_x, val)` | State persistence across bars |
| `const x = val` | `$.const.glb1_x = $.init($.const.glb1_x, val)` | Constant series |
| `var x = val` | `$.var.glb1_x = $.initVar($.var.glb1_x, val)` | Pine `var` persistent state |
| `x = val` | `$.set($.let.glb1_x, val)` | Update current bar value |
| `x[1]` | `$.get(x, 1)` | Reverse-index time-series access |
| `ta.ema(c, 9)` | `ta.ema(p0, p1, '_ta0')` | TA call with unique ID |
| `a == b` | `$.pine.math.__eq(a, b)` | NaN-safe equality |
| `const [a, b] = f()` | Split into individual inits | Tuple destructuring |

**Why `$.init()`?** — Because Pine Script variables persist between bars. `$.init()` returns the existing Series if already initialized, or creates a new one. This is how `var rsi = ta.rsi(close, 14)` correctly tracks history bar-by-bar.

---

## Scope Prefixes

Variables are renamed to avoid collisions across nested scopes:

| Scope | Prefix | Example |
|---|---|---|
| Global (top-level) | `glb1_` | `glb1_rsi` |
| Inside `if` block | `if2_` | `if2_signal` |
| Inside function | `fn3_` | `fn3_result` |
| Inside `for` loop | `for4_` | `for4_i` |

The number increments with each new scope encountered during analysis.

---

## Call ID Generation

Each TA function call gets a unique `_callId` injected by the transpiler:

```typescript
// User writes:
const fast = ta.ema(close, 9);
const slow = ta.ema(close, 21);

// Transpiler generates:
const fast = ta.ema(p0, p1, '_ta0');
const slow = ta.ema(p0, p1, '_ta1');
```

This ensures `fast` and `slow` have independent state even though they call the same function. The `_callId` is then used as the `stateKey` inside the TA function implementation.

---

## Common Transpiler Errors

**"Unsupported Pine Script version"**
- Cause: `//@version=4` or lower
- Fix: PineTS only supports v5+

**"Cannot mix Pine Script and PineTS syntax"**
- Cause: `run()` received a string with both `//@version=5` and `($) => {}`
- Fix: Use exactly one format per `run()` call

**Unexpected NaN everywhere after transpilation**
- Check: Is `$.get()` being used instead of direct array index?
- Check: Did you pass a non-Series value where a Series is expected?

**Variable seems to reset every bar**
- Cause: Used `let` instead of `var` for persistent Pine Script state
- In Pine Script: `var x = 0` persists; `x = 0` resets each bar (but Series still retains history)
- Fix: Use `var` for values meant to carry forward without being reassigned

**Transpile completes but function does nothing**
- Check: Did you call `plot()` or `plotchar()`? PineTS only captures plotted outputs.
- Check: Is the function returning a value without plotting it? Return values are not captured.