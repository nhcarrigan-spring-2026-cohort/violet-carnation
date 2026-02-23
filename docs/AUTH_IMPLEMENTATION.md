# Auth Implementation Summary

This document summarises all changes made to implement the Auth Middleware, Cookies & Session tasks described in [AUTH_TASKS.md](./AUTH_TASKS.md).

All 12 tasks (T1–T12) from AUTH_TASKS.md were completed. Changes were committed in 6 focused commits on the `feat/146/auth-finalization` branch.

---

## Commits

| Commit    | Description                                                                   |
| --------- | ----------------------------------------------------------------------------- |
| `d2491cb` | feat: set httpOnly session cookie on login, add logout and /auth/me endpoints |
| `03263f5` | feat: protect all mutation routes with auth dependency                        |
| `90533a1` | feat: add server session utility and client auth context                      |
| `97f9b1e` | fix: add credentials include to all client fetch calls                        |
| `6a4d3f0` | feat: add middleware route protection, sign-out, and auth-aware NavBar        |
| `9e0046b` | chore: remove plain user_id cookie references and auth TODO comments          |

---

## Changes by Task

### T1 – Store the JWT token as an httpOnly cookie on login

**File:** `api/routes/auth.py`

- `POST /api/auth/login` now returns a `Set-Cookie: session=<token>; HttpOnly; SameSite=Lax; Path=/` header via `response.set_cookie()`.
- The JSON body `{ "access_token": "...", "token_type": "bearer" }` is preserved for Swagger UI compatibility.
- New `POST /api/auth/logout` endpoint clears the `session` cookie via `response.delete_cookie()`.
- `_IS_PRODUCTION` flag derives from the `ENV` env var to set `Secure=True` in production.

### T2 – Read the session cookie in the FastAPI auth dependency

**File:** `api/utils/auth.py`

- `OAuth2PasswordBearer` changed to `auto_error=False` so it no longer raises 401 on missing header.
- `get_current_user` now accepts `session: Optional[str] = Cookie(default=None)` and `bearer_token: Optional[str] = Depends(oauth2_scheme)`.
- Cookie is checked first; `Authorization: Bearer` header is the fallback.
- Returns 401 if neither is present.

### T3 – Protect all mutation routes

**Files:** `api/routes/events.py`, `api/routes/organization.py`, `api/routes/event_registrations.py`

- Added `from utils.auth import get_current_user` import to each file.
- Added `_current_user: dict = Depends(get_current_user)` parameter to:
  - `POST /api/events`, `PUT /api/events/{event_id}`, `DELETE /api/events/{event_id}`
  - `POST /api/organization`, `PUT /api/organization/{organization_id}`, `DELETE /api/organization/{organization_id}`
  - `POST /api/event-registrations`, `DELETE /api/event-registrations/{organization_id}/{event_id}/{user_id}`
- All listed routes now return `401` when no valid token or cookie is present.

### T4 – Forward the session cookie with all client API requests

**Files:** `client/lib/events.ts`, `client/app/profile/page.tsx`, `client/app/organizations/create/page.tsx`, `client/app/events/[id]/page.tsx`, `client/app/organizations/[id]/page.tsx`, `client/app/organizations/[id]/edit/page.tsx`, `client/app/organizations/[id]/users/page.tsx`

- Added `credentials: "include"` to every `fetch()` call for mutation endpoints (POST, PUT, DELETE).
- Replaced hardcoded `user_id: 1` in `events/[id]/page.tsx` with `userId ?? 1` from `useCurrentUserId()`.

### T5 – Create a server-side auth session utility

**New file:** `client/lib/session.ts`

- `getServerSession()` reads the `session` cookie from `next/headers` using the Next.js cookies API.
- Decodes the JWT payload by Base64URL-decoding the middle segment (no signature verification — the API handles that).
- Returns `{ userId: number } | null`.
- Used in `app/layout.tsx` to replace the old plain `user_id` cookie for SSR role pre-fetching.

### T6 – Replace `useCurrentUserId` with a client-side auth context

**New file:** `client/context/AuthContext.tsx`

- `AuthProvider` calls `GET /api/auth/me` with `credentials: "include"` on mount.
- Stores `AuthUser { user_id, email, first_name, last_name }` or `null`.
- Exposes `useAuth()` hook with `{ user, loading, refresh, logout }`.
- `refresh()` re-fetches `/api/auth/me` (called after login).
- `logout()` clears the `user` state (called after the logout API response).

**Modified:** `client/lib/useCurrentUserId.ts`

- Rewritten to use `useAuth()` instead of reading `document.cookie` directly.
- Returns `user?.user_id ?? null`.

### T7 – Add a Next.js `middleware.ts` for route protection

**New file:** `client/middleware.ts`

