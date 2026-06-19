---
description: ## Definition of Done & Debugging Guide
---

# ✅ EDUGENIUS WORKFLOWS - QUALITY
## Definition of Done & Debugging Guide

**Version:** 1.1.0 | **Updated:** 2025-12-16

### 📚 Related: [WORKFLOWS-GIT](./WORKFLOWS-GIT.md) | [RULES-QUALITY](./RULES-QUALITY.md)

---

## ✅ DEFINITION OF DONE

### Gate 1: CODE QUALITY
```
- [ ] npx tsc --noEmit --strict = 0 errors
- [ ] No `any` types
- [ ] No console.log
- [ ] Naming follows conventions
- [ ] Import order correct
```

### Gate 2: FUNCTIONALITY
```
- [ ] Works as specified
- [ ] Edge cases: empty, null, error
- [ ] Error handling (try/catch)
- [ ] Loading states
- [ ] Success/error toast
```

### Gate 3: I18N
```
- [ ] Keys in vi.json
- [ ] Keys in en.json
- [ ] No hardcoded strings
- [ ] No fallback values in t()
```

### Gate 4: ACCESSIBILITY
```
- [ ] Semantic HTML
- [ ] Keyboard navigation
- [ ] aria-labels
- [ ] Color contrast OK
```

### Gate 5: PERFORMANCE
```
- [ ] No unnecessary re-renders
- [ ] memo/useCallback where needed
- [ ] Large lists virtualized
```

### Gate 6: TESTING
```
- [ ] npm test passes
- [ ] New tests for new code
- [ ] Manual testing done
```

### Gate 7: COMMIT
```
- [ ] Descriptive message
- [ ] Type and scope correct
- [ ] Pushed to remote
```

### Quick Checklist (Copy-Paste)

```markdown
## DoD Checklist
- [ ] tsc: 0 errors
- [ ] No any/console.log
- [ ] Edge cases handled
- [ ] Loading + error states
- [ ] i18n: vi.json + en.json
- [ ] A11y: semantic + keyboard
- [ ] Tests pass
- [ ] Good commit message
```

---

## 🔧 DEBUGGING GUIDE

### 1. "Cannot read property of undefined"

```typescript
// ❌ SAI
const name = student.fullName;

// ✅ ĐÚNG
const name = student?.fullName;
// hoặc
if (!student) return <Skeleton />;
const name = student.fullName;
```

### 2. Infinite Re-renders

```typescript
// ❌ Object in dependency
useEffect(() => { fetchData(filters); }, [filters]);

// ✅ Individual properties
useEffect(() => { fetchData({ search, grade }); }, [search, grade]);

// ❌ Missing useCallback
const handleClick = () => {};
<MemoChild onClick={handleClick} />

// ✅ With useCallback
const handleClick = useCallback(() => {}, []);
```

### 3. i18n Key Not Found

```typescript
// Check: Key exists in vi.json AND en.json?
// Check: Correct namespace?

// ❌ Wrong namespace
t('subjects.math')

// ✅ Correct namespace
t('specializations.spec_2math')

// Debug
console.log('key:', `grades.${grade}`);
```

### 4. React Query Not Refetching

```typescript
// ❌ Static queryKey
queryKey: ['students']

// ✅ Include dependencies
queryKey: ['students', filters]

// ❌ Missing invalidate
onSuccess: () => { toast.success(); }

// ✅ Invalidate after mutation
onSuccess: () => {
  queryClient.invalidateQueries({ queryKey: ['students'] });
}
```

### 5. State Not Updating

```typescript
// ❌ Stale closure
setCount(count + 1);
setCount(count + 1); // Still uses old count

// ✅ Functional update
setCount(c => c + 1);
setCount(c => c + 1);

// ❌ Mutating array
items.push(newItem);
setItems(items);

// ✅ New reference
setItems([...items, newItem]);
```

### 6. Modal Not Closing

```typescript
// ❌ Event propagation
<div onClick={onClose}>
  <div className="modal">
    <button onClick={onSave}>Save</button>
  </div>
</div>

// ✅ Stop propagation
<div onClick={onClose}>
  <div onClick={e => e.stopPropagation()}>
    <button onClick={onSave}>Save</button>
  </div>
</div>
```

### 7. Supabase Returns Empty

```typescript
// Check: RLS policy allows SELECT?
// Check: Column name (snake_case)?

// ❌ Wrong column name
.eq('teacherId', id)

// ✅ Correct (database uses snake_case)
.eq('teacher_id', id)
```

### 8. TypeScript Errors After Refactor

```bash
# Full error list
npx tsc --noEmit --strict 2>&1 | head -100

# Watch mode
npx tsc --noEmit --strict --watch

# Search & replace for renamed properties
# student.name → student.fullName
```

---

## 🛠️ DEBUG TOOLS

```bash
# TypeScript
npx tsc --noEmit --strict

# React DevTools
# - Components tab: props, state
# - Profiler: render performance

# React Query Devtools
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
<ReactQueryDevtools initialIsOpen={false} />

# Console helpers
console.table(arrayData);
console.group('Name'); console.log(...); console.groupEnd();
console.time('op'); /* code */ console.timeEnd('op');
```

---

## 📜 CHANGELOG

### v1.1.0 (2025-12-16)
- Split into multiple files < 12K chars
- Added .eslintrc.js and ci.yml
- Enhanced security section (12 layers)
- Added debugging scenarios

### v1.0.0 (2025-12-16)
- Initial release
- Core LORE framework
- All rules and workflows