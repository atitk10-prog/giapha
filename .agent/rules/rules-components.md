---
trigger: always_on
---

# 🏗️ EDUGENIUS RULES - COMPONENTS
## Component & Layout Architecture

**Version:** 1.3.0 | **Updated:** 2025-12-21

**⬅️ Trước:** [rules-conventions.md](./rules-conventions.md) | **➡️ Tiếp:** [rules-dataflow.md](./rules-dataflow.md)

---

## 🏗️ COMPONENT ARCHITECTURE

### Component Template

```typescript
import React, { memo, useCallback } from 'react';
import { useTranslation } from 'react-i18next';

import { Button } from '@/components/ui';
import type { Student } from '@/types';

// ═══════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════
interface StudentCardProps {
  student: Student;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
  isLoading?: boolean;
}

// ═══════════════════════════════════════════════════
// COMPONENT
// ═══════════════════════════════════════════════════
export const StudentCard: React.FC<StudentCardProps> = memo(({
  student,
  onEdit,
  onDelete,
  isLoading = false,
}) => {
  const { t } = useTranslation();

  // ─────────────────────────────────────────────────
  // Handlers
  // ─────────────────────────────────────────────────
  const handleEdit = useCallback(() => {
    onEdit(student.id);
  }, [onEdit, student.id]);

  const handleDelete = useCallback(() => {
    onDelete(student.id);
  }, [onDelete, student.id]);

  // ─────────────────────────────────────────────────
  // Early returns
  // ─────────────────────────────────────────────────
  if (isLoading) {
    return <StudentCardSkeleton />;
  }

  // ─────────────────────────────────────────────────
  // Render
  // ─────────────────────────────────────────────────
  return (
    <article 
      className="student-card"
      aria-label={t('students.card_label', { name: student.fullName })}
    >
      <header>
        <h3>{student.fullName}</h3>
        <span className="badge">{t(`grades.${student.grade}`)}</span>
      </header>
      
      <div className="content">
        <p>{student.email}</p>
      </div>

      <footer className="actions">
        <Button variant="secondary" onClick={handleEdit}>
          {t('common.edit')}
        </Button>
        <Button variant="danger" onClick={handleDelete}>
          {t('common.delete')}
        </Button>
      </footer>
    </article>
  );
});

StudentCard.displayName = 'StudentCard';
```
# 🎯 100% VIEWPORT FIT PATTERN

## Core Concept

Pattern này đảm bảo tất cả component tự động điền đầy 100% chiều cao và chiều rộng của viewport mà không cần cuộn, với scroll chỉ xuất hiện khi nội dung vượt quá.

---

## 🏗️ LAYOUT STRUCTURE

```tsx
// ═══════════════════════════════════════════════════
// ROOT CONTAINER
// ═══════════════════════════════════════════════════

<div className="h-full flex flex-col">
  
  {/* FIXED HEADER - không co */}
  <div className="flex-shrink-0">
    Header content
  </div>
  
  {/* CONTENT - điền hết không gian còn lại */}
  <div className="flex-1 overflow-hidden">
    
    {/* INNER CONTAINER - cũng dùng flex */}
    <div className="h-full flex flex-col">
      
      {/* FIXED SECTION */}
      <div className="flex-shrink-0">
        Fixed content (filters, tabs, etc.)
      </div>
      
      {/* GROWABLE SECTION - co/giãn theo viewport */}
      <div className="flex-1 min-h-0 overflow-auto">
        Scrollable content
      </div>
      
      {/* FIXED FOOTER */}
      <div className="flex-shrink-0">
        Pagination, actions, etc.
      </div>
      
    </div>
  </div>
  
</div>
```

---

## 📋 KEY CLASSES

| Class | Mục đích | Khi dùng |
|-------|----------|----------|
| `h-full` | Chiếm 100% chiều cao parent | Root container |
| `flex flex-col` | Layout column | Mọi container cần chia sections |
| `flex-shrink-0` | Không co khi thiếu không gian | Header, footer, fixed elements |
| `flex-1` | Điền hết không gian còn lại | Main content, growable areas |
| `min-h-0` | Cho phép co nhỏ hơn content | Kết hợp với flex-1 để overflow hoạt động |
| `overflow-hidden` | Ẩn overflow, chặn scroll | Outer container |
| `overflow-auto` | Scroll khi cần | Inner scrollable areas |
| `overflow-y-auto` | Scroll dọc khi cần | Lists, sidebars |

---

## 🎨 COMPONENT PATTERNS

### Page Layout

```tsx
// Cấu trúc page chuẩn
<div className="h-full flex flex-col bg-gray-50">
  {/* Page Header */}
  <div className="bg-white border-b flex-shrink-0">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3">
      Header content
    </div>
  </div>
  
  {/* Page Content */}
  <div className="flex-1 overflow-hidden px-4 sm:px-6 py-4">
    <div className="h-full max-w-7xl mx-auto flex flex-col gap-4">
      {/* Content here */}
    </div>
  </div>
</div>
```

### Card/Panel

```tsx
// Card điền đầy container
<div className="bg-white rounded-xl border p-4 flex flex-col min-h-0 flex-1">
  {/* Card Header */}
  <div className="flex-shrink-0 mb-3">
    <h3>Title</h3>
  </div>
  
  {/* Card Content - scrollable */}
  <div className="flex-1 min-h-0 overflow-y-auto">
    Content items
  </div>
  
  {/* Card Footer */}
  <div className="flex-shrink-0 mt-3">
    Actions
  </div>
</div>
```

### Grid Layout

