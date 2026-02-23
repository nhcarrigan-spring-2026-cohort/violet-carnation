# Task: Skills and Interests System

**Priority:** High  
**Effort:** Large (full-stack, schema migration required)

---

## Overview

The project description calls out skills and interests as core matching criteria, but neither the database, API, nor frontend currently store them. The frontend already has 20 predefined event categories in `client/models/eventCategories.ts` ready to use as the interests model. This task adds `skills` and `interests` to users, `category` to events, and wires them through all relevant endpoints and UI surfaces.

> **Pre-existing blocker:** The `availability` field is mismatched between the frontend (`Availability[]` array with values `"Mornings" | "Afternoons" | "Evenings" | "Weekends" | "Flexible"`) and the backend (single string `"Full-time" | "Part-time" | "Weekends" | "Evenings"`). This misalignment must be resolved alongside or before this task, since both touch the user model.

---

## Backend Changes

### 1. Database schema (`api/utils/db_schema.py`)

Add to the `users` table:

```sql
skills TEXT DEFAULT '',
interests TEXT DEFAULT NULL  -- JSON array string e.g. '["Education & Tutoring","Health & Medical"]'
```

Add to the `events` table:

```sql
category TEXT DEFAULT NULL
```

Add a new junction table (Option B — preferred for clean filtering):

```sql
CREATE TABLE IF NOT EXISTS user_interests (
    user_id   INTEGER NOT NULL,
    category  TEXT NOT NULL,
    PRIMARY KEY (user_id, category),
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
);
```

> Because `db_schema.py` uses `CREATE TABLE IF NOT EXISTS`, these changes cannot be added inline. Either run `ALTER TABLE` in a migration script or regenerate the DB using the existing `drop_db.py` / `populate_db.py` utilities (acceptable at this stage).

Also update `api/utils/drop_db.py` to add `DROP TABLE IF EXISTS user_interests;`.

### 2. Pydantic models

**`api/models/user.py`:**

- Add `skills: str = ""` to `User`, `UserIn`, `UserUpdate`
- Add `interests: list[str] = []` to `User`, `UserIn`, `UserUpdate`

**`api/models/event.py`:**

- Add `category: Optional[str] = None` to `Event`, `EventIn`, `EventUpdate`

### 3. Route changes

**`api/routes/users.py`:**

- `GET /users` and `GET /users/{user_id}` — include `skills` from `users.skills` and `interests` from `user_interests` table in response
- `POST /users` — insert `skills` and insert rows into `user_interests`
- `PUT /users/{user_id}` — update `skills`; diff and upsert `user_interests` rows

**`api/routes/events.py`:**

- `GET /events` — add optional `category: Optional[List[str]]` query param; add `WHERE category IN (...)` clause
- `POST /events` and `PUT /events/{event_id}` — accept and persist `category`

---

## Frontend Changes

### Model updates

- **`client/models/user.ts`** — add `skills: string[]` and `interests: EventCategory[]`; import `EventCategory` from `eventCategories.ts`
- **`client/models/filters.ts`** — uncomment / add `category: EventCategory[] | null` to the `Filters` interface

### Signup page (`client/app/(auth)/signup/page.tsx`)

- Add a multi-checkbox section for "Interests" using `EVENT_CATEGORIES` from `client/models/eventCategories.ts`
- Add a text `<Input>` for "Skills" (free-text or comma-separated)
- Include both in the form body sent to `/api/auth/signup`

### Profile page (`client/app/profile/page.tsx`)

- Display and edit `skills` (text input or tag-style)
- Display and edit `interests` (checkbox grid using `EVENT_CATEGORIES`)
- On submit, include both in the `PUT /users/{id}` payload

### Event filters (`client/components/FilterModal.tsx`)

- Add a **Category** filter section using `Checkbox` per `EventCategory` entry (structurally identical to the existing Availability section)
- Wire up to `filters.category` state

### Filter serialization (`client/app/events/filters-to-query-params.ts`)

- Add mapping of `filters.category` values → `category=X` query params

---

## shadcn/ui Components

### Already installed (no action needed)

| Component            | Usage                                              |
| -------------------- | -------------------------------------------------- |
| `checkbox` + `label` | Interest checkbox grid (signup / profile / filter) |
| `input` + `label`    | Skills text input                                  |
| `badge`              | Skill tag / chip display                           |
| `card`, `separator`  | Profile form layout                                |

### New components to add (optional)

| Component             | Why                                                   | Install command                         |
| --------------------- | ----------------------------------------------------- | --------------------------------------- |
| `popover` + `command` | Multi-select combobox for skills (nicer tag-style UX) | `npx shadcn@latest add popover command` |

No blocking component gaps for a v1 implementation using checkboxes and a plain text input.

---

## Follow-up Tasks

| Priority | Task                                                                   |
| -------- | ---------------------------------------------------------------------- |
| Blocker  | Resolve `availability` type mismatch (do this at the same time)        |
| High     | Update DB schema and regenerate database                               |
| High     | Update API Pydantic models (`user.py`, `event.py`)                     |
| High     | Update `routes/users.py` CRUD for skills + interests                   |
| High     | Update `routes/events.py` to accept and filter by `category`           |
| High     | Update `client/models/user.ts` and `client/models/filters.ts`          |
| High     | Update signup page to collect interests + skills                       |
| High     | Implement profile page (see `profile-page.md`)                         |
| Medium   | Add category filter to `FilterModal` and `filtersToQueryParams`        |
| Low      | Add `GET /events?match_user_interests=true` for personalized discovery |
| Low      | Add combobox-style skills input via `popover` + `command`              |

---

## Dependencies

- DB schema regeneration must happen before any API CRUD changes can be tested.
- Profile page implementation (see `profile-page.md`) overlaps significantly with this task — coordinate or combine.
- Volunteer Matching (see `volunteer-matching.md`) is fully blocked on this task being complete.
- The `availability` mismatch must be resolved in parallel — both tasks touch the user model.
