# Project memory

## Product intent & audience

- **Gibiverse**: student-focused academic resource-sharing + Q&A platform.
- Core flows: upload resources, ask/answer questions, vote on answers, search resources/questions.
- Audience: university students; secondary: admins moderating content.
- Platform intended to scale across multiple universities.

## Brand personality & voice

- Glossary-enforced vocabulary: prefer **student** (not user), **resource** (not file/document/material/upload), **answer** (not reply/comment/response), **vote** (not like/reaction/rating), **question** (not post/thread/topic), **course** (not class/subject/module), **university/department/academic period** (not school/faculty/term/quarter), **resource type** (not category/kind).
- Voice is student-centric and academic.

## Visual design & UX direction

- Monorepo apps: `apps/web` (port 3000, student-facing Next.js), `apps/admin` (port 3001, currently scaffold only).
- Shared UI package: `@gibiverse/ui`.
- Frontend patterns: fallback to `DEFAULT_PLATFORM_OVERVIEW` on API failure; detail/catalog pages need consistent error/loading states.
- Vote controls, question discussion, search UI are key components (`apps/web/components/`).
- `apps/web/proxy.ts` handles auth-protected route prefixes.

## Decisions, constraints & rationale

- **ADR 0004**: Q&A operations must be wrapped in DB transactions (voting already compliant; Q&A module is not yet).
- API: Hono + `zValidator`; ORM: Drizzle; Auth: Better Auth (Google OAuth); Storage: provider abstraction (local/S3 stub).
- Shared schemas/validation in `@gibiverse/shared`.
- Glossary checker (`scripts/check-glossary.ts`) currently enforces only 7 rules and scans limited paths.
- API error contract: `{ error: string }`; `zValidator` custom handlers return only first issue (should aggregate).
- API routes: resources, questions, answers, votes, search, overview; no delete/edit routes yet.

## Open questions & assumptions

- **Vote field drift**: API returns both `studentVote` and `userVote`; canonical should be `studentVote` per glossary. Needs end-to-end dedup.
- **Q&A atomicity**: answer count increment and accept-answer updates are non-transactional — race/drift risk.
- **No pagination** on any list/search endpoint — scalability blocker.
- **Missing routes**: delete/edit for resources/questions/answers; no soft-delete column in schema.
- **Admin app** is empty scaffold — no moderation/management/auth.
- **Prod readiness gaps**: no rate limiting, no env validation at startup, no health check, no request-size limit on uploads, no structured logging.
- **Dead code**: `apps/api/src/lib/json.ts`, `apps/api/src/lib/resource-validation.ts`, `StorageProvider.getUrl`, stale `README.md`.
- **`.env.example`** missing; required vars undocumented.
- **Test gaps**: ownership/authorization edge cases, expired-session handling, integration smoke test against seeded DB.
- **Overview route** uses fragile raw SQL unwrapping for `activeCourses`.
- **Search endpoint** returns unbounded results (no `.limit()`).