---
trigger: always_on
---

# 🧬 EDUGENIUS CODE RULES - GEMINI
## Lore-Anchored Development Standards

**Version:** 1.3.0  
**Last Updated:** 2025-12-21  
**Companion Files:** [workflows-git.md](./workflows-git.md) | [workflows-quality.md](./workflows-quality.md)

---

## 📚 FILE NAVIGATION

| # | File | Nội dung |
|---|------|----------|
| 1 | 📘 **GEMINI.md** (this) | Core, Quick Reference, 4 Pillars |
| 2 | 📛 [rules-conventions.md](./rules-conventions.md) | Naming & Import Order |
| 3 | 🏗️ [rules-components.md](./rules-components.md) | Component & Layout |
| 4 | 📊 [rules-dataflow.md](./rules-dataflow.md) | Data Flow Diagrams |
| 5 | 🔒 [rules-security-1.md](./rules-security-1.md) | Security Layers 1-6 |
| 6 | 🔐 [rules-security-2.md](./rules-security-2.md) | Security Layers 7-12 |
| 7 | ⚡ [rules-quality.md](./rules-quality.md) | Performance & Testing |
| 8 | ♿ [rules-accessibility.md](./rules-accessibility.md) | A11y, Icons, Anti-patterns |

---

## 🎯 LORE CỐT LÕI (Identity Anchor)

### Bản Thể Codebase

```
EduGenius không phải app giáo dục thông thường.
EduGenius là hệ thống có TÍNH CÁCH:
├─ Chính xác như toán học
├─ Nhất quán như triết học
├─ Linh hoạt như sư phạm
└─ An toàn như y khoa
```

### Mantra Ràng Buộc

> **"Code không cần tự do. Code cần kỷ luật."**

Mỗi dòng code phải trả lời được:
1. **WHY** – Tại sao cần dòng này?
2. **WHAT** – Nó làm gì chính xác?
3. **SAFE** – Có edge case nào bị bỏ sót?

### Ngôn Ngữ Giao Tiếp

> **"Tiếng Việt là ngôn ngữ chính thức."**

| Context | Language | Example |
|---------|----------|---------|
| Code (variables, functions) | English | `fetchStudents()` |
| Code comments | English | `// Validate input` |
| Commit messages | English type + Việt | `fix(modal): Sửa lỗi stale data` |
| PR/Review/Reports | Tiếng Việt | Mô tả, thảo luận |
| Documentation | Tiếng Việt | README, guides |

### Tam Giác Vàng

```
                    🎯 QUALITY
                       /\
                      /  \
                     /    \
                    /      \
                   /________\
           ⚡ SPEED      🛡️ SAFETY
           
    Khi conflict: SAFETY > QUALITY > SPEED
```

---

## 🚀 QUICK REFERENCE CARD

### Essential Commands

| Action | Command | Khi nào chạy |
|--------|---------|--------------|
| Dev server | `npm run dev` | Bắt đầu code |
| Type check | `npx tsc --noEmit --strict` | **TRƯỚC MỖI COMMIT** |
| Lint | `npm run lint` | Trước commit |
| Format | `npm run format:check` | Trước commit |
| Test | `npm test` | Trước commit |
| Test coverage | `npm run test:coverage` | Review weekly |
| Build | `npm run build` | Trước deploy |
| Bundle analyze | `npm run build:analyze` | Khi nghi bundle lớn |

### File Structure

```
components/
├── features/[feature]/
│   ├── [Feature]Page.tsx        # Container + routing
│   ├── [Feature]List.tsx        # List với virtualization
│   ├── [Feature]Card.tsx        # Item component (memo)
│   ├── [Feature]Filters.tsx     # Filter controls
│   ├── Create[Feature]Modal.tsx # Create/Edit modal
│   ├── use[Feature].ts          # Data fetching hook
│   ├── use[Feature]Filters.ts   # Filter state hook
│   ├── [feature].utils.ts       # Helper functions
│   ├── [feature].types.ts       # Local types
│   └── [Feature].test.tsx       # Unit tests
└── shared/
    ├── ui/                      # Button, Input, Modal...
    ├── layouts/                 # PageLayout, Sidebar...
    └── hooks/                   # Shared custom hooks
services/                        # API layer
stores/                          # Zustand stores  
utils/                           # Global utilities
types/                           # Global types
locales/                         # i18n files
├── vi.json
└── en.json
```

### Common Patterns

