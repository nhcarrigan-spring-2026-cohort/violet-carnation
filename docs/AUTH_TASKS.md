# Auth Middleware, Cookies & Session – Task List

This document captures the current state of authentication between the FastAPI back-end and Next.js front-end, and lists finite tasks to bring the implementation to a secure, working state.

---

## Current State

### Back-end (FastAPI)

- JWT auth is implemented using `OAuth2PasswordBearer`; it expects an `Authorization: Bearer <token>` header.
- Tokens are HS256-signed JWTs with a **30-minute expiry** and a `sub` (user ID) claim.
- `SECRET_KEY` defaults to the hardcoded string `"dev-secret-key-change-in-production"` when the env var is absent.
- Only **two routes** are currently protected with the `get_current_user` dependency:
  - `PUT /api/users/{user_id}`
  - `DELETE /api/auth/delete-account`
- All other mutation routes (create/update/delete events, organizations, registrations) are **unprotected**.
- The login endpoint returns the token only in the **JSON response body** — no cookie is set.
- There is no refresh token, no token revocation, and no revocation blocklist.

### Front-end (Next.js)

- After a successful login, the token returned in the response body is **never stored** — the page simply redirects on `response.ok`.
- No `localStorage`, `sessionStorage`, or cookie write exists anywhere in the auth flow.
- User identity is tracked through a plain, **un-signed `user_id` cookie** that is never actually set by the login flow. Pages that require it (`profile`, event create/edit) will silently receive `null`.
- `useCurrentUserId()` reads `document.cookie` — readable by JavaScript, providing no XSS protection.
- `app/layout.tsx` reads the same `user_id` cookie on the server for SSR role pre-fetching.
- There is **no `middleware.ts`** file, so no server-side route protection exists in Next.js.
- Protected pages have no client-side redirect guard for unauthenticated users.
- The `NavBar` always shows both "Sign In" and "Sign Up" links regardless of auth state.
- The profile `PUT /api/users/{user_id}` call has a TODO comment noting it will always return 401 because no `Authorization` header is sent.
- There is no sign-out flow.

---

## Tasks

### T1 – Store the JWT token as an httpOnly cookie on login (Back-end)

After a successful `/api/auth/login`, set the JWT in an `httpOnly`, `SameSite=Lax`, `Secure` (in production) cookie on the `Set-Cookie` response header instead of (or in addition to) returning it in the JSON body.  
This prevents JavaScript from reading the token directly, closing the primary XSS attack vector.

**Acceptance criteria:**

- `POST /api/auth/login` returns a `Set-Cookie: session=<token>; HttpOnly; SameSite=Lax; Path=/` header.
- The JSON body can be kept for Swagger UI compatibility (`{"access_token": "...", "token_type": "bearer"}`).
- A corresponding `POST /api/auth/logout` endpoint clears the cookie (sets it with `Max-Age=0`).

---

### T2 – Read the session cookie in the FastAPI auth dependency (Back-end)

Update `get_current_user` (and/or create a new `get_current_user_from_cookie` dependency) to accept the JWT from the `session` cookie in addition to the `Authorization` header.

**Acceptance criteria:**

- Routes protected with the dependency accept requests carrying the cookie.
- The `Authorization: Bearer` header path is kept for Swagger UI / API-client use.
- A 401 is returned when neither the cookie nor the header is present.

---

### T3 – Protect all mutation routes on the back-end (Back-end)

Apply the `get_current_user` dependency to all routes that create, update, or delete data:

- `POST /api/events`
- `PUT /api/events/{event_id}`
- `DELETE /api/events/{event_id}`
- `POST /api/organizations`
- `PUT /api/organizations/{organization_id}`
- `DELETE /api/organizations/{organization_id}`
- `POST /api/event-registrations`
- `DELETE /api/event-registrations/{id}`
- `POST /api/users` (registration is public — keep unprotected; review intentionally)

**Acceptance criteria:**

- Each listed route returns `401` when no valid token / cookie is present.
- Existing tests (if any) are updated or new tests added.

---

### T4 – Forward the session cookie with all client API requests (Front-end)

Update every `fetch` call in the Next.js app to include `credentials: "include"` (or `"same-origin"`) so the browser automatically sends the httpOnly `session` cookie to the `/api/...` proxy routes.

Key files to update:

- `client/lib/events.ts`
- `client/lib/organizations.ts`
- `client/lib/roles.ts`
- Any inline `fetch` calls in page components (`profile/page.tsx`, `events/create/page.tsx`, `events/[id]/edit/page.tsx`, etc.)

