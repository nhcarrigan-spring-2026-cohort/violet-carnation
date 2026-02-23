# Task: Landing / Home Page (`/`)

**Priority:** High  
**Effort:** Small–Medium

---

## Overview

The current home page (`client/app/page.tsx`) is a development stub that only renders a dark-mode toggle and the text "Theme Test". New visitors have no understanding of the platform. This page needs real content: a hero section, calls to action, and a preview of upcoming events.

---

## Backend Changes

### Required

- **Add `ORDER BY date_time ASC`** to `GET /events` in `api/routes/events.py`. Currently events are ordered by `id` (insertion order), meaning "upcoming" events from a `begin_date=<today>` query may not actually be next chronologically.
- **Add a `limit` query parameter** to `GET /events`. Currently it returns all events. A `limit=6` is needed to fetch a small set for the home page without slicing client-side.

No new endpoint is needed. `GET /events?begin_date=<today>&limit=6` will be sufficient once these two changes are made.

---

## Frontend Changes

### Files to implement / update

- `client/app/page.tsx` — replace the stub with a real page
- `client/app/layout.tsx` — update `metadata` (`title` and `description`) from "Create Next App" to the real app name
- `client/components/NavBar.tsx` — add brand/logo and navigation links (see below)

### Page sections

#### Hero Section

- Platform headline and short value-proposition paragraph.
- Two CTA buttons: **Browse Events** → `/events`, **Sign Up** → `/signup`.
- If the user is already logged in (read from cookie), replace "Sign Up" with a link to `/profile`.

#### Upcoming Events Section

- Reuse the existing `EventCarousel` component (already `"use client"` and accepts `Event[]`).
- `page.tsx` as a server component fetches `GET /api/events?begin_date=<today>&limit=6` and passes results as props to `<EventCarousel events={upcomingEvents} />`.
- Add a "View all events →" link to `/events`.

#### Static Feature Highlights (optional)

- Three brief feature cards (no API calls): "Find Events", "Join an Organization", "Track Your History" — link to `/events`, `/organizations`, `/profile`.

### NavBar upgrade (parallel or prerequisite)

`client/components/NavBar.tsx` currently has only a `ModeToggle`. The home page will be difficult to navigate without real nav links. Add:

- Brand/logo linking to `/`
- Links to `/events` and `/organizations`
- Conditional Sign In + Sign Up (unauthenticated) or Profile (authenticated)

> Note: `NavBar` is a `"use client"` component. Auth-conditional rendering requires either props passed from the server layout or a client-side cookie read.

---

## shadcn/ui Components

### Already installed (no action needed)

| Component   | Usage                        |
| ----------- | ---------------------------- |
| `button`    | Hero CTA buttons             |
| `card`      | Feature highlight cards      |
| `badge`     | Optional event category tags |
| `separator` | Section dividers             |

### New components to consider

| Component         | Why                                             | Install command                         |
| ----------------- | ----------------------------------------------- | --------------------------------------- |
| `skeleton`        | Loading placeholder while upcoming events fetch | `npx shadcn@latest add skeleton`        |
| `navigation-menu` | Accessible nav links in NavBar                  | `npx shadcn@latest add navigation-menu` |

No new shadcn installs are strictly required for the hero and static sections.

---

## Follow-up Tasks

| Priority | Task                                                                       |
| -------- | -------------------------------------------------------------------------- |
| High     | Add `ORDER BY date_time ASC` and `limit` param to `GET /events` (backend)  |
| High     | Update `client/app/page.tsx` with hero and upcoming events                 |
| High     | Upgrade `NavBar.tsx` with brand, nav links, and conditional auth links     |
| Medium   | Update `layout.tsx` metadata (title/description)                           |
| Medium   | Add React Suspense boundary around the events section for graceful loading |
| Low      | Add `skeleton` component for loading state                                 |
| Low      | Modify `EventCarousel` to link cards through to `/events/{id}` detail page |

---

## Dependencies

- Backend `GET /events` needs `ORDER BY date_time ASC` and a `limit` param before the "upcoming events" section is meaningful.
- `EventCarousel` is already built and accepts `Event[]` — it can be dropped in once `page.tsx` fetches real data.
- Auth context (separate task) is needed for conditional NavBar rendering and the "Sign Up vs Profile" CTA.
