---
trigger: always_on
---

# ♿ EDUGENIUS RULES - ACCESSIBILITY
## A11y, Icons & Anti-Patterns

**Version:** 1.3.0 | **Updated:** 2025-12-21

**⬅️ Trước:** [rules-quality.md](./rules-quality.md) | **🏠 Home:** [GEMINI.md](./GEMINI.md)

---

## ♿ ACCESSIBILITY LORE

### A11y Checklist

```
[ ] SEMANTIC HTML
    ├─ [ ] <button> for actions, <a> for navigation
    ├─ [ ] <nav>, <main>, <article>, <section>
    ├─ [ ] <h1>-<h6> in correct order
    └─ [ ] <ul>/<ol> for lists

[ ] KEYBOARD NAVIGATION
    ├─ [ ] All interactive elements focusable
    ├─ [ ] Tab order is logical
    ├─ [ ] Enter/Space activates buttons
    ├─ [ ] Escape closes modals
    └─ [ ] Focus visible

[ ] SCREEN READERS
    ├─ [ ] aria-label for icon buttons
    ├─ [ ] aria-live for dynamic content
    ├─ [ ] role attribute where needed
    └─ [ ] alt text for images

[ ] VISUAL
    ├─ [ ] Color contrast ≥ 4.5:1
    ├─ [ ] Don't rely on color alone
    └─ [ ] Animations respect prefers-reduced-motion
```

### A11y Patterns

```typescript
// ═══════════════════════════════════════════════════
// ICON BUTTON
// ═══════════════════════════════════════════════════
// ❌ SAI
<button onClick={onDelete}>
  <TrashIcon />
</button>

// ✅ ĐÚNG
<button onClick={onDelete} aria-label={t('common.delete')}>
  <TrashIcon aria-hidden="true" />
</button>

// ═══════════════════════════════════════════════════
// FORM WITH VALIDATION
// ═══════════════════════════════════════════════════
function AccessibleForm() {
  const emailId = useId();
  const emailErrorId = useId();
  const [error, setError] = useState('');

  return (
    <form>
      <label htmlFor={emailId}>
        {t('form.email')}
        <span aria-hidden="true">*</span>
      </label>
      
      <input
        id={emailId}
        type="email"
        aria-invalid={!!error}
        aria-describedby={error ? emailErrorId : undefined}
        aria-required="true"
      />
      
      {error && (
        <span id={emailErrorId} role="alert">
          {error}
        </span>
      )}
    </form>
  );
}

// ═══════════════════════════════════════════════════
// LIVE REGION
// ═══════════════════════════════════════════════════
function SearchResults({ results, isLoading }) {
  return (
    <div>
      <div aria-live="polite" className="sr-only">
        {isLoading 
          ? t('common.loading') 
          : t('search.results_count', { count: results.length })
        }
      </div>
      
      <ul role="list">
        {results.map(item => <li key={item.id}>{item.name}</li>)}
      </ul>
    </div>
  );
}

// ═══════════════════════════════════════════════════
// SKIP LINK
// ═══════════════════════════════════════════════════
function Layout({ children }) {
  return (
    <>
      <a href="#main-content" className="sr-only focus:not-sr-only">
        {t('common.skip_to_content')}
      </a>
      <header>...</header>
      <main id="main-content" tabIndex={-1}>
        {children}
      </main>
    </>
  );
}
```
---

# SVG ICONS ONLY - NO EMOJI

## Rule

**KHÔNG sử dụng emoji trong UI web.** Chỉ sử dụng SVG icons từ file `components/shared/ui/Icons.tsx`.

---

## Lý do

1. **Consistency**: Emoji hiển thị khác nhau trên các OS/browser
2. **Customizable**: SVG có thể thay đổi màu sắc, kích thước qua CSS
3. **Performance**: SVG được render bởi browser, không cần font fallback
4. **Accessibility**: SVG có thể có aria-label, role

---

## Icon Registry

Tất cả icons được lưu tại: `components/shared/ui/Icons.tsx`

### Available Icons (45+)

| Category | Icons |
|----------|-------|
| **Navigation** | DashboardIcon, HomeIcon, MenuIcon, CloseIcon, SearchIcon |
| **Actions** | AddIcon, EditIcon, DeleteIcon, ResetIcon, ExportIcon |
| **Feedback** | SuccessIcon, WarningIcon, ErrorIcon, InfoIcon |
| **Auth** | EmailIcon, KeyIcon, EyeIcon, EyeOffIcon, LogoutIcon |
| **Features** | StudentIcon, LessonIcon, TestIcon, ClassIcon, BankIcon |
| **UI** | SettingsIcon, MoreIcon, UserIcon, NotificationIcon |
| **Branding** | IconLogo, IconLogoVertical, IconGoogle |

