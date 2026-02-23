# Task: Organizations List Page (`/organizations`)

**Priority:** Medium  
**Effort:** Small

---

## Overview

The organizations list page (`client/app/organizations/page.tsx`) is a stub rendering `<div>OrganizationsPage</div>`. Volunteers need to discover nonprofit organizations. The `GET /organization` API endpoint is fully functional and supports pagination and search — this is purely a frontend build-out with no backend changes required.

---

## Backend Changes

**None required for the list page.** The existing `GET /organization` endpoint handles pagination (`skip`, `limit`) and text search (`query`) already.

### Related backend work (separate tasks)

- **Add `GET /organization/{id}`** — needed for the individual org detail page and edit page, but not this list page.
- Replace hardcoded `user_id` params with auth middleware on mutation endpoints — systemic TODO, not specific to the list.

---

## Frontend Changes

### File to implement

- `client/app/organizations/page.tsx` — currently a stub

### Pattern to follow

The events list page (`client/app/events/page.tsx`) is the closest existing reference — it uses `useState`, `useEffect`, and fetch with query params to load and display a list with a NavBar.

### Data fetching

- Fetch `GET /api/organization?skip=0&limit=10` on mount.
- Support the `query` param for search: fetch `GET /api/organization?query={searchTerm}&skip=0&limit=10` on input change.
- Handle loading and empty states.

### UI sections to build

| Section                | Notes                                                                                   |
| ---------------------- | --------------------------------------------------------------------------------------- |
| Page header            | "Organizations" heading                                                                 |
| Search input           | Text field wired to `query` param — debounce or submit-triggered                        |
| Organization cards     | `Card` with org name, truncated description, link to `/organizations/{organization_id}` |
| Empty state            | "No organizations found" when list is empty                                             |
| Load More / Pagination | Increment `skip` by `limit` to load the next page                                       |

**Suggested component structure:**

```tsx
<NavBar />
<main>
  <h1>Organizations</h1>
  <Input placeholder="Search..." />
  <div className="grid ...">
    {organizations.map(org => (
      <Link href={`/organizations/${org.organization_id}`}>
        <Card> name + description </Card>
      </Link>
    ))}
  </div>
  <Button onClick={loadMore}>Load More</Button>
</main>
```

An `OrganizationCard` component extracted to `client/components/` would be a clean pattern, similar to how `EventCarousel` handles event cards.

---

## shadcn/ui Components

### Already installed (no action needed)

| Component   | Usage                       |
| ----------- | --------------------------- |
| `card`      | Organization cards          |
| `input`     | Search box                  |
| `button`    | "Load More" / pagination    |
| `badge`     | Optional org attribute tags |
| `separator` | Optional section dividers   |

### New components to add

| Component    | Why                                                        | Install command                    |
| ------------ | ---------------------------------------------------------- | ---------------------------------- |
| `skeleton`   | Loading placeholder cards while fetching                   | `npx shadcn@latest add skeleton`   |
| `pagination` | Alternative to "Load More" if page navigation is preferred | `npx shadcn@latest add pagination` |

`skeleton` is the highest-value addition for perceived performance. `pagination` is optional if "Load More" is preferred.

---

## Follow-up Tasks

| Priority | Task                                                                            |
| -------- | ------------------------------------------------------------------------------- |
| High     | Implement `client/app/organizations/page.tsx`                                   |
| High     | Add `GET /organization/{id}` to the backend (required for the detail page)      |
| High     | Implement `/organizations/[id]/page.tsx` detail page                            |
| Medium   | Add `skeleton` component for loading states                                     |
| Medium   | Extract `OrganizationCard` component to `client/components/`                    |
| Low      | Add a "Create Organization" button/link visible to authenticated users          |
| Low      | Add `pagination` component if page-based navigation is preferred over Load More |

---

## Dependencies

- No hard blockers — this is a simple list page and the API is ready.
- The organization detail page (`/organizations/[id]`) is the natural navigation target from each card; it should be built alongside or immediately after this page.
