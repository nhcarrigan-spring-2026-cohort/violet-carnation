# Task: Event Create / Edit Pages (`/events/create` and `/events/[id]/edit`)

**Priority:** Medium  
**Effort:** Medium

---

## Overview

Both pages are stubs:

- `client/app/events/create/page.tsx` renders `<div>CreateEvent</div>`
- `client/app/events/[id]/edit/page.tsx` renders `<div>EditEvent</div>`

The backend API endpoints for event creation (`POST /events`) and update (`PUT /events/{id}`) are fully implemented. This task is primarily a frontend build-out, with minor backend polish and a few missing shadcn components to install.

---

## Backend Changes

### Minor fixes (not blocking)

- `PUT /events/{id}` has `response_model=None` — set it to `response_model=Event` for proper OpenAPI docs. The logic is correct, just missing the annotation.
- `GET /organization` defaults to `limit=10`. To populate an org dropdown on the create form, pass `limit=100` as a short-term workaround, or add proper pagination on the frontend.

### Not required

No new endpoints are needed. All CRUD is already implemented. Auth enforcement (confirming the caller is an org admin) is a systemic TODO across all event routes and is tracked separately.

---

## Frontend Changes

### New TypeScript types in `client/models/event.ts`

```typescript
export interface EventIn {
  name: string;
  description: string;
  location: string;
  date_time: string; // ISO 8601 e.g. "2026-03-15T14:00:00"
  organization_id: number;
}

export type EventUpdate = Partial<EventIn>;
```

### New fetch helpers in `client/lib/`

- `client/lib/events.ts` — `createEvent(payload: EventIn)`, `updateEvent(id: number, payload: EventUpdate)`, `getEventById(id: number)` — keeps page components clean.
- `client/lib/organizations.ts` — `getOrganizations(limit?: number)` — used to populate the org dropdown on the create form.

### `/events/create` page

| Field             | Component                                     | Notes                                                                                                                   |
| ----------------- | --------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------- |
| `name`            | `<Input>`                                     | Required                                                                                                                |
| `description`     | `<Textarea>`                                  | Required — **not yet installed**                                                                                        |
| `location`        | `<Input>`                                     | Required                                                                                                                |
| `date_time`       | `<input type="date">` + `<input type="time">` | Combine into ISO 8601 string before submit. A shadcn `Calendar` + `Popover` is optional for a polished picker.          |
| `organization_id` | `<Select>` dropdown                           | **Not yet installed** — populated from `GET /organization?limit=100` filtered to orgs where the current user is `admin` |

On success: redirect to `/events/{id}` for the newly created event.

### `/events/[id]/edit` page

- On mount, `useEffect` to call `GET /api/events/{id}` and pre-fill form state.
- Same form fields as create.
- Submit calls `PUT /api/events/{id}` with the updated payload.
- On success: redirect back to `/events/{id}`.

### Permission gating

The `RolesContext` (`client/context/RolesContext.tsx`) holds `roles: Role[]`:

- **Create page:** filter `roles` to `permission_level === "admin"`. If empty, redirect or show a "you must be an org admin" message. Populate the org dropdown with only admin orgs.
- **Edit page:** after fetching the event, check `roles.some(r => r.organization_id === event.organization_id && r.permission_level === "admin")`. Redirect or show 403 if false.

> `RolesContext` currently requires `user_id` passed manually (the events list page hardcodes `user_id=1`). Follow the same pattern with a `// TODO` comment.

---

## shadcn/ui Components

### Already installed (no action needed)

| Component   | Usage                 |
| ----------- | --------------------- |
| `button`    | Submit, cancel        |
| `card`      | Form layout container |
| `input`     | Name, location fields |
| `label`     | Form labels           |
| `separator` | Section dividers      |

### New components to install

| Component              | Why                                              | Install command                          |
| ---------------------- | ------------------------------------------------ | ---------------------------------------- |
| `textarea`             | Description field                                | `npx shadcn@latest add textarea`         |
| `select`               | Organization dropdown                            | `npx shadcn@latest add select`           |
| `sonner`               | Success / error toast after submit               | `npx shadcn@latest add sonner`           |
| `calendar` + `popover` | Polished date-time picker (optional)             | `npx shadcn@latest add calendar popover` |
| `form`                 | react-hook-form wrappers + validation (optional) | `npx shadcn@latest add form`             |

**Minimum viable install:** `textarea` + `select` + `sonner`. Use native `<input type="date">` and `<input type="time">` for the date-time field.

---

## Follow-up Tasks

| Priority | Task                                                                                                            |
| -------- | --------------------------------------------------------------------------------------------------------------- |
| High     | Add `EventIn` / `EventUpdate` TypeScript types to `client/models/event.ts`                                      |
| High     | Install `textarea` + `select` shadcn components                                                                 |
| High     | Implement `/events/create` page                                                                                 |
| High     | Implement `/events/[id]/edit` page                                                                              |
| Medium   | Create `client/lib/events.ts` and `client/lib/organizations.ts` fetch helpers                                   |
| Medium   | Install `sonner` for submit feedback                                                                            |
| Medium   | Implement `/events/[id]` detail page (see `event-detail-page.md`) — natural navigation target after create/edit |
| Low      | Set `response_model=Event` on `PUT /events/{id}` (backend polish)                                               |
| Low      | Install `calendar` + `popover` for polished date picker                                                         |
| Low      | Install `form` + `zod` for validation                                                                           |
| Low      | Add auth enforcement to `POST /events` and `PUT /events/{id}` (BE)                                              |

---

## Dependencies

- `textarea` and `select` shadcn components must be installed before the forms can be built.
- Permission gating requires the `RolesContext` to be initialized with the current user's roles (currently hardcoded to `user_id=1`).
- The event detail page (`/events/[id]`) should exist before or alongside these pages so that post-submit redirects work correctly.
