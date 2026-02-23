# Task: Registration History (`/profile/history`)

**Priority:** High  
**Effort:** Medium

---

## Overview

The registration history page (`client/app/profile/history/page.tsx`) is a stub that renders `<div>EventHistoryPage</div>`. Volunteers need to see which events they have signed up for. The `GET /event-registrations` endpoint already exists and supports filtering by `user_id`, but it only returns IDs — not the event name, location, or date that would make the list meaningful. A backend change is needed before this page can be built.

---

## Backend Changes

### Required — Add joined response

`GET /event-registrations` currently returns only raw IDs from `event_registrations`:

```text
{ user_id, event_id, organization_id, registration_time }
```

This is insufficient to render a useful history list without N+1 requests (one `GET /events/{id}` per registration). A new response model and joined query are needed.

**Option A (recommended): Add a `with_details` flag to the existing endpoint**
Add an optional `include_event_details: bool = False` query param to `GET /event-registrations`. When `true`, JOIN with the `events` table and return a richer payload.

**Option B: New endpoint**
Add `GET /event-registrations/with-events` as a dedicated endpoint.

**New Pydantic model to add** in `api/models/event_registration.py`:

```python
class EventRegistrationWithEvent(BaseModel):
    user_id: int
    event_id: int
    organization_id: int
    registration_time: str
    event_name: str
    event_location: str
    event_date_time: str
```

**SQL join:**

```sql
SELECT er.user_id, er.event_id, er.organization_id, er.registration_time,
       e.name AS event_name, e.location AS event_location, e.date_time AS event_date_time
FROM event_registrations er
JOIN events e ON er.event_id = e.id
WHERE er.user_id = ?
ORDER BY er.registration_time DESC
LIMIT ? OFFSET ?
```

---

## Frontend Changes

### Files to implement

- `client/app/profile/history/page.tsx` — currently a stub

### New TypeScript model

Add `EventRegistrationWithEvent` interface in `client/models/` (new file `eventRegistration.ts` or append to `event.ts`):

```typescript
export interface EventRegistrationWithEvent {
  user_id: number;
  event_id: number;
  organization_id: number;
  registration_time: string;
  event_name: string;
  event_location: string;
  event_date_time: string;
}
```

### Data fetching

- Fetch `GET /api/event-registrations?user_id={currentUserId}&include_event_details=true` (or `/event-registrations/with-events`).
- `user_id` is currently hardcoded to `1` (same pattern as the events page). Follow this pattern with a `// TODO` comment until auth context exists.

### UI sections to build

| Section           | Notes                                                                             |
| ----------------- | --------------------------------------------------------------------------------- |
| Page header       | "My Registration History"                                                         |
| Registration list | Each item shows: event name (linked to `/events/{event_id}`), date/time, location |
| Status badge      | "Upcoming" vs "Past" based on `event_date_time` vs current date                   |
| Empty state       | "You haven't registered for any events yet" message                               |
| Pagination        | Uses `skip`/`limit` from the existing endpoint                                    |

---

## shadcn/ui Components

### Already installed (no action needed)

| Component   | Usage                  |
| ----------- | ---------------------- |
| `card`      | List item containers   |
| `badge`     | Upcoming / Past status |
| `button`    | Pagination / actions   |
| `separator` | Section dividers       |

### New components to add

| Component  | Why                                                 | Install command                  |
| ---------- | --------------------------------------------------- | -------------------------------- |
| `table`    | Cleaner history table layout (alternative to cards) | `npx shadcn@latest add table`    |
| `skeleton` | Loading state                                       | `npx shadcn@latest add skeleton` |

The existing `Card` component is the simplest approach and requires no new dependencies. `Table` is an upgrade if a denser layout is preferred.

---

## Follow-up Tasks

| Priority | Task                                                               |
| -------- | ------------------------------------------------------------------ |
| High     | Add `EventRegistrationWithEvent` model and joined query to backend |
| High     | Add `EventRegistrationWithEvent` TypeScript interface to client    |
| High     | Implement `client/app/profile/history/page.tsx`                    |
| Medium   | Add upcoming vs. past status badge logic                           |
| Medium   | Add pagination controls                                            |
| Low      | Replace hardcoded `user_id=1` with real auth context               |

---

## Dependencies

- **Backend join is a hard dependency** — the current `GET /event-registrations` response does not include event details, making N+1 requests the only alternative.
- Auth context (separate task) is needed to show the current user's history instead of hardcoding `user_id=1`.
- The event detail page (`/events/[id]`) should exist for the "link to event" feature to work.
