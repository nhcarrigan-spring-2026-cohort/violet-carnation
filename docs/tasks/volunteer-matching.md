# Task: Volunteer Matching / Recommendations

**Priority:** Low (Future)  
**Effort:** Large (depends on Skills & Interests System)

---

## Overview

The platform's differentiating feature — surfacing the right opportunities for each volunteer — depends on skills and interests data being stored on users and events. Neither the database, API, nor frontend currently has this data. This task is **fully blocked** until the Skills and Interests System (see `skills-interests-system.md`) is complete.

Once that foundation exists, a `GET /events/recommended` endpoint and a "Recommended for You" section on the home page can be added.

---

## Current State

| Matching Signal                              | Status                                                                                        |
| -------------------------------------------- | --------------------------------------------------------------------------------------------- |
| User `availability` ↔ Event `date_time`      | Partially exists — but `availability` is mismatched between FE (array) and BE (single string) |
| User interests ↔ Event `category`            | Does not exist on either model                                                                |
| User skills ↔ Event `required_skills`        | Does not exist                                                                                |
| Past registrations (collaborative filtering) | `event_registrations` table exists but no query logic for matching                            |
| Organization membership                      | `roles` table exists — coarse signal only                                                     |

**Minimum viable matching with zero schema changes:** Filter events by user availability against event `date_time`. This already mostly works via the existing filter endpoint and could be wrapped in a `?for_user={id}` convenience param.

---

## Backend Changes

### Schema changes (via Skills & Interests System task)

These are handled in `skills-interests-system.md`, but required here:

- Add `category TEXT DEFAULT NULL` to the `events` table
- Add `interests TEXT DEFAULT NULL` to the `users` table (or a `user_interests` junction table)
- Fix `availability` to be multi-value (align with the FE array model)

### New endpoint: `GET /events/recommended`

Add to `api/routes/events.py`:

```python
@router.get("/recommended", response_model=list[Event])
def recommended_events(
    user_id: int,
    limit: int = 10,
    conn: sqlite3.Connection = Depends(get_connection),
):
    # 1. Load user availability + interests
    # 2. Query events matching interest/category overlap
    # 3. Filter by availability time windows
    # 4. Exclude already-registered events (JOIN with event_registrations)
    # 5. Order by match score (count of overlapping signals)
```

> This must be a dedicated endpoint — do **not** modify `GET /events` — which serves the browse/filter page with different semantics.
> **Route ordering:** Define `/recommended` before `/{event_id}` in the router to avoid FastAPI treating `"recommended"` as an integer path param.

### Existing endpoint changes

- `GET /events` — add `category` filter param (see `skills-interests-system.md`)
- `PUT /users/{user_id}` — accept `interests` in `UserUpdate` (see `skills-interests-system.md`)

---

## Frontend Changes

### Home page (`client/app/page.tsx`)

Add a "Recommended for You" section for logged-in users:

- Fetch `GET /api/events/recommended?user_id={currentUserId}`.
- Pass results to the existing `EventCarousel` component.
- Show an empty state / CTA ("Set your interests to get personalized recommendations") if the user has no interests set.

### Profile page (`client/app/profile/page.tsx`)

- Add a multi-select interests picker using `EVENT_CATEGORIES` (20 categories already defined in `client/models/eventCategories.ts`).
- Saved via `PUT /api/users/{user_id}` once `interests` is added to the backend.

### Event model

- `category` field already exists on the FE `Event` interface with a `TODO` comment — remove the comment and wire it through once the backend supports it.

### User model

- `availability` type mismatch (`Availability[]` vs BE single string) must be resolved before availability-based matching works.

---

## shadcn/ui Components

### Already installed (no action needed)

| Component            | Usage                                                |
| -------------------- | ---------------------------------------------------- |
| `card`               | Recommendation cards (reused from `EventCarousel`)   |
| `badge`              | Category tags on recommendation cards                |
| `checkbox` + `label` | Interests picker on profile page (multi-select grid) |

### New components to add

| Component             | Why                                                       | Install command                         |
| --------------------- | --------------------------------------------------------- | --------------------------------------- |
| `skeleton`            | Loading placeholder for recommendation cards              | `npx shadcn@latest add skeleton`        |
| `scroll-area`         | Styled horizontal scroll for recommendation row           | `npx shadcn@latest add scroll-area`     |
| `popover` + `command` | Multi-select combobox for interests on profile (nicer UX) | `npx shadcn@latest add popover command` |
| `alert`               | "Set your interests…" empty-state message                 | `npx shadcn@latest add alert`           |
| `tooltip`             | "Why was this recommended?" hover hint (optional)         | `npx shadcn@latest add tooltip`         |

---

## Follow-up Tasks (in order)

| Priority    | Task                                                                                                                 |
| ----------- | -------------------------------------------------------------------------------------------------------------------- |
| **Blocker** | Fix `availability` type mismatch (FE array vs BE single string)                                                      |
| **Blocker** | Complete Skills & Interests System (`skills-interests-system.md`)                                                    |
| High        | Add `category` to `events` table and API (part of skills task)                                                       |
| High        | Add `interests` to `users` table and API (part of skills task)                                                       |
| High        | Implement `GET /events/recommended` endpoint                                                                         |
| High        | Build "Recommended for You" section on home page                                                                     |
| High        | Build interests multi-select on profile page                                                                         |
| Medium      | Resolve auth context — replace `user_id=1` hardcode                                                                  |
| Medium      | Surface `user_signed_up` from `event_registrations` in API to exclude already-registered events from recommendations |
| Low         | Add `category` filter to `GET /events` for browse-page consistency                                                   |
| Low         | Consider collaborative filtering from `event_registrations` as a secondary ranking signal                            |

---

## Dependencies

| Dependency                                                   | Blocking?                                                                    |
| ------------------------------------------------------------ | ---------------------------------------------------------------------------- |
| **Skills & Interests System** (`skills-interests-system.md`) | **Hard block** — no data to match on                                         |
| **Auth context**                                             | **Hard block** — recommendations are meaningless without a real current user |
| `availability` type mismatch fix                             | **Hard block** for availability-based matching                               |
| Event detail page (`event-detail-page.md`)                   | Soft — needed so recommendation cards can link through to details            |
| `user_signed_up` surfaced in event API                       | Soft — needed to exclude already-registered events cleanly                   |