```typescript
// ═══════════════════════════════════════════════════
// DATA FETCHING
// ═══════════════════════════════════════════════════

// Single item
const { data, isLoading, error } = useQuery({
  queryKey: ['student', id],
  queryFn: () => fetchStudent(id),
  enabled: !!id,
});

// List với filters
const { data, isLoading } = useQuery({
  queryKey: ['students', filters],
  queryFn: () => fetchStudents(filters),
  staleTime: 5 * 60 * 1000,
});

// Infinite scroll
const { data, fetchNextPage, hasNextPage } = useInfiniteQuery({
  queryKey: ['students', filters],
  queryFn: ({ pageParam = 0 }) => fetchStudents({ ...filters, offset: pageParam }),
  getNextPageParam: (lastPage, pages) => 
    lastPage.length < PAGE_SIZE ? undefined : pages.length * PAGE_SIZE,
});

// ═══════════════════════════════════════════════════
// MUTATIONS
// ═══════════════════════════════════════════════════

const { mutate, isPending } = useMutation({
  mutationFn: updateStudent,
  onSuccess: () => {
    queryClient.invalidateQueries({ queryKey: ['students'] });
    addToast({ message: t('success.updated'), type: 'success' });
  },
  onError: (error) => {
    addToast({ message: t('errors.update_failed'), type: 'error' });
  },
});

// ═══════════════════════════════════════════════════
// I18N
// ═══════════════════════════════════════════════════

const { t } = useTranslation();
t('common.save')                      // Simple
t('students.count', { count: 10 })    // With params
t(`grades.${student.grade}`)          // Dynamic (verify namespace!)

// ═══════════════════════════════════════════════════
// TOAST
// ═══════════════════════════════════════════════════

addToast({ message: t('success.saved'), type: 'success' });
addToast({ message: t('errors.failed'), type: 'error' });

// ═══════════════════════════════════════════════════
// ERROR HANDLING
// ═══════════════════════════════════════════════════

try {
  await riskyOperation();
} catch (error) {
  const message = error instanceof Error ? error.message : 'Unknown error';
  console.error('[Context]', { error, timestamp: new Date().toISOString() });
  addToast({ message: t('errors.operation_failed'), type: 'error' });
}
```

---

## ⚡ 4 TRỤ CỘT (World Rules)

### 1️⃣ TYPE SAFETY FIRST

```typescript
// ❌ KHÔNG BAO GIỜ
const data: any = response;
const items = data?.stuff?.things;

// ✅ LUÔN LUÔN
interface ApiResponse {
  items: Item[];
  pagination: Pagination;
}

const { items, pagination } = response as ApiResponse;
```

**Quy tắc:**
- Zero `any` types (trừ khi có lý do documented)
- Explicit return types cho public functions
- Strict null checks enabled
- `npx tsc --noEmit --strict` = 0 errors

### 2️⃣ STATE SEPARATION

```
┌─────────────────────────────────────────────────────────────┐
│  SERVER STATE (React Query)    │  CLIENT STATE (Zustand)   │
├─────────────────────────────────────────────────────────────┤
│  • API data                    │  • UI state               │
│  • Database records            │  • Theme/preferences      │
│  • User profiles               │  • Sidebar open/close     │
│  • Lists, pagination           │  • Modal visibility       │
│  • Search results              │  • Form drafts            │
└─────────────────────────────────────────────────────────────┘
```

```typescript
// ❌ Anti-pattern: useState + useEffect cho API
const [data, setData] = useState([]);
useEffect(() => {
  fetchData().then(setData);
}, []);

// ✅ Pattern chuẩn: React Query
const { data, isLoading, error } = useQuery({
  queryKey: ['students', filters],
  queryFn: () => fetchStudents(filters),
  staleTime: 5 * 60 * 1000,
});
```

### 3️⃣ ERROR AS FIRST-CLASS CITIZEN

```typescript
// Template chuẩn cho error handling
async function safeOperation<T>(
  operation: () => Promise<T>,
  context: string
): Promise<{ data?: T; error?: string }> {
  try {
    const data = await operation();
    return { data };
  } catch (error) {
    const message = error instanceof Error 
      ? error.message 
      : 'Unknown error';
    
    console.error(`[${context}]`, {
      error,
      timestamp: new Date().toISOString(),
    });
    
    return { error: message };
  }
}

// Usage
const { data, error } = await safeOperation(
  () => updateStudent(id, payload),
  'StudentUpdate'
);

if (error) {
  addToast({ message: t('errors.update_failed'), type: 'error' });
  return;
}
```

### 4️⃣ I18N PURITY

```typescript
// ❌ 3 TỘI LỚN
t('key', 'Fallback text')           // Fallback = lazy
t(`subjects.${subject}`)            // Namespace chưa verify
t('new_key')                        // Key chưa có trong json

// ✅ QUY TRÌNH CHUẨN
// Step 1: Thêm vào locales/vi.json
// Step 2: Thêm vào locales/en.json  
// Step 3: Dùng t('namespace.key')
```

**Namespaces hợp lệ:**

| Namespace | Mô tả | Ví dụ |
|-----------|-------|-------|
| `common.*` | Từ ngữ chung | `common.save`, `common.cancel` |
| `errors.*` | Thông báo lỗi | `errors.network_error` |
| `success.*` | Thông báo thành công | `success.saved` |
| `tests.*` | Module kiểm tra | `tests.question_type` |
| `students.*` | Module học sinh | `students.add_new` |
| `grades.*` | Khối lớp | `grades.grade_1` → `grades.grade_12` |
| `specializations.*` | Chuyên ngành | `specializations.spec_2math` |
| `modals.*` | Dialog/Modal | `modals.confirm_delete` |
| `validation.*` | Validation messages | `validation.required` |

---

**➡️ Tiếp theo:** [rules-conventions.md](.agent/rules/rules-conventions.md) - Naming & Import Order