**Acceptance criteria:**

- No `Authorization` header is manually constructed — the cookie is sent automatically.
- Mutating requests (PUT, POST, DELETE) succeed for authenticated users.

---

### T5 – Create a server-side auth session utility (Front-end)

Add a utility (e.g., `lib/session.ts`) that reads and validates the `session` cookie in Server Components and Route Handlers, returning the current user's ID and claims.

This will replace the unsecured `user_id` plain-text cookie currently read in `app/layout.tsx` and `useCurrentUserId()`.

**Acceptance criteria:**

- `getServerSession()` (or equivalent) reads the `session` cookie from `next/headers` and decodes the JWT.
- Returns `{ userId: number } | null`.
- Used in `app/layout.tsx` to replace the raw `user_id` cookie lookup for SSR role pre-fetching.

---

### T6 – Replace `useCurrentUserId` with a client-side auth context (Front-end)

Create a React context (e.g., `context/AuthContext.tsx`) that holds the current user's ID and exposes it app-wide. Populate it from an `/api/auth/me` endpoint or by decoding a non-httpOnly claim cookie set alongside the httpOnly session cookie.

**Acceptance criteria:**

- `useCurrentUserId()` is replaced or implemented using the new context.
- Components that currently read `document.cookie` directly for user identity no longer do so.
- The auth context is `null` / unauthenticated when no session exists.

---

### T7 – Add a Next.js `middleware.ts` for route protection (Front-end)

Create `client/middleware.ts` to protect routes that require authentication. Unauthenticated requests to protected paths should be redirected to `/signin`.

Routes to protect (at minimum):

- `/profile`
- `/profile/history`
- `/events/create`
- `/events/[id]/edit`
- `/organizations/create`

**Acceptance criteria:**

- Visiting a protected route without a valid session redirects to `/signin`.
- The original destination URL is preserved as a query param (e.g., `/signin?next=/profile`) and the user is redirected there after login.
- Public routes (home, events list, sign-in, sign-up) remain accessible without a session.

---

### T8 – Implement sign-out (Front-end + Back-end)

Add a "Sign Out" button to the `NavBar` that calls `POST /api/auth/logout` (from T1), clears any client-side state, and redirects to `/signin`.

**Acceptance criteria:**

- Clicking "Sign Out" sends a request that clears the session cookie.
- The user is redirected to `/signin`.
- The auth context (T6) is reset to unauthenticated.

---

### T9 – Conditionally render auth links in NavBar (Front-end)

Update `NavBar` to show "Sign In" / "Sign Up" when the user is unauthenticated, and "Profile" / "Sign Out" when authenticated.

**Acceptance criteria:**

- Authenticated users do not see "Sign In" or "Sign Up" links.
- Unauthenticated users do not see "Profile" or "Sign Out" links.
- Uses the auth context from T6.

---

### T10 – Remove the plain `user_id` cookie references (Front-end, depends on T5 & T6)

Once T5 and T6 are complete, remove all references to the plain `user_id` cookie:

- `client/lib/useCurrentUserId.ts` – delete or rewrite using auth context.
- `client/app/layout.tsx` – replace `cookieStore.get("user_id")` with `getServerSession()`.
- Any TODO comments referencing the `user_id` cookie.

**Acceptance criteria:**

- No code reads `document.cookie` or `cookieStore.get("user_id")` for user identity.
- The plain `user_id` cookie is no longer used or documented.

---

### T11 – Secure `SECRET_KEY` configuration (Back-end)

Ensure the JWT signing secret is never a hardcoded fallback in production. Add a startup validation that refuses to start if `SECRET_KEY` is not set (or equals the dev default) when `ENV !== "development"`.

**Acceptance criteria:**

- `api/.env.example` documents the required `SECRET_KEY` env var.
- On startup in a non-development environment, the app raises a clear error if `SECRET_KEY` is absent or set to the default.
- `docs/CONTRIBUTING.md` is updated with instructions for setting up `.env`.

---

### T12 – Add a `GET /api/auth/me` endpoint (Back-end)

Add a protected `GET /api/auth/me` endpoint that returns the current user's profile (user ID, email, first name, last name) based on the session token.

This gives the client a reliable way to verify authentication status and hydrate the auth context (T6) on page load.

**Acceptance criteria:**

- `GET /api/auth/me` returns `200` with user info when a valid session cookie or Bearer token is present.
- Returns `401` when unauthenticated.