- Protects `/profile`, `/profile/history`, `/events/create`, `/organizations/create`, and any path ending in `/edit` under `/events/` or `/organizations/`.
- Redirects unauthenticated requests to `/signin?next=<original-path>`.
- `client/app/(auth)/signin/page.tsx` updated to read the `?next` query param and redirect there after successful login; also calls `refresh()` to hydrate the auth context immediately.

### T8 – Implement sign-out

**Modified:** `client/components/NavBar.tsx`

- "Sign Out" button calls `POST /api/auth/logout` with `credentials: "include"`.
- On success, calls `logout()` from `AuthContext` to clear client-side state.
- Redirects to `/signin` via `router.push`.

### T9 – Conditionally render auth links in NavBar

**Modified:** `client/components/NavBar.tsx`

- Uses `useAuth()` to check `user`.
- Shows **Profile** + **Sign Out** when authenticated.
- Shows **Sign In** + **Sign Up** when unauthenticated.

### T10 – Remove the plain `user_id` cookie references

**Modified files:** `client/app/layout.tsx`, `client/lib/useCurrentUserId.ts`, `client/app/profile/page.tsx`, `client/components/RecommendedEvents.tsx`, `client/context/RolesContext.tsx`, `client/app/organizations/create/page.tsx`, `client/app/organizations/[id]/edit/page.tsx`, `client/app/organizations/[id]/users/page.tsx`

- `layout.tsx`: removed `cookies().get("user_id")` lookup; replaced with `getServerSession()`.
- `useCurrentUserId.ts`: no longer reads `document.cookie`.
- All TODO/NOTE comments referencing the plain `user_id` cookie were removed.

### T11 – Secure `SECRET_KEY` configuration

**Modified:** `api/utils/security.py`

- Added startup guard: if `_ENV != "development"` and `SECRET_KEY` equals the dev default string, a `RuntimeError` is raised, preventing the server from starting.
- `ENV` env var defaults to `"development"`.

**Modified:** `api/.env.example`

- Added `SECRET_KEY`, `ENV`, and `ALLOWED_ORIGINS` documentation with generation instructions.

**Modified:** `docs/CONTRIBUTING.md`

- Added step 4 in the Backend setup section explaining how to copy `.env.example` to `.env` and generate a secure `SECRET_KEY`.

**Modified:** `.gitignore`

- Added `!.env.example` negation so the example file can be committed despite the `.env*` ignore pattern.

### T12 – Add a `GET /api/auth/me` endpoint

**Modified:** `api/routes/auth.py`

- New `GET /api/auth/me` endpoint protected by `Depends(get_current_user)`.
- Returns `{ user_id, email, first_name, last_name }` for the currently authenticated user.
- Returns `401` when unauthenticated.
- Used by the client-side `AuthProvider` (T6) to hydrate auth state on page load.

---

## Issues Encountered

### `.env.example` blocked by `.gitignore`

The existing `.gitignore` contained `.env*` which matched `.env.example`. The fix was to add a `!.env.example` negation on the next line so the template file can be committed to the repository.

### Signin page uses `useSearchParams` — requires `Suspense`

Next.js 15 requires any component using `useSearchParams()` to be wrapped in a `<Suspense>` boundary, otherwise it throws a build error. The signin page was refactored to extract the form into a `SignInForm` inner component and wraps it in `<Suspense>` in the default export.

### `OAuth2PasswordBearer` auto-raises 401 before cookie check

FastAPI's `OAuth2PasswordBearer` defaults to `auto_error=True`, which raised a 401 before the dependency body could check the session cookie. Changed to `auto_error=False` so the dependency can handle both sources and return a consistent 401 with the correct detail message.

### `React.SubmitEvent` type in the original signin page

The original signin page used `React.SubmitEvent<HTMLFormElement>` which is not a standard React type (should be `React.FormEvent<HTMLFormElement>`). This was corrected while rewriting the signin page for the `?next` redirect support.

---

## Architecture Notes

- **Token flow:** Login → API sets `session` httpOnly cookie → browser sends cookie automatically on every request to `/api/*` → API validates JWT → returns data.
- **No token in JavaScript:** The `session` cookie is `httpOnly` so JavaScript cannot read it, closing the primary XSS attack vector.
- **SSR hydration:** `getServerSession()` in `lib/session.ts` decodes the JWT payload (without signature verification) to extract `userId` for server-side role pre-fetching in `layout.tsx`. All actual auth enforcement happens in the API.
- **Client state:** `AuthContext` calls `GET /api/auth/me` on mount to populate `user`. This makes a network request on every page load but keeps the client state authoritative and consistent.
- **Middleware:** The Next.js middleware checks only for the presence of the `session` cookie — it does not verify the JWT signature (that would require the secret key on the client). Users with an expired or tampered cookie will be allowed through the middleware but will receive 401s from the API on their first authenticated request.
