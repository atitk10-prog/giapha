# Security Guidelines & Post-Mortems

## Secrets Management
- **API Keys Exposure**: Never hardcode API Keys or fallback credentials in the codebase. Always rely on environment variables (`process.env`).
- **Client Storage Risks**: Never store sensitive tokens (like LLM API keys) in `localStorage` due to persistent XSS risk. Use `sessionStorage` so keys are automatically destroyed when the browser session ends.

## Penetration & Chaos Testing
- **API Resilience**: Endpoints must be resilient against missing payloads, invalid tokens, and fake hashes. Unauthorized requests should gracefully return `401` without throwing server 500 errors.
- **Global Error Notification**: Ensure the frontend has a Global Error Catcher (e.g., Toast notifications) to communicate network/auth failures clearly to the user, rather than failing silently.

## Auth Bypasses
- **Server-side Auth (Accepted Risk)**: Using `signInWithEmailAndPassword` on a backend Serverless Endpoint to bypass Firestore Rules is an accepted risk, *provided* the backend logic is strictly static and does not allow dynamic client query injection. This acts as a pseudo-Service Account for server environments that cannot securely load a JSON key file.
