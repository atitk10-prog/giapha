# Database & Backend Architecture

## Database Design & Querying
- **Aggregation over Queries**: Avoid `collectionGroup` combined with `getDocs` for counting records (e.g., leaderboard stats). Use `getCountFromServer(collectionRef)` to save reads and bandwidth.
- **Sorting Behavior (Firestore)**: `orderBy` in Firestore hides documents that lack the target field. For incomplete schemas, either fetch all and sort client-side (for small datasets), or run a data migration to add default fields.
- **NoSQL Upserts (Storage Leak Prevention)**: For bot-heavy endpoints, avoid creating random IDs. Hardcode the Document ID (e.g., `${symbol}_${timeframe}`) and use `setDoc` (Upsert). This limits max storage size to the total number of unique ID combinations.

## Security & Concurrency
- **Transaction Safety**: Always use `runTransaction` for critical mutations (e.g., point/credit deductions) to prevent race-condition exploits.
- **Backend API Standardization**: Return a standard JSON schema `{ success: false, errorCode: String, message: String }` from API Routes. Never leak stack traces.
- **Exception Handling in Backend**: Never use `.catch(console.error)` exclusively on serverless endpoints without sending a response. This leaves the client hanging.

## Infrastructure Refactoring
- **JSONB vs Relational**: Avoid storing massive arrays in single JSONB blobs (e.g., `user_favs`). This causes overwrite race-conditions. Split into relational rows with atomic `INSERT/DELETE`.
- **Local-First Pattern**: Transient configs (filters, selected indicators) should be stored locally (`localStorage`) bypassing the DB to speed up UX and prevent synchronization conflicts.
- **Vitest Mocking**: When mocking singletons (e.g., `AuthStore`), mock all methods the component might call. Always update `CONTEXT.md` after migrating core infrastructures (like Firebase to Supabase).
