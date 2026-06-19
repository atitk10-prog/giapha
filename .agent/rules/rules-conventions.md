---
trigger: always_on
---

# 📛 EDUGENIUS RULES - CONVENTIONS
## Naming & Import Standards

**Version:** 1.3.0 | **Updated:** 2025-12-21

**⬅️ Trước:** [GEMINI.md](./GEMINI.md) | **➡️ Tiếp:** [rules-components.md](./rules-components.md)

---

## 📛 NAMING CONVENTIONS

### File Naming

| Loại | Convention | Ví dụ |
|------|------------|-------|
| Components | PascalCase | `StudentCard.tsx` |
| Pages | PascalCase + Page suffix | `StudentPage.tsx` |
| Hooks | camelCase + use prefix | `useStudentFilters.ts` |
| Utils | camelCase | `formatDate.ts`, `validation.ts` |
| Types | camelCase + .types suffix | `student.types.ts` |
| Tests | Original + .test suffix | `StudentCard.test.tsx` |
| Stories | Original + .stories suffix | `StudentCard.stories.tsx` |
| Constants | camelCase | `constants.ts` |

### Code Naming

```typescript
// ═══════════════════════════════════════════════════
// COMPONENTS - PascalCase
// ═══════════════════════════════════════════════════
const StudentCard: React.FC<Props> = () => { };
const CreateStudentModal: React.FC<Props> = () => { };

// ═══════════════════════════════════════════════════
// HOOKS - camelCase với use prefix
// ═══════════════════════════════════════════════════
const useStudentFilters = () => { };
const useDebounce = (value: string, delay: number) => { };

// ═══════════════════════════════════════════════════
// FUNCTIONS - camelCase, verb-first
// ═══════════════════════════════════════════════════

// API/Async: verb + Noun
const fetchStudents = async () => { };
const createStudent = async (data: StudentInput) => { };
const updateStudent = async (id: string, data: Partial<Student>) => { };
const deleteStudent = async (id: string) => { };

// Utility: verb + Noun
const formatDate = (date: Date) => { };
const validateEmail = (email: string) => { };
const calculateScore = (answers: Answer[]) => { };

// Transformers: to + Target
const toStudentDTO = (student: Student) => { };
const toDisplayFormat = (data: RawData) => { };

// ═══════════════════════════════════════════════════
// EVENT HANDLERS - handle + Event/Action
// ═══════════════════════════════════════════════════
const handleSubmit = () => { };
const handleDelete = () => { };
const handleInputChange = () => { };
const handleStudentClick = (studentId: string) => { };

// ═══════════════════════════════════════════════════
// BOOLEAN VARIABLES - is/has/should/can prefix
// ═══════════════════════════════════════════════════
const isLoading = true;
const isVisible = false;
const hasError = false;
const hasPermission = true;
const shouldRefetch = true;
const canEdit = false;

// ═══════════════════════════════════════════════════
// CONSTANTS - SCREAMING_SNAKE_CASE
// ═══════════════════════════════════════════════════
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const DEFAULT_PAGE_SIZE = 20;
const API_TIMEOUT = 30000;
const DEBOUNCE_DELAY = 300;

const ALLOWED_FILE_TYPES = ['image/jpeg', 'image/png', 'image/webp'] as const;

// ═══════════════════════════════════════════════════
// TYPES & INTERFACES - PascalCase
// ═══════════════════════════════════════════════════

// Props: ComponentName + Props
interface StudentCardProps {
  student: Student;
  onEdit: (id: string) => void;
}

// State: Noun + State
interface FilterState {
  search: string;
  grade: string;
}

// API Response: Noun + Response
interface StudentsResponse {
  data: Student[];
  pagination: Pagination;
}

// Input/Payload: Noun + Input/Payload
interface CreateStudentInput {
  fullName: string;
  email: string;
}

// Enums: PascalCase (singular)
enum StudentStatus {
  Active = 'active',
  Inactive = 'inactive',
  Pending = 'pending',
}

// ═══════════════════════════════════════════════════
// GENERICS
// ═══════════════════════════════════════════════════
function identity<T>(value: T): T { return value; }
function merge<TSource, TTarget>(source: TSource, target: TTarget) { }
```

### Naming Anti-Patterns

```typescript
// ❌ SAI                          // ✅ ĐÚNG
const d = new Date();              const currentDate = new Date();
const arr = [];                    const students = [];
const temp = calculate();          const totalScore = calculate();
const handleIt = () => {};         const handleSubmit = () => {};
const flag = true;                 const isEnabled = true;

// Abbreviations - TRÁNH
const stdnt = {};                  const student = {};
const btn = null;                  const button = null;
const msg = '';                    const message = '';
```

---

## 📦 IMPORT ORDER

Imports phải được sắp xếp theo thứ tự sau, mỗi group cách nhau 1 dòng trống:

```typescript
// ═══════════════════════════════════════════════════
// GROUP 1: React & React-related core
// ═══════════════════════════════════════════════════
import React, { useState, useCallback, useMemo, memo } from 'react';
import { createPortal } from 'react-dom';

// ═══════════════════════════════════════════════════
// GROUP 2: Third-party libraries (alphabetical)
// ═══════════════════════════════════════════════════
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useVirtualizer } from '@tanstack/react-virtual';
import DOMPurify from 'isomorphic-dompurify';
import { useTranslation } from 'react-i18next';
import { useNavigate, useParams } from 'react-router-dom';

// ═══════════════════════════════════════════════════
// GROUP 3: Internal aliases - @ paths (alphabetical)
// ═══════════════════════════════════════════════════
import { Button, Input, Modal } from '@/components/ui';
import { PageLayout } from '@/components/layouts';
import { useAppStore } from '@/stores/appStore';
import { supabase } from '@/lib/supabase';
import { formatDate, cn } from '@/utils';
import type { Student, Teacher } from '@/types';

// ═══════════════════════════════════════════════════
// GROUP 4: Relative imports - parent directories first
// ═══════════════════════════════════════════════════
import { StudentFilters } from '../StudentFilters';
import { useStudentFilters } from '../hooks/useStudentFilters';

// ═══════════════════════════════════════════════════
// GROUP 5: Same directory imports
// ═══════════════════════════════════════════════════
import { StudentCard } from './StudentCard';
import { validateStudent } from './student.utils';
import type { StudentCardProps } from './student.types';

// ═══════════════════════════════════════════════════
// GROUP 6: Styles & Assets (cuối cùng)
// ═══════════════════════════════════════════════════
import styles from './StudentList.module.css';
import './StudentList.css';
```

### Import Rules

```typescript
// ✅ ĐÚNG: Named imports specific
import { debounce, throttle } from 'lodash';

// ❌ SAI: Import toàn bộ library
import _ from 'lodash';           // Bundle cả 500KB+

// ✅ ĐÚNG: Type imports riêng
import type { Student, Teacher } from '@/types';
import { fetchStudents, type FetchStudentsParams } from '@/services';

// ✅ ĐÚNG: Barrel exports cho UI components
import { Button, Input, Modal } from '@/components/ui';

// ❌ SAI: Deep imports khi có barrel
import { Button } from '@/components/ui/Button/Button';
```

---


---

**⬅️ Trước:** [gemini-local.md](.agent/rules/gemini-local.md) | **➡️ Tiếp:** [rules-components.md](.agent/rules/rules-components.md)