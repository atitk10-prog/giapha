---
trigger: always_on
---

# ⚡ EDUGENIUS RULES - QUALITY
## Performance & Testing Patterns

**Version:** 1.3.0 | **Updated:** 2025-12-21

**⬅️ Trước:** [rules-security-2.md](./rules-security-2.md) | **➡️ Tiếp:** [rules-accessibility.md](./rules-accessibility.md)

---

## ⚡ PERFORMANCE LORE

### Optimization Decision Tree

```
Có performance issue thực tế?
    │
    ├─ KHÔNG → Đừng optimize. Ship it.
    │
    └─ CÓ → Measure với React DevTools Profiler
              │
              ├─ Re-render nhiều? → memo() + useCallback() + useMemo()
              ├─ List > 100 items? → @tanstack/react-virtual
              ├─ Heavy calculation? → useMemo() hoặc Web Worker
              ├─ Bundle lớn? → lazy() + code splitting
              └─ Slow API? → React Query caching + optimistic updates
```

### Performance Patterns

```typescript
// ═══════════════════════════════════════════════════
// MEMO FOR LIST ITEMS
// ═══════════════════════════════════════════════════
export const StudentCard = memo<StudentCardProps>(({ student, onEdit }) => {
  return (
    <div onClick={() => onEdit(student.id)}>
      {student.fullName}
    </div>
  );
});

// ═══════════════════════════════════════════════════
// USECALLBACK FOR HANDLERS
// ═══════════════════════════════════════════════════
function StudentList({ students }: Props) {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  
  // ✅ Stable reference
  const handleEdit = useCallback((id: string) => {
    setSelectedId(id);
  }, []);
  
  return (
    <div>
      {students.map(student => (
        <StudentCard key={student.id} student={student} onEdit={handleEdit} />
      ))}
    </div>
  );
}

// ═══════════════════════════════════════════════════
// USEMEMO FOR EXPENSIVE CALCULATIONS
// ═══════════════════════════════════════════════════
function Dashboard({ students }: Props) {
  const statistics = useMemo(() => ({
    total: students.length,
    activeCount: students.filter(s => s.status === 'active').length,
    averageScore: students.reduce((acc, s) => acc + s.score, 0) / students.length,
  }), [students]);
  
  return <StatisticsPanel stats={statistics} />;
}

// ═══════════════════════════════════════════════════
// VIRTUAL SCROLLING FOR LARGE LISTS
// ═══════════════════════════════════════════════════
import { useVirtualizer } from '@tanstack/react-virtual';

function VirtualStudentList({ students }: { students: Student[] }) {
  const parentRef = useRef<HTMLDivElement>(null);

  const virtualizer = useVirtualizer({
    count: students.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 80,
    overscan: 5,
  });

  return (
    <div ref={parentRef} className="h-[600px] overflow-auto">
      <div style={{ height: `${virtualizer.getTotalSize()}px`, position: 'relative' }}>
        {virtualizer.getVirtualItems().map((virtualRow) => (
          <div
            key={virtualRow.key}
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              transform: `translateY(${virtualRow.start}px)`,
            }}
          >
            <StudentCard student={students[virtualRow.index]} />
          </div>
        ))}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════
// LAZY LOADING
// ═══════════════════════════════════════════════════
const StudentPage = lazy(() => import('./pages/StudentPage'));
const ReportPage = lazy(() => import('./pages/ReportPage'));

function App() {
  return (
    <Suspense fallback={<PageSkeleton />}>
      <Routes>
        <Route path="/students" element={<StudentPage />} />
        <Route path="/reports" element={<ReportPage />} />
      </Routes>
    </Suspense>
  );
}
```

### Performance Targets

| Metric | Target | Tool |
|--------|--------|------|
| First Contentful Paint | < 1.5s | Lighthouse |
| Time to Interactive | < 3s | Lighthouse |
| Main bundle size | < 300KB | `npm run build:analyze` |
| Total bundle size | < 1MB | `npm run build:analyze` |

---

## 🧪 TESTING PATTERNS

### Testing Pyramid

```
                     /\
                    /  \         E2E Tests (Cypress)
                   /    \        10% - Critical paths
                  /──────\       
                 /        \      Integration Tests (Jest + RTL)
                /          \     30% - User flows
               /──────────────\   
              /                \  Unit Tests (Jest)
             /                  \ 60% - Utils, hooks
            /────────────────────\
```

### Coverage Targets

| Loại | Target | Focus |
|------|--------|-------|
| Utils/Helpers | 90%+ | Pure functions |
| Custom Hooks | 80%+ | State logic |
| Services | 80%+ | API calls |
| Components | 60%+ | Interactions |
| Critical Paths | 100% | Auth, mutations |

### Unit Test Template

```typescript
// utils/validation.test.ts
import { validateEmail, validateStudentData } from './validation';

describe('validateEmail', () => {
  it.each([
    'test@example.com',
    'user.name@domain.co',
  ])('should accept "%s"', (email) => {
    expect(validateEmail(email)).toBe(true);
  });

  it.each([
    ['', 'empty string'],
    ['invalid', 'no @ symbol'],
    ['@domain.com', 'no local part'],
  ])('should reject "%s" (%s)', (email) => {
    expect(validateEmail(email)).toBe(false);
  });
});
```

### Component Test Template

```typescript
// StudentCard.test.tsx
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { StudentCard } from './StudentCard';

describe('StudentCard', () => {
  const mockStudent = {
    id: '1',
    fullName: 'Nguyễn Văn A',
    email: 'a@test.com',
  };

  const mockOnEdit = jest.fn();

  beforeEach(() => jest.clearAllMocks());

  it('renders student information', () => {
    render(<StudentCard student={mockStudent} onEdit={mockOnEdit} />);
    expect(screen.getByText('Nguyễn Văn A')).toBeInTheDocument();
  });

  it('calls onEdit when clicked', async () => {
    const user = userEvent.setup();
    render(<StudentCard student={mockStudent} onEdit={mockOnEdit} />);
    
    await user.click(screen.getByRole('button', { name: /edit/i }));
    expect(mockOnEdit).toHaveBeenCalledWith('1');
  });
});
```

### Hook Test Template

```typescript
// useStudentFilters.test.ts
import { renderHook, act } from '@testing-library/react';
import { useStudentFilters } from './useStudentFilters';

describe('useStudentFilters', () => {
  it('initializes with default values', () => {
    const { result } = renderHook(() => useStudentFilters());
    expect(result.current.filters).toEqual({ search: '', grade: '' });
  });

  it('updates search filter', () => {
    const { result } = renderHook(() => useStudentFilters());
    
    act(() => result.current.setSearch('Nguyễn'));
    
    expect(result.current.filters.search).toBe('Nguyễn');
  });

  it('resets filters', () => {
    const { result } = renderHook(() => useStudentFilters());
    
    act(() => {
      result.current.setSearch('test');
      result.current.resetFilters();
    });
    
    expect(result.current.filters.search).toBe('');
  });
});
```

---


---

**⬅️ Trước:** [rules-security-2.md](.agent/rules/rules-security-2.md) | **➡️ Tiếp:** [rules-accessibility.md](.agent/rules/rules-accessibility.md)