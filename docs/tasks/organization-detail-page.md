# Task: Organization Detail Page (`/organizations/[id]`)

**Priority:** Medium  
**Effort:** Medium

---

## Overview

The organization detail page (`client/app/organizations/[id]/page.tsx`) is a stub rendering `<div>IndividualOrganizationPage</div>`. This page is the entry point for learning about a nonprofit and seeing its events and members.

A critical backend gap exists: **`GET /organization/{id}` does not exist**. This is the only blocking backend change before the page can be built.

---

## Backend Changes

### Required — Add `GET /organization/{id}`

Add a new route to `api/routes/organization.py`. The SQL is already written verbatim inside the `DELETE` and `PUT` handlers, making this a straightforward addition:

```python
@router.get("/{organization_id}", response_model=Organization)
def get_organization(
    organization_id: int,
    conn: sqlite3.Connection = Depends(get_connection),
):
    row = conn.execute(
        """
        SELECT organization_id, name, description, created_by_user_id
        FROM organizations
        WHERE organization_id = ?
        """,
        (organization_id,),
    ).fetchone()
    if row is None:
        raise HTTPException(status_code=404, detail="Organization not found")
    return Organization(
        organization_id=row["organization_id"],
        name=row["name"],
        description=row["description"],
        created_by_user_id=row["created_by_user_id"],
    )
```

> **Important:** This route must be defined **before** the `DELETE /{organization_id}` and `PUT /{organization_id}` routes to avoid FastAPI path ambiguity, and before the `router.include_router(organization_roles_router, ...)` call.

### Nice-to-have

- Add pagination and role filtering to `GET /organization/{id}/users` (currently no pagination — a `TODO` in the route).

---

## Frontend Changes

### File to implement

- `client/app/organizations/[id]/page.tsx` — currently a stub

### New TypeScript model

Add a `RoleAndUser` interface to `client/models/organizations.ts`:

```typescript
export interface RoleAndUser {
  user_id: number;
  organization_id: number;
  name: string; // "First Last"
  permission_level: "admin" | "volunteer";
}
```

### Data fetching (parallelizable)

All three fetches can be run in parallel via `Promise.all`:

1. `GET /api/organization/{id}` → org name, description, `created_by_user_id`
2. `GET /api/organization/{id}/users` → member list with roles
3. `GET /api/events?organization_id={id}` → events for this org

### UI sections to build

| Section             | Notes                                                                                        |
| ------------------- | -------------------------------------------------------------------------------------------- |
| Org header          | Name (`h1`), description, "Edit" button (condition on admin role — can hardcode for now)     |
| Members section     | List / table of `RoleAndUser` with `Badge` for `admin` vs `volunteer`                        |
| Events section      | Reuse `EventCarousel` component or render a simple `Card` list                               |
| Join / Leave button | Calls `POST /api/organization/{id}/users` or `DELETE /api/organization/{id}/users/{user_id}` |
| Loading state       | Skeleton while all three fetches complete                                                    |

Since no auth context exists yet, the "Edit" and "Join / Leave" CTA can initially be shown without permission gating, consistent with the rest of the app.

---

## shadcn/ui Components

### Already installed (no action needed)

| Component   | Usage                            |
| ----------- | -------------------------------- |
| `card`      | Org header, event list           |
| `badge`     | `admin` / `volunteer` role badge |
| `button`    | Edit, Join / Leave               |
| `separator` | Section dividers                 |

### New components to add

| Component  | Why                                               | Install command                  |
| ---------- | ------------------------------------------------- | -------------------------------- |
| `tabs`     | Separate Info / Members / Events sections cleanly | `npx shadcn@latest add tabs`     |
| `skeleton` | Loading state while data fetches                  | `npx shadcn@latest add skeleton` |
| `table`    | Members list in tabular layout                    | `npx shadcn@latest add table`    |
| `avatar`   | Member initials icon in the member list           | `npx shadcn@latest add avatar`   |

`tabs` and `skeleton` add the most UX value. `table` and `avatar` are style improvements.

---

## Follow-up Tasks

| Priority    | Task                                                                                  |
| ----------- | ------------------------------------------------------------------------------------- |
| **Blocker** | Add `GET /organization/{id}` to the backend                                           |
| High        | Implement `client/app/organizations/[id]/page.tsx`                                    |
| High        | Add `RoleAndUser` interface to `client/models/organizations.ts`                       |
| Medium      | Install `tabs`, `skeleton` shadcn components                                          |
| Medium      | Add pagination to `GET /organization/{id}/users` (backend)                            |
| Low         | Auth context — gate "Edit" button to org admins, "Join" to non-members                |
| Low         | Implement `/organizations/[id]/edit` (separate task, see `org-create-edit-manage.md`) |
| Low         | Implement `/organizations/[id]/users` management page (separate task)                 |

---

## Dependencies

- **Hard dependency:** `GET /organization/{id}` must be added to the backend before the page can load org details.
- The organizations list page (`/organizations`) should exist as the navigation source to this page.
- `EventCarousel` (already built) can be reused for the events section.
- Auth context is needed for proper permission gating but is not blocking initial implementation.