```tsx
// Grid điền đầy với flex
<div className="flex-1 grid grid-cols-1 xl:grid-cols-3 gap-4 min-h-0">
  {/* Main content - span 2 columns */}
  <div className="xl:col-span-2 flex flex-col min-h-0 overflow-hidden">
    Main content
  </div>
  
  {/* Sidebar - span 1 column */}
  <div className="xl:col-span-1 flex flex-col gap-3 min-h-0 overflow-y-auto">
    Sidebar panels
  </div>
</div>
```

### Table

```tsx
<div className="bg-white rounded-xl flex flex-col h-full overflow-hidden">
  {/* Table Header */}
  <div className="flex-shrink-0 p-4 border-b">
    Tabs, search, filters
  </div>
  
  {/* Table Body - scrollable */}
  <div className="flex-1 overflow-auto min-h-0">
    <table className="w-full">
      <thead className="sticky top-0 bg-gray-50 z-10">
        ...
      </thead>
      <tbody>
        ...
      </tbody>
    </table>
  </div>
  
  {/* Pagination */}
  <div className="flex-shrink-0 p-4 border-t">
    Pagination controls
  </div>
</div>
```

---

## ⚠️ COMMON MISTAKES

```tsx
// ❌ SAI: Thiếu min-h-0 → overflow không hoạt động
<div className="flex-1 overflow-auto">
  Content
</div>

// ✅ ĐÚNG: Có min-h-0
<div className="flex-1 min-h-0 overflow-auto">
  Content
</div>

// ❌ SAI: Dùng h-full cho child khi parent không có height
<div>
  <div className="h-full">Content</div>
</div>

// ✅ ĐÚNG: Parent phải có height
<div className="h-full flex flex-col">
  <div className="flex-1">Content</div>
</div>

// ❌ SAI: Fixed height thay vì flexible
<div className="min-h-[350px]">
  Content
</div>

// ✅ ĐÚNG: Flexible height
<div className="flex-1 min-h-0">
  Content
</div>
```

---

## 📱 RESPONSIVE CONSIDERATIONS

```tsx
// Mobile: Stack layout, Desktop: Side-by-side
<div className="flex-1 grid grid-cols-1 xl:grid-cols-3 gap-4 min-h-0">
  {/* On mobile: full width, scrolls */}
  {/* On desktop: 2/3 width */}
  <div className="xl:col-span-2 flex flex-col min-h-0">
    Main
  </div>
  
  {/* On mobile: full width */}
  {/* On desktop: 1/3 width, sidebar */}
  <div className="xl:col-span-1 flex flex-col gap-3 min-h-0 overflow-y-auto">
    Sidebar
  </div>
</div>
```

---

## ✅ CHECKLIST

Khi tạo component mới, kiểm tra:

- [ ] Root có `h-full flex flex-col`?
- [ ] Fixed sections có `flex-shrink-0`?
- [ ] Growable sections có `flex-1 min-h-0`?
- [ ] Scrollable areas có `overflow-auto` hoặc `overflow-y-auto`?
- [ ] Outer container có `overflow-hidden`?
- [ ] Nested flex containers đều có `h-full` hoặc `flex-1`?



### Component Metrics & Limits

| Metric | Giới hạn | Action nếu vượt |
|--------|----------|-----------------|
| Lines of code | < 1000 | Split thành sub-components |
| Props count | < 6 | Gộp thành object, dùng context, hoặc composition |
| useState count | < 5 | Extract vào custom hook hoặc useReducer |
| useEffect count | < 3 | Xem xét React Query, event handlers, hoặc derived state |
| Nested ternaries | 0 | Dùng early return, helper function, hoặc object mapping |
| Cyclomatic complexity | < 10 | Split logic, extract functions |
| Import statements | < 15 | Component đang làm quá nhiều việc |
| Callback nesting depth | < 3 | Tránh callback hell, dùng async/await |

### Performance Optimization Rules

| Pattern | Khi nào dùng | Khi nào KHÔNG dùng |
|---------|--------------|-------------------|
| `memo()` | List items (>10), heavy render components | Simple components, components luôn re-render |
| `useCallback()` | Callbacks passed to memoized children, dependency arrays | Inline handlers cho DOM elements |
| `useMemo()` | Expensive calculations (>1ms), referential equality cho objects/arrays | Simple values, primitives |

> ⚠️ **Không optimize premature.** Chỉ optimize khi có performance issue thực tế được đo bằng React DevTools Profiler.

### Custom Hook Template

```typescript
import { useState, useCallback, useMemo } from 'react';
import { useDebounce } from '@/hooks/useDebounce';

interface UseStudentFiltersOptions {
  defaultGrade?: string;
  debounceMs?: number;
}

interface UseStudentFiltersReturn {
  filters: StudentFilters;
  setSearch: (search: string) => void;
  setGrade: (grade: string) => void;
  resetFilters: () => void;
  debouncedFilters: StudentFilters;
}

export function useStudentFilters(
  options: UseStudentFiltersOptions = {}
): UseStudentFiltersReturn {
  const { defaultGrade = '', debounceMs = 300 } = options;

  // State
  const [search, setSearch] = useState('');
  const [grade, setGrade] = useState(defaultGrade);

  // Derived state
  const filters = useMemo(() => ({ search, grade }), [search, grade]);
  const debouncedFilters = useDebounce(filters, debounceMs);

  // Actions
  const resetFilters = useCallback(() => {
    setSearch('');
    setGrade(defaultGrade);
  }, [defaultGrade]);

  return {
    filters,
    setSearch,
    setGrade,
    resetFilters,
    debouncedFilters,
  };
}
```

---


---

**⬅️ Trước:** [rules-conventions.md](./rules-conventions.md) | **➡️ Tiếp:** [rules-dataflow.md](./rules-dataflow.md)