---

## Usage Pattern

```tsx
// BAD - Emoji
<span className="text-2xl">📚</span>
<div>🎓 Student Name</div>
<button>✅ Save</button>

// GOOD - SVG Icon từ Icons.tsx
import { StudentIcon, SuccessIcon, LessonIcon } from '@/components/shared/ui/Icons';

<StudentIcon className="w-6 h-6 text-primary-600" />
<div className="flex items-center gap-2">
  <StudentIcon className="w-5 h-5" />
  Student Name
</div>
<button className="flex items-center gap-2">
  <SuccessIcon className="w-4 h-4" />
  Save
</button>
```

---

## Adding New Icons

Khi cần icon mới, thêm vào `Icons.tsx`:

```tsx
// Template cho icon mới
export const NewIcon: React.FC<{ className?: string }> = ({ className = 'w-6 h-6' }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="..." />
  </svg>
);
```

### Nguồn SVG:
- [Heroicons](https://heroicons.com/) (khuyến khích - Tailwind official)
- [Lucide](https://lucide.dev/)
- [Phosphor](https://phosphoricons.com/)

---

## Icon Props Convention

```tsx
interface IconProps {
  className?: string;  // Tailwind classes cho size và color
}

// Default sizes theo use case:
// - Navigation: w-6 h-6
// - Inline với text: w-5 h-5
// - Button icon: w-4 h-4
// - Large display: w-8 h-8 hoặc w-12 h-12
```

---

## Checklist

Khi code UI, kiểm tra:

- [ ] Không có emoji trong JSX?
- [ ] Icon được import từ `Icons.tsx`?
- [ ] Icon có className để control size/color?
- [ ] Icon mới được thêm vào `Icons.tsx` (không inline SVG)?


---

## 🚫 ANTI-PATTERNS

| ❌ Anti-Pattern | ✅ Correct Pattern | Severity |
|----------------|-------------------|----------|
| `any` type | Explicit interface | 🔴 Critical |
| useState + useEffect cho API | React Query | 🔴 Critical |
| Hardcoded text | `t('namespace.key')` | 🔴 Critical |
| Skip TypeScript check | `npx tsc --noEmit --strict` | 🔴 Critical |
| No error handling | try/catch + toast | 🔴 Critical |
| `import _ from 'lodash'` | `import { debounce } from 'lodash'` | 🟡 Major |
| `<div onClick>` | `<button onClick>` | 🟡 Major |
| Component > 300 lines | Split components | 🟡 Major |
| Quick fix / workaround | Root cause fix | 🟡 Major |
| No loading states | Show skeleton/spinner | 🟡 Major |
| `console.log(error)` | Structured error handling | 🟡 Major |
| Inline styles | Tailwind classes | 🟢 Minor |
| Magic numbers | Named constants | 🟢 Minor |
| Abbreviations | Full words | 🟢 Minor |

---

## 📚 REFERENCE FILES

| Pattern | File |
|---------|------|
| Master-Detail Layout | `components/shared/layouts/MasterDetailLayout.tsx` |
| Page Structure | `components/features/classes/ClassManagementPage.tsx` |
| Modal Pattern | `components/features/classes/CreateEditClassModal.tsx` |
| i18n Usage | `components/features/students/StudentPage.tsx` |
| Auth Components | `components/features/auth/LoginPage.tsx` |
| Zustand Store | `components/shared/store/useAppStore.ts` |
| API Service | `services/classroom/classService.ts` |

---

## 💎 CLOSING MANTRA

```
┌─────────────────────────────────────────────────────────────┐
│                                                             │
│   "Code không cần tự do. Code cần kỷ luật."                 │
│                                                             │
│   The Holy Trinity:                                         │
│   1. Discipline - Follow conventions without exception      │
│   2. Consistency - Same patterns everywhere                 │
│   3. Quality - Never compromise for speed                   │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

## 📜 CHANGELOG

### v1.2.0 (2025-12-16)
- Merged all RULES files into single GEMINI.md
- Added Storybook support to ESLint
- Added .prettierrc configuration

### v1.1.0 (2025-12-16)
- Split into multiple files (< 12K chars each)
- Added .eslintrc.js configuration
- Added CI/CD pipeline (ci.yml)
- Enhanced security section (12 layers)

### v1.0.0 (2025-12-16)
- Initial release with LORE framework
---

**⬅️ Trước:** [rules-quality.md](.agent/rules/rules-quality.md) | **🏠 Home:** [gemini-local.md](.agent/rules/gemini-local.md)