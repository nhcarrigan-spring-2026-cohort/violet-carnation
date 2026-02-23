# Task: Profile Page (`/profile`)

**Priority:** High  
**Effort:** Medium

---

## Overview

The profile page (`client/app/profile/page.tsx`) is a stub that renders `<div>ProfilePage</div>`. Users need to view and update their own information (name, availability). The API endpoints for fetching and updating users already exist.

---

## Backend Changes

### Required

- **Add auth guard to `PUT /users/{user_id}`** in `api/routes/users.py`. Currently any caller can overwrite any user's profile. Add `current_user = Depends(get_current_user)` and verify `current_user["user_id"] == user_id`. The `get_current_user` dependency already exists in `api/utils/auth.py`.

### Optional

- Add a `GET /users/me` convenience endpoint that returns the current user derived from their JWT — avoids requiring the frontend to know its own `user_id` to fetch its own profile.

### Type mismatch to resolve (blocker)

The `availability` field is mismatched between frontend and backend:

- **Backend** (`api/models/user.py`): single `Literal["Full-time", "Part-time", "Weekends", "Evenings"]`
- **Frontend** (`client/models/user.ts`): array `Availability[]` with values `"Mornings" | "Afternoons" | "Evenings" | "Weekends" | "Flexible"`

These need to be reconciled before the profile form can correctly read or write availability. This requires a team decision on canonical values, followed by either a BE model/DB update or FE model update.

---

## Frontend Changes

### Files to implement

- `client/app/profile/page.tsx` — currently a stub

### Blocker: Auth context

There is no `AuthContext` or `useAuth()` hook in the codebase. The profile page cannot know which user is logged in without one. Either:

- Follow the existing temporary pattern: read `user_id` from the cookie (same as `client/app/layout.tsx`) with a `// TODO` comment.
- Or implement a proper auth context (tracked as a separate, higher-priority task).

### Data fetching

- `GET /api/users/{user_id}` on mount to load current profile data.
- `PUT /api/users/{user_id}` on form submit to save changes.

### UI sections to build

| Section                  | Notes                                                                                                     |
| ------------------------ | --------------------------------------------------------------------------------------------------------- |
| Email display            | Read-only — not editable per the API                                                                      |
| First name field         | `<Input>` — editable                                                                                      |
| Last name field          | `<Input>` — editable                                                                                      |
| Availability picker      | `<RadioGroup>` for single-select — already installed; align values with whichever canonical set is chosen |
| Save button              | With loading state during submit                                                                          |
| Success / error feedback | Toast or inline message                                                                                   |

### NavBar update

`client/components/NavBar.tsx` currently has only a `ModeToggle`. A profile link should be added once auth context is in place so users can navigate to `/profile`.

---

## shadcn/ui Components

### Already installed (no action needed)

| Component     | Usage                               |
| ------------- | ----------------------------------- |
| `button`      | Submit button                       |
| `card`        | Page layout container               |
| `input`       | First name / last name fields       |
| `label`       | Form labels                         |
| `radio-group` | Availability picker (single-select) |
| `separator`   | Section dividers                    |
| `badge`       | Display current availability        |

### New components to add

| Component | Why                                   | Install command                |
| --------- | ------------------------------------- | ------------------------------ |
| `sonner`  | Success/error feedback after save     | `npx shadcn@latest add sonner` |
| `avatar`  | Profile picture placeholder in header | `npx shadcn@latest add avatar` |

No form library is currently installed. Follow the existing pattern of native HTML form handling (see the sign-in page) unless `react-hook-form` is added as a separate decision.

---

## Follow-up Tasks

| Priority | Task                                                               |
| -------- | ------------------------------------------------------------------ |
| Blocker  | Resolve `availability` type mismatch between FE and BE             |
| Blocker  | Determine how to get current `user_id` on the profile page         |
| High     | Add auth guard to `PUT /users/{user_id}` on the backend            |
| High     | Implement profile form UI in `client/app/profile/page.tsx`         |
| High     | Add profile link to `NavBar`                                       |
| Medium   | Implement `EventHistoryPage` at `/profile/history` (separate task) |
| Low      | Add `sonner` toast for save feedback                               |

---

## Dependencies

- Requires the `availability` type mismatch to be resolved first (or at the same time).
- Requires a way to identify the current user — either via auth context or the temporary cookie-read pattern.
- Auth guard on `PUT /users/{user_id}` should be added before this goes to production but is not strictly blocking for development.
