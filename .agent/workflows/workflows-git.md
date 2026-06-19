---
description: ## Git Commit & Code Review Process
---

# 📝 EDUGENIUS WORKFLOWS - GIT
## Git Commit & Code Review Process

**Version:** 1.1.0 | **Updated:** 2025-12-16

### 📚 Related: [WORKFLOWS-QUALITY](./WORKFLOWS-QUALITY.md) | [RULES-CORE](./RULES-CORE.md)

---

## 📝 COMMIT MESSAGE FORMAT

```
<type>(<scope>): <description>

<body>
- What changed
- Why it changed

Verification:
- [ ] TypeScript: 0 errors
- [ ] Tests: All pass

Closes #<issue>
```

### Types

| Type | Emoji | Use |
|------|-------|-----|
| `feat` | ✨ | New feature |
| `fix` | 🐛 | Bug fix |
| `refactor` | ♻️ | Code restructure |
| `perf` | ⚡ | Performance |
| `style` | 💄 | Formatting |
| `docs` | 📝 | Documentation |
| `test` | ✅ | Testing |
| `chore` | 🔧 | Maintenance |

### Scopes

`students` | `tests` | `auth` | `ui` | `api` | `i18n` | `a11y`

### Examples

```bash
# Feature
git commit -m "feat(students): Add Excel export

- Added ExcelJS dependency
- Created exportStudents utility
- Added loading state and toast feedback

Closes #123"

# Bug fix
git commit -m "fix(modal): Prevent stale data on delete

Root Cause: EditModal kept reference to deleted student

Fix:
- Close modal when selectedStudent becomes null
- Clear selection on successful deletion

Closes #456"

# Refactor
git commit -m "refactor(hooks): Extract filters to custom hook

- Moved state to useStudentFilters
- Added debounced filters
- Reduced StudentPage from 450 to 280 lines

No functional changes."
```

---

## 🚀 PRE-COMMIT CHECKLIST

```bash
# 1. TypeScript
npx tsc --noEmit --strict  # Must: 0 errors

# 2. Lint
npm run lint               # Must: 0 errors

# 3. Tests
npm test                   # Must: All pass

# 4. No debug code
grep -r "console.log" src/ --include="*.ts" --include="*.tsx"
```

---

## 👀 CODE REVIEW

### PR Description Template

```markdown
## Summary
Brief description

## Type
- [ ] 🐛 Bug fix
- [ ] ✨ Feature
- [ ] ♻️ Refactor

## Screenshots (if UI)
| Before | After |
|--------|-------|

## Testing Done
- [ ] Unit tests
- [ ] Manual testing

## Notes for Reviewers
Focus areas or context needed
```

### For Author (Before Review)

```
✅ Must Pass:
- [ ] tsc --strict = 0 errors
- [ ] npm test = All pass
- [ ] Manual testing done
- [ ] No console.log

📋 Should Check:
- [ ] PR description clear
- [ ] Screenshots for UI
- [ ] No TODO comments
- [ ] Branch up to date
```

### For Reviewer

```
📋 Logic & Correctness
- [ ] Matches requirements?
- [ ] Edge cases handled?
- [ ] No race conditions?

📋 Code Quality
- [ ] TypeScript strict?
- [ ] Naming follows conventions?
- [ ] No duplication?
- [ ] Functions < 50 lines?

📋 Error Handling
- [ ] try/catch for async?
- [ ] User-friendly messages?
- [ ] Fallback UI?

📋 UX
- [ ] Loading states?
- [ ] Success/error toast?
- [ ] Responsive?

📋 Performance
- [ ] No unnecessary re-renders?
- [ ] Large lists virtualized?

📋 Security
- [ ] Input validated?
- [ ] HTML sanitized?

📋 i18n
- [ ] No hardcoded strings?
- [ ] Keys in vi.json & en.json?

📋 A11y
- [ ] Semantic HTML?
- [ ] aria-labels?
- [ ] Keyboard nav?
```

### Feedback Prefixes

```
🔴 BLOCKER - Must fix before merge
   "This will cause runtime error when student is null"

🟡 SUGGESTION - Should consider
   "Consider useMemo here for performance"

🟢 NIT - Minor, optional
   "Could rename for clarity"

💡 QUESTION - Need clarification
   "What's expected when list is empty?"

👍 PRAISE - Good work!
   "Great use of early returns!"
```

---

## 🔄 GIT WORKFLOW

```
main ─────────────────────────────────────────────►
       \                    /
        \──► feature/xxx ──/
              │
              ├── commit 1: feat(scope): description
              ├── commit 2: fix(scope): description
              └── PR → Review → Merge
```

### Branch Naming

```
feature/add-student-export
fix/modal-stale-data
refactor/extract-filters-hook
perf/virtualize-student-list
```