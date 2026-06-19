---
trigger: always_on
---

# 🔒 EDUGENIUS RULES - SECURITY (Part 1)
## 12 Layers Security Architecture - Layers 1-6

**Version:** 1.3.0 | **Updated:** 2025-12-21

**⬅️ Trước:** [rules-dataflow.md](./rules-dataflow.md) | **➡️ Tiếp:** [rules-security-2.md](./rules-security-2.md)

---

## 🔒 SECURITY LORE

### 12 Layers Security Architecture

EduGenius triển khai **Defense in Depth** với 12 lớp bảo mật:

```
┌─────────────────────────────────────────────────────────────┐
│                    SECURITY LAYERS                          │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ LAYER 12: Content-Security-Policy (HTTP Headers)    │   │
│  └─────────────────────────────────────────────────────┘   │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ LAYER 11: URL Validation (sanitizeUrl/ImageUrl)     │   │
│  └─────────────────────────────────────────────────────┘   │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ LAYER 10: Path Traversal (sanitizeFilePath)         │   │
│  └─────────────────────────────────────────────────────┘   │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ LAYER 9: Prompt Injection (Edge Functions)          │   │
│  └─────────────────────────────────────────────────────┘   │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ LAYER 8: LaTeX Security (Block dangerous commands)  │   │
│  └─────────────────────────────────────────────────────┘   │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ LAYER 7: Input Validation (validation.ts)           │   │
│  └─────────────────────────────────────────────────────┘   │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ LAYER 6: CSRF Token (generateCSRFToken)             │   │
│  └─────────────────────────────────────────────────────┘   │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ LAYER 5: RLS Policies (Database-level)              │   │
│  └─────────────────────────────────────────────────────┘   │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ LAYER 4: MFA/TOTP (MFAEnrollModal.tsx)              │   │
│  └─────────────────────────────────────────────────────┘   │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ LAYER 3: Authentication (Supabase JWT + Session)    │   │
│  └─────────────────────────────────────────────────────┘   │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ LAYER 2: Rate Limiting (Token Bucket Algorithm)     │   │
│  └─────────────────────────────────────────────────────┘   │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ LAYER 1: XSS Protection (DOMPurify + sanitize.ts)   │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### Security Layers Reference

| # | Layer | Files | Mô tả |
|---|-------|-------|-------|
| 1 | **XSS Protection** | `DOMPurify`, `sanitize.ts` | Sanitize HTML input, prevent script injection |
| 2 | **SQL Injection** | `queryUtils.ts`, Supabase params | Parameterized queries, no raw SQL |
| 3 | **Rate Limiting** | `rateLimiter.ts` | Token Bucket algorithm, prevent brute force |
| 4 | **Authentication** | Supabase JWT, session checks | JWT validation, session management |
| 5 | **MFA (TOTP)** | `MFAEnrollModal.tsx` | Two-factor authentication |
| 6 | **RLS Policies** | Database-level (all tables) | Row-level security, data isolation |
| 7 | **CSRF Token** | `generateCSRFToken()` | Cross-site request forgery protection |
| 8 | **Input Validation** | `validation.ts`, `inputValidation.ts` | Schema validation, type checking |
| 9 | **LaTeX Security** | Block dangerous commands | Prevent command injection via LaTeX |
| 10 | **Prompt Injection** | Edge Functions sanitization | AI prompt sanitization |
| 11 | **Path Traversal** | `sanitizeFilePath()` | Prevent `../` attacks |
| 12 | **URL Validation** | `sanitizeUrl()`, `sanitizeImageUrl()` | Whitelist domains, prevent SSRF |

### Input Validation Chain

```
User Input
    │
    ▼
┌─────────────────────────┐
│ 1. CLIENT VALIDATION    │  ← UX feedback nhanh
│    • Format check       │     validation.ts
│    • Length limits      │     inputValidation.ts
│    • Required fields    │
└───────────┬─────────────┘
            │
            ▼
┌─────────────────────────┐
│ 2. SANITIZATION         │  ← XSS prevention
│    • DOMPurify.sanitize │     sanitize.ts
│    • sanitizeUrl()      │
│    • sanitizeFilePath() │
└───────────┬─────────────┘
            │
            ▼
┌─────────────────────────┐
│ 3. SERVER VALIDATION    │  ← Security gate
│    • Supabase RLS       │     Database policies
│    • Rate Limiting      │     rateLimiter.ts
│    • CSRF verification  │
└─────────────────────────┘
```

### Layer 1: XSS Protection

```typescript
// sanitize.ts
import DOMPurify from 'isomorphic-dompurify';

const ALLOWED_TAGS = ['b', 'i', 'em', 'strong', 'p', 'br', 'ul', 'ol', 'li'];
const ALLOWED_ATTR = ['class', 'href', 'target'];

export function sanitizeHTML(dirty: string): string {
  return DOMPurify.sanitize(dirty, {
    ALLOWED_TAGS,
    ALLOWED_ATTR,
  });
}

// Usage in component
<div dangerouslySetInnerHTML={{ __html: sanitizeHTML(userContent) }} />
```

### Layer 2: Rate Limiting (Token Bucket)

```typescript
// rateLimiter.ts
interface RateLimiterConfig {
  maxTokens: number;      // Maximum burst capacity
  refillRate: number;     // Tokens per second
  windowMs: number;       // Time window
}

const RATE_LIMITS: Record<string, RateLimiterConfig> = {
  api: { maxTokens: 100, refillRate: 10, windowMs: 60000 },
  auth: { maxTokens: 5, refillRate: 1, windowMs: 60000 },
  upload: { maxTokens: 10, refillRate: 2, windowMs: 60000 },
};

export function checkRateLimit(
  key: string, 
  type: keyof typeof RATE_LIMITS
): boolean {
  // Token bucket implementation
  // Returns true if request allowed, false if rate limited
}
```

### Layer 3-4: Authentication & MFA

```typescript
// Authentication check
const { data: { session }, error } = await supabase.auth.getSession();

if (!session) {
  redirect('/login');
}

// MFA verification (if enabled)
const { data: factors } = await supabase.auth.mfa.listFactors();
if (factors?.totp?.length > 0) {
  // Require TOTP verification
  const { data, error } = await supabase.auth.mfa.verify({
    factorId: factors.totp[0].id,
    code: totpCode,
  });
}
```

### Layer 5: RLS Policies

```sql
-- Example RLS policy for students table
CREATE POLICY "Teachers can only see their own students"
ON students
FOR SELECT
USING (
  teacher_id = auth.uid()
  OR 
  EXISTS (
    SELECT 1 FROM class_teachers 
    WHERE class_id = students.class_id 
    AND teacher_id = auth.uid()
  )
);

-- Policy for INSERT
CREATE POLICY "Teachers can only create students in their classes"
ON students
FOR INSERT
WITH CHECK (
  teacher_id = auth.uid()
);
```

### Layer 6: CSRF Protection

```typescript
// generateCSRFToken.ts (Browser-compatible using Web Crypto API)
export function generateCSRFToken(): string {
  const array = new Uint8Array(32);
  crypto.getRandomValues(array);
  return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
}

// Store in session/cookie and verify on mutations
export function verifyCSRFToken(token: string, sessionToken: string): boolean {
  return token === sessionToken;
}
```

---

**⬅️ Trước:** [rules-dataflow.md](.agent/rules/rules-dataflow.md) | **➡️ Tiếp:** [rules-security-2.md](.agent/rules/rules-security-2.md)