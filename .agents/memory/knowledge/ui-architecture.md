# UI & Frontend Architecture Knowledge

## Performance & Rendering
- **`useSyncExternalStore` Optimization**: `getSnapshot` must return primitive types (like strings or numbers) or stable references. Returning dynamic objects causes `Object.is` to fail, triggering global re-renders across all subscribed components. Derive state inside `getSnapshot`.
- **CSS-JS Animation Sync**: Changing CSS classes (e.g., `.flash-up`) without updating JS logic (`flash-green`) leads to silent animation failures. Always `grep` the project when refactoring CSS classes. Ensure JS animation cleanup timeouts are >= CSS animation duration.

## Data Parsing & Validation
- **Array Parsing Crash**: APIs might return JSON objects instead of arrays during HTTP errors. Always use `Array.isArray(data)` before mapping (`.map()`) to prevent `TypeError` and complete UI crashes.
- **Float Parsing**: `parseFloat(undefined)` returns `NaN`. Since `typeof NaN` is a Number, fallback operators like `?? 0` will fail. Explicitly check `!= null` or `isNaN` before rendering.
- **Date Parsing Crash**: Passing `undefined` to `new Date()` yields `NaN`. Calling `toLocaleDateString` on it crashes the V8 Engine (`RangeError`). Wrap in try-catch and validate `!isNaN(d.getTime())`.

## State & Exception Handling
- **Ghost States**: Fallback configurations should act as UI skeletons. Do not rely entirely on fetched data to render base layouts, to avoid UI elements jumping or disappearing when data is empty.
- **Exception Swallowing (Anti-Pattern)**: Avoid empty `catch (e) {}` blocks. Always use `console.warn` or Error Boundaries with distinct context IDs (e.g., `[UserInfoModal] Error parse fav key`) for debuggability. Provide fallback values when `localStorage` parse fails.
