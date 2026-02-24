# PR #183 Feedback – feat(146): authorization finalization

**PR:** [#183](https://github.com/nhcarrigan-spring-2026-cohort/violet-carnation/pull/183)  
**Author:** bradtaniguchi  
**Status:** Draft (converted pending fixes)  
**Reviewed by:** GitHub Copilot (automated, two passes)

---

## General Comments

### bradtaniguchi (2026-02-23)

> This irons out a few of the general issues, but also makes a few changes and creates its own issues like:
>
> - All the GET endpoints are public, which is fine for now.
> - Some of the "non-GET" endpoints should not be shown if the user is not logged in.
> - The dashboard could be improved/different depending on whether you are logged in or not.

---

> Converting to draft until Copilot fixes issues found with Copilot's review.

---

## Open Review Comments (Copilot – 2026-02-24)

#### `client/app/events/[id]/page.tsx` line 76 – `userId ?? 1` fallback

`userId ?? 1` will register/unregister the hardcoded user 1 when the auth context hasn't loaded yet (or when unauthenticated). Block these actions until a real user ID is available (or redirect to `/signin`) instead of falling back.

---

#### `client/app/organizations/create/page.tsx` line 27 – `currentUserId ?? 1` fallback

Using `currentUserId ?? 1` can create organizations on behalf of the wrong user if the auth context is still loading. Remove the hardcoded fallback and/or derive the acting user server-side from the session cookie.

---

#### `client/app/organizations/[id]/page.tsx` line 77 – Missing `user_id` in join request body

This request body no longer includes `user_id`, but the current API handler for `POST /organization/{organization_id}/users` requires it (`RoleCreate`). As-is, this call will likely fail validation (422) unless the API is updated to derive the user from the session.

---

#### `client/app/organizations/[id]/edit/page.tsx` line 71 – `currentUserId ?? 1` fallback

`currentUserId ?? 1` can cause updates to be attributed/authorized incorrectly while auth is still loading. Avoid the hardcoded fallback; disable submit until the user ID is known, or have the API derive the acting user from the session cookie.

---

#### `client/app/(auth)/signin/page.tsx` line 28 – Open redirect risk

`next` from the query string is used directly in `router.push(next)`, which can enable open-redirects if a user supplies an absolute URL. Validate that `next` is a safe internal path (e.g. starts with `/` and not `//`) before navigating, otherwise fall back to `/`.

---

#### `client/lib/useCurrentUserId.ts` line 13 – Ambiguous null return

This hook returns `null` both while the auth check is still loading and when the user is truly unauthenticated. That makes it easy for callers to treat an authenticated-but-loading state as logged-out (causing UI flashes / wrong redirects). Consider returning a tri-state (e.g. `number | null | undefined`) or exposing `loading` alongside the ID.

---

#### `client/app/organizations/[id]/users/page.tsx` line 122 – `currentUserId ?? 1` fallback on role change

Hardcoding `currentUserId ?? 1` means role changes can be attempted/executed as user 1 during auth-context loading. Remove the fallback and block these actions until the current user is loaded (or derive acting user on the API side).

---

#### `api/routes/organization.py` line 66 – Trusted client-supplied `user_id`

The route is now protected by auth, but it still trusts `payload.user_id` (client-controlled). An authenticated user can impersonate another user by sending a different `user_id`. Use `_current_user["user_id"]` as the creator/admin subject and ignore/remove `user_id` from the request body.

---

## Suppressed Comments (low confidence – Copilot 2026-02-24)

- **`api/routes/event_registrations.py:210`** – Delete route removes registration for the path `user_id` without ensuring it matches the authenticated user. Enforce `user_id == _current_user["user_id"]` or derive it from the session.
- **`api/routes/organization.py:171`** – Authorization still relies on `user_id` request parameter, which can be forged. Use `_current_user["user_id"]` for the creator check.
- **`api/routes/organization.py:224`** – Admin checks performed against `payload.user_id`, which is client-controlled. Use `_current_user["user_id"]` as the acting user.

---

## Summary of Open Themes

| Theme                                                                                             |
| ------------------------------------------------------------------------------------------------- |
| `currentUserId ?? 1` fallback causes actions as wrong user (events, orgs, edit, role changes)     |
| `_current_user` injected but unused; `payload.user_id` still trusted on org creation              |
| Open redirect via `?next=` query param on signin page                                             |
| `useCurrentUserId` null ambiguity (loading vs unauthenticated)                                    |
| Join-org request body missing `user_id`; API will return 422 until server derives it from session |
