# Task: Event Detail Page (`/events/[id]`)

**Priority:** Critical  
**Effort:** Medium

---

## Overview

The event detail page is a stub that renders nothing but `<div>EventDetails</div>`. Volunteers need to view full event information and register or unregister for events. Both the `GET /events/{id}` API endpoint and the event registrations API already exist — this is purely a frontend build-out.

---

## Backend Changes

### Required

- **None blocking.** `GET /events/{id}` is fully implemented and returns all event fields.

### Nice-to-have

- Set `response_model=Event` on `GET /events/{event_id}` in `api/routes/events.py` — currently it has `response_model=None` with a `TODO` comment.
- Add `signup_count` to the `GET /events/{id}` response (requires a `COUNT(*)` JOIN with `event_registrations`).
- Add `user_signed_up` support — either as a query param on `GET /events/{id}` or derived from a second `GET /event-registrations` call on the frontend.

---

## Frontend Changes

### File to implement

- `client/app/events/[id]/page.tsx` — currently a stub

### Data fetching

- Accept `params: { id: string }` from Next.js dynamic route props.
- Fetch `GET /api/events/{id}` on mount to load event details.
- Fetch `GET /api/event-registrations?event_id={id}&user_id={currentUserId}` to determine whether the user is already registered.
- Handle loading, 404, and error states.

### UI sections to build

| Section                      | Notes                                                                                                    |
| ---------------------------- | -------------------------------------------------------------------------------------------------------- |
| Event header                 | Name, formatted `date_time`, `location`                                                                  |
| Event description            | Body text                                                                                                |
| Organization link            | Link to `/organizations/{organization_id}` using the event's `organization_id`                           |
| Register / Unregister button | Calls `POST /api/event-registrations` or `DELETE /api/event-registrations/{org_id}/{event_id}/{user_id}` |
| Edit link                    | Link to `/events/{id}/edit` (stub already exists) — conditionally shown for org admins                   |
| Back navigation              | `← Back to Events` link                                                                                  |

### Notes

- Registration requires `organization_id`, `event_id`, and `user_id` as a composite key. The event's `organization_id` must be fetched first.
- `user_id` is currently hardcoded to `1` throughout the codebase (same pattern as `events/page.tsx`). Follow this pattern for now with a `// TODO` comment.

---

## shadcn/ui Components

### Already installed (no action needed)

| Component   | Usage                                     |
| ----------- | ----------------------------------------- |
| `button`    | Register / Unregister and back navigation |
| `card`      | Page layout container                     |
| `badge`     | Event category or status display          |
| `separator` | Section dividers                          |

### New components to add

| Component  | Why                                                                                 | Install command                  |
| ---------- | ----------------------------------------------------------------------------------- | -------------------------------- |
| `skeleton` | Loading placeholder while event data fetches                                        | `npx shadcn@latest add skeleton` |
| `sonner`   | Toast feedback for register/unregister success or error                             | `npx shadcn@latest add sonner`   |
| `dialog`   | Optional "confirm unregister" prompt (Radix peer dep already installed via `sheet`) | `npx shadcn@latest add dialog`   |

For the MVP, only `Button`, `Card`, `Separator`, and `Badge` (all already present) are strictly required.

---

## Follow-up Tasks

| Priority | Task                                                   |
| -------- | ------------------------------------------------------ |
| High     | Implement `client/app/events/[id]/page.tsx`            |
| Medium   | Set `response_model=Event` on `GET /events/{event_id}` |
| Medium   | Implement `/events/[id]/edit/page.tsx` stub            |
| Medium   | Add `signup_count` to event API response               |
| Low      | Replace hardcoded `user_id=1` with real auth context   |
| Low      | Add `skeleton` for loading state                       |
| Low      | Add toast feedback for registration actions            |

---

## Dependencies

- No hard blockers — the API endpoints are already functional.
- Auth context (separate task) is needed before replacing the hardcoded `user_id=1`.
- The `organization_id` from the event response is needed to call the registration endpoints.
