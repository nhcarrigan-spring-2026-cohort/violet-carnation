# Task: Organization Create / Edit / Manage Pages

**Priority:** Medium  
**Effort:** Medium–Large

---

## Overview

Three organization management pages are stubs:

- `client/app/organizations/create/page.tsx` — `<div>CreateOrganization</div>`
- `client/app/organizations/[id]/edit/page.tsx` — `<div>EditOrganizationPage</div>`
- `client/app/organizations/[id]/users/page.tsx` — `<div>OrganizationUsersPage</div>`

The organization CRUD endpoints (`POST`, `PUT`) and user management endpoints (`GET/POST/PUT/DELETE /organization/{id}/users`) already exist. The single required backend change is adding the missing `GET /organization/{id}` endpoint (needed by the edit page).

---

## Backend Changes

### Required — Add `GET /organization/{id}`

The edit page cannot pre-populate its form without this endpoint. The `PUT` and `DELETE` handlers already query this exact row — add a dedicated `GET` route in `api/routes/organization.py`:

```python
@router.get("/{organization_id}", response_model=Organization)
def get_organization(
    organization_id: int,
    conn: sqlite3.Connection = Depends(get_connection),
):
    row = conn.execute(
        "SELECT organization_id, name, description, created_by_user_id FROM organizations WHERE organization_id = ?",
        (organization_id,),
    ).fetchone()
    if row is None:
        raise HTTPException(status_code=404, detail="Organization not found")
    return Organization(**dict(row))
```

> This route must be defined **before** the `DELETE /{organization_id}` and `PUT /{organization_id}` routes, and before the nested `router.include_router(organization_roles_router, ...)` call.

### Nice-to-have (not blocking)

- Protect `POST/DELETE/PUT /organization/{id}/users` routes with admin role checks (currently unprotected, tracked as a systemic TODO).
- Add pagination to `GET /organization/{id}/users`.

---

## Frontend Changes

### Shared utility needed

All three pages need the current user's `user_id` to send with mutation requests (currently `user_id` is passed as a cookie-derived value, same as `client/app/layout.tsx`). Create a small `useCurrentUserId()` hook reading the `user_id` cookie to avoid repeating the parse logic.

### `/organizations/create`

| Element             | Notes                                                          |
| ------------------- | -------------------------------------------------------------- |
| `name` field        | `<Input>` — required                                           |
| `description` field | `<Textarea>` — optional — **not yet installed**                |
| Submit              | `POST /api/organization` with `{ name, description, user_id }` |
| On success          | Redirect to `/organizations/{id}`                              |
| Permission          | Any logged-in user (non-null `user_id` cookie)                 |

### `/organizations/[id]/edit`

| Element                       | Notes                                                                                                |
| ----------------------------- | ---------------------------------------------------------------------------------------------------- |
| Pre-fetch                     | `GET /api/organization/{id}` to populate initial form values                                         |
| `name` + `description` fields | Same as create                                                                                       |
| Submit                        | `PUT /api/organization/{id}` with `{ name, description, user_id }`                                   |
| On success                    | Redirect to `/organizations/{id}`                                                                    |
| Permission gate               | Check `roles.some(r => r.organization_id === id && r.permission_level === "admin")` via `useRoles()` |

### `/organizations/[id]/users`

| Element         | Notes                                                                                                              |
| --------------- | ------------------------------------------------------------------------------------------------------------------ |
| Member list     | `GET /api/organization/{id}/users` → table/list of `RoleAndUser`                                                   |
| Role badge      | `<Badge>` for `admin` vs `volunteer` per member                                                                    |
| Add user form   | `user_id` number input + permission level `<Select>` → `POST /api/organization/{id}/users`                         |
| Change role     | per-row `<DropdownMenu>` or `<Select>` → `PUT /api/organization/{id}/users/{user_id}`                              |
| Remove user     | per-row Delete button with confirmation → `DELETE /api/organization/{id}/users/{user_id}` (behind `<AlertDialog>`) |
| Permission gate | Only admins see add/remove/update-role controls; non-admins see read-only list                                     |

The `RoleAndUser` interface needs to be added to `client/models/organizations.ts`:

```typescript
export interface RoleAndUser {
  user_id: number;
  organization_id: number;
  name: string;
  permission_level: "admin" | "volunteer";
}
```

---

## shadcn/ui Components

### Already installed (no action needed)

| Component       | Usage                         |
| --------------- | ----------------------------- |
| `badge`         | Admin / volunteer role labels |
| `button`        | Submit, add user, remove      |
| `card`          | Form containers               |
| `input`         | Name, user ID fields          |
| `label`         | Form labels                   |
| `dropdown-menu` | Role change per row           |
| `separator`     | Section dividers              |

### New components to install

| Component      | Why                                                                              | Install command                      |
| -------------- | -------------------------------------------------------------------------------- | ------------------------------------ |
| `textarea`     | Description field on create/edit forms                                           | `npx shadcn@latest add textarea`     |
| `select`       | Permission level picker when adding/editing a member's role                      | `npx shadcn@latest add select`       |
| `table`        | Member list on the manage-users page                                             | `npx shadcn@latest add table`        |
| `dialog`       | Add-user form modal; `@radix-ui/react-dialog` peer dep already in `package.json` | `npx shadcn@latest add dialog`       |
| `alert-dialog` | Confirm remove-user / delete-org destructive actions                             | `npx shadcn@latest add alert-dialog` |
| `sonner`       | Success / error feedback after mutations                                         | `npx shadcn@latest add sonner`       |

---

## Follow-up Tasks

| Priority    | Task                                                                                            |
| ----------- | ----------------------------------------------------------------------------------------------- |
| **Blocker** | Add `GET /organization/{id}` to the backend                                                     |
| High        | Add `RoleAndUser` interface to `client/models/organizations.ts`                                 |
| High        | Install `textarea`, `select`, `table`, `dialog`, `alert-dialog`, `sonner` shadcn components     |
| High        | Create `useCurrentUserId()` hook                                                                |
| High        | Build `/organizations/create` (simplest, good starting point)                                   |
| High        | Build `/organizations/[id]/edit` (depends on GET single org)                                    |
| High        | Build `/organizations/[id]/users` (most complex)                                                |
| Medium      | Build `/organizations/page.tsx` and `/organizations/[id]/page.tsx` (stubs — navigation targets) |
| Low         | Protect user-management routes with admin role checks (backend)                                 |
| Low         | Replace `user_id` cookie pattern with proper auth token across all org mutations                |

---

## Dependencies

- **`GET /organization/{id}` must be added to the backend** before the edit page can be started.
- `textarea`, `select`, `table`, `dialog`, `alert-dialog` must be installed before the full UI can be completed.
- `RolesContext` is already in place for permission gating — it requires the current `user_id`, which is hardcoded to `1` until auth context is resolved.
- The organization detail page (`/organizations/[id]`) should exist as the redirect target after create/edit succeeds.
