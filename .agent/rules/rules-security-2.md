---
trigger: always_on
---

# 🔐 EDUGENIUS RULES - SECURITY (Part 2)
## 12 Layers Security Architecture - Layers 7-12

**Version:** 1.3.0 | **Updated:** 2025-12-21

**⬅️ Trước:** [rules-security-1.md](./rules-security-1.md) | **➡️ Tiếp:** [rules-quality.md](./rules-quality.md)

---


### Layer 7-8: Input Validation

```typescript
// validation.ts
export const studentSchema = z.object({
  fullName: z.string().min(2).max(100).trim(),
  email: z.string().email().toLowerCase(),
  grade: z.enum(['grade_1', 'grade_2', /* ... */ 'grade_12']),
  phone: z.string().regex(/^[0-9+\-\s()]+$/).optional(),
});

// inputValidation.ts
export function validateAndSanitize<T>(
  data: unknown, 
  schema: z.ZodSchema<T>
): { success: true; data: T } | { success: false; errors: string[] } {
  const result = schema.safeParse(data);
  if (!result.success) {
    return { 
      success: false, 
      errors: result.error.errors.map(e => e.message) 
    };
  }
  return { success: true, data: result.data };
}
```

### Layer 9: LaTeX Security

```typescript
// Block dangerous LaTeX commands
const DANGEROUS_LATEX_COMMANDS = [
  '\\input',
  '\\include',
  '\\write',
  '\\read',
  '\\openout',
  '\\openin',
  '\\immediate',
  '\\newwrite',
  '\\catcode',
] as const;

export function sanitizeLatex(latex: string): string {
  let sanitized = latex;
  
  for (const cmd of DANGEROUS_LATEX_COMMANDS) {
    const regex = new RegExp(cmd.replace('\\', '\\\\'), 'gi');
    sanitized = sanitized.replace(regex, '');
  }
  
  return sanitized;
}
```

### Layer 10: Prompt Injection Protection

```typescript
// Edge Function: sanitize AI prompts
export function sanitizePrompt(userInput: string): string {
  // Remove potential injection patterns
  const patterns = [
    /ignore previous instructions/gi,
    /disregard all prior/gi,
    /forget everything/gi,
    /new instruction:/gi,
    /system prompt:/gi,
  ];
  
  let sanitized = userInput;
  for (const pattern of patterns) {
    sanitized = sanitized.replace(pattern, '[FILTERED]');
  }
  
  // Escape special characters
  sanitized = sanitized
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
    
  return sanitized;
}
```

### Layer 11: Path Traversal Protection

```typescript
// sanitizeFilePath.ts (Browser-compatible, no Node.js path module)
const ALLOWED_UPLOAD_DIR = '/uploads';

export function sanitizeFilePath(filePath: string): string | null {
  // Normalize path separators
  const normalized = filePath.replace(/\\/g, '/');
  
  // Check for traversal attempts
  if (normalized.includes('..')) {
    console.error('[Security] Path traversal attempt:', filePath);
    return null;
  }
  
  // Remove leading slashes and ensure within allowed directory
  const cleanPath = normalized.replace(/^\/+/, '');
  const resolved = `${ALLOWED_UPLOAD_DIR}/${cleanPath}`;
  
  // Validate final path
  if (!resolved.startsWith(ALLOWED_UPLOAD_DIR + '/')) {
    console.error('[Security] Path outside allowed dir:', filePath);
    return null;
  }
  
  return resolved;
}
```

### Layer 12: URL Validation

```typescript
// sanitizeUrl.ts
const TRUSTED_DOMAINS = [
  'supabase.co',
  'ui-avatars.com',
  'gravatar.com',
  'googleusercontent.com',
] as const;

const TRUSTED_IMAGE_DOMAINS = [
  ...TRUSTED_DOMAINS,
  'images.unsplash.com',
  'res.cloudinary.com',
  'cdn.example.com',
] as const;

export function sanitizeUrl(url: string): string | null {
  try {
    const parsed = new URL(url);
    
    // Must be HTTPS (except localhost)
    if (parsed.protocol !== 'https:' && parsed.hostname !== 'localhost') {
      return null;
    }
    
    // Check against whitelist
    const isTrusted = TRUSTED_DOMAINS.some(domain => 
      parsed.hostname.endsWith(domain)
    );
    
    if (!isTrusted) {
      console.warn('[Security] Untrusted URL:', url);
      return null;
    }
    
    return url;
  } catch {
    return null;
  }
}

export function sanitizeImageUrl(url: string): string | null {
  try {
    const parsed = new URL(url);
    
    if (parsed.protocol !== 'https:' && parsed.hostname !== 'localhost') {
      return null;
    }
    
    const isTrusted = TRUSTED_IMAGE_DOMAINS.some(domain => 
      parsed.hostname.endsWith(domain)
    );
    
    return isTrusted ? url : null;
  } catch {
    return null;
  }
}
```

### Content-Security-Policy Header

```toml
# netlify.toml or _headers file (for Vite/Netlify deployment)
[[headers]]
  for = "/*"
  [headers.values]
    Content-Security-Policy = "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; img-src 'self' data: https: blob:; connect-src 'self' https://*.supabase.co wss://*.supabase.co https://res.cloudinary.com; frame-ancestors 'none'; base-uri 'self';"
    X-Content-Type-Options = "nosniff"
    X-Frame-Options = "DENY"
    X-XSS-Protection = "1; mode=block"
    Referrer-Policy = "strict-origin-when-cross-origin"
```

### Security Checklist

```
[ ] LAYER 1-2: XSS & SQL
    ├─ [ ] DOMPurify for user HTML
    ├─ [ ] Parameterized queries only
    └─ [ ] No string concatenation in queries

[ ] LAYER 3-5: Auth & Access
    ├─ [ ] Session validation on every request
    ├─ [ ] MFA enabled for admin accounts
    └─ [ ] RLS policies on all tables

[ ] LAYER 6-7: Request Validation
    ├─ [ ] CSRF token on mutations
    ├─ [ ] Rate limiting on sensitive endpoints
    └─ [ ] Input validation with Zod schemas

[ ] LAYER 8-10: Content Security
    ├─ [ ] LaTeX commands sanitized
    ├─ [ ] AI prompts filtered
    └─ [ ] File paths validated

[ ] LAYER 11-12: External Resources
    ├─ [ ] URLs whitelisted
    ├─ [ ] CSP headers configured
    └─ [ ] No mixed content (HTTP in HTTPS)
```

---


---

**⬅️ Trước:** [rules-security-1.md](.agent/rules/rules-security-1.md) | **➡️ Tiếp:** [rules-quality.md](.agent/rules/rules-quality.md)