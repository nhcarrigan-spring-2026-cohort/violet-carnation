# PR #183 – Unresolved Copilot Review Feedback

> Source: [PR #183 review](https://github.com/nhcarrigan-spring-2026-cohort/violet-carnation/pull/183)  
> Date captured: 2026-02-23

The items below are all threads marked **unresolved** in the Copilot code-review of PR #183 (auth finalization). Resolved / outdated-and-resolved threads are excluded.

---

## Backend – `api/routes/events.py`

### 1. No authorization on `POST /api/events` (line 247)

Mutation endpoints are now authenticated but still have **no authorization checks** and `_current_user` is unused. Any logged-in user can create events for any `organization_id`.  
**Fix needed:** Check org-level permissions (e.g., only org admins) using `_current_user` and the target `organization_id`.

### 2. No authorization on `PUT /api/events/{event_id}` (line 285)

`_current_user` is unused and there is no authorization check on updating events. Any authenticated user can update any event.  
**Fix needed:** Enforce authorization (e.g., only admins for the event's organization).

### 3. No authorization on `DELETE /api/events/{event_id}` (line 362)

Same as above – `_current_user` is unused and deletion has no ownership/role check.  
**Fix needed:** Enforce authorization (e.g., only admins for the event's organization).

---

## Backend – `api/routes/organization.py`

### 4. Creator user id trusted from client payload (line 65)

`_current_user` is injected but not used; the endpoint trusts `payload.user_id`. Any authenticated user can create an organization on behalf of another user or assign admin to someone else.  
**Fix needed:** Derive the creator `user_id` from `_current_user`; stop accepting `user_id` from the client for this operation.

---

## Backend – `api/routes/event_registrations.py`

### 5. Registration creation trusts client `user_id` (line 170)

Auth is required but the handler trusts `payload.user_id` and ignores `_current_user`. Any authenticated user can create registrations for any `user_id`.  
**Fix needed:** Use `_current_user["user_id"]` as the registration user id (and reject payloads that try to register someone else).

### 6. Registration deletion keyed off URL `user_id` (line 211)

Deletion is keyed off the `user_id` path parameter, not the session. Any authenticated user can delete another user's registration.  
**Fix needed:** Require that `user_id` matches `_current_user["user_id"]`, or drop the path param and derive it from auth.

---

## Client – `client/lib/session.ts`

### 7. Missing base64url padding before decoding (line 33)

`Buffer.from(..., "base64")` can fail for valid JWTs whose payload segment length is not a multiple of 4 because base64url omits padding. This causes intermittent `null` returns from `getServerSession()`.  
**Fix needed:** Add `=` padding before decoding (e.g., `segment.padEnd(Math.ceil(segment.length / 4) * 4, "=")`).

### 8. Unit tests missing for `getServerSession()` (line 23)

The function is security-adjacent, handles JWT parsing, and is easy to regress. The repo already uses Jest for `client/lib` utilities.  
**Fix needed:** Add unit tests covering valid JWTs, base64url padding edge cases, and malformed tokens.

---

## Client – `client/app/(auth)/signin/page.tsx`

### 9. Open-redirect via `?next` query param (line 27)

`next` is taken directly from the query string and used in `router.push(next)`. An attacker can craft `?next=https://evil.example` to redirect users off-site.  
**Fix needed:** Validate that `next` is a safe relative path (starts with `/`, no protocol/host) and fall back to `/` otherwise.

---

## Client – `client/middleware.ts`

### 10. `next` param drops query string and hash (line 53)

The middleware only stores `pathname` in the `next` redirect param, so deep-linked pages with query params lose that context after sign-in.  
**Fix needed:** Use the full requested path (`pathname + search`) so users return to the exact intended destination.

---

## Client – `client/app/events/[id]/page.tsx`

### 11. `userId ?? 1` fallback re-introduces spoofing vector (line 76)

Falling back to `1` when `userId` is null means the UI will attempt to register/unregister as user 1. Even if the API rejects it, the behavior is confusing.  
**Fix needed:** Require authentication before allowing register/unregister; redirect to `/signin` when `userId` is null instead of falling back.

---

## Client – `client/app/organizations/create/page.tsx`

### 12. `currentUserId ?? 1` fallback (line 34)

When auth state hasn't loaded or the user is signed out, privileged actions are attempted as user 1.  
**Fix needed:** Block submission until `currentUserId` is known; avoid sending any client-supplied user id since the server now identifies users via session.

---

## Client – `client/app/organizations/[id]/edit/page.tsx`

### 13. `currentUserId ?? 1` fallback (line 75)

Same pattern as above – org edit is attempted as user 1 when auth is missing.  
**Fix needed:** Block the action until the authenticated user is known; stop sending user id from the client.

---

## Client – `client/app/organizations/[id]/users/page.tsx`

### 14. Spoofable `user_id` in role-change request (line 126)

The role-change request uses `currentUserId ?? 1` and sends `user_id` in the body. With cookie-based auth the acting user id should come from the session.  
**Fix needed:** Remove the fallback; prevent sending a spoofable acting `user_id` field.

### 15. Spoofable `user_id` as query param (line 145)

Same file: the role removal request passes `user_id` as a query param with a `currentUserId ?? 1` fallback.  
**Fix needed:** Remove the client-supplied `user_id`; the server should derive it from the session.

---

## Client – `client/app/layout.tsx`

### 16. Roles fetched from unverified JWT payload (line 37)

`getServerSession()` only base64-decodes the JWT payload without verifying the signature. If the cookie is tampered or expired, roles may be fetched for the wrong user.  
**Fix needed:** Either verify the JWT signature server-side (the Next server has access to the secret via env) **or** fetch roles via an authenticated API endpoint that derives the user id from the validated session (i.e., rely on the API to enforce auth instead of trusting the decoded payload directly).

---

## Summary Table

| #   | File                                               | Issue                                        | Priority |
| --- | -------------------------------------------------- | -------------------------------------------- | -------- |
| 1   | `api/routes/events.py:247`                         | No authz on create event                     | High     |
| 2   | `api/routes/events.py:285`                         | No authz on update event                     | High     |
| 3   | `api/routes/events.py:362`                         | No authz on delete event                     | High     |
| 4   | `api/routes/organization.py:65`                    | Org creator derived from payload not session | High     |
| 5   | `api/routes/event_registrations.py:170`            | Registration trusts client user_id           | High     |
| 6   | `api/routes/event_registrations.py:211`            | Deletion keyed off URL user_id               | High     |
| 7   | `client/lib/session.ts:33`                         | Missing base64url padding                    | Medium   |
| 8   | `client/lib/session.ts:23`                         | No unit tests for getServerSession           | Medium   |
| 9   | `client/app/(auth)/signin/page.tsx:27`             | Open-redirect via ?next                      | High     |
| 10  | `client/middleware.ts:53`                          | next param drops query string                | Low      |
| 11  | `client/app/events/[id]/page.tsx:76`               | userId ?? 1 fallback                         | High     |
| 12  | `client/app/organizations/create/page.tsx:34`      | currentUserId ?? 1 fallback                  | High     |
| 13  | `client/app/organizations/[id]/edit/page.tsx:75`   | currentUserId ?? 1 fallback                  | High     |
| 14  | `client/app/organizations/[id]/users/page.tsx:126` | Spoofable user_id in role change             | High     |
| 15  | `client/app/organizations/[id]/users/page.tsx:145` | Spoofable user_id as query param             | High     |
| 16  | `client/app/layout.tsx:37`                         | Roles from unverified JWT                    | Medium   |
