# Project Status

> Last updated: 2026-02-22

A snapshot of what is currently implemented across the API and client, and what needs to be built — ordered from most to least critical for the core mission: **connecting volunteers with nonprofits based on skills, interests, availability, and location**.

---

## Current State

### API

The FastAPI backend is the most complete layer. All major resource endpoints exist with CRUD coverage. The primary gaps are **auth enforcement** and **skills/matching** features.

| Resource            | Endpoints                                                                                                                                                    | Notes                                                                                                                       |
| ------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------ | --------------------------------------------------------------------------------------------------------------------------- |
| Auth                | `POST /signup`, `POST /login`, `POST /request-reset`, `POST /reset-password`, `DELETE /delete-account`                                                       | ✅ Full flow implemented. Reset token is only logged to console — no email sending.                                         |
| Users               | `GET /users`, `GET /users/{id}`, `POST /users`, `PUT /users/{id}`                                                                                            | ✅ Includes pagination, availability filter, search. Temporary `POST` endpoint predates auth. No permission guard on `PUT`. |
| Events              | `GET /events`, `GET /events/{id}`, `POST /events`, `PUT /events/{id}`, `DELETE /events/{id}`                                                                 | ✅ List supports rich filtering (date, time, availability, weekday, org). No auth guard on write operations.                |
| Event Registrations | `GET /event-registrations`, `GET /event-registrations/{org}/{event}/{user}`, `POST /event-registrations`, `DELETE /event-registrations/{org}/{event}/{user}` | ✅ Full CRUD. No auth guard — `user_id` passed as payload, not derived from token.                                          |
| Organizations       | `GET /organization`, `POST /organization`, `PUT /organization/{id}`, `DELETE /organization/{id}`                                                             | ✅ Create grants creator admin role. Update checks admin role. Delete checks creator. No `GET /organization/{id}`.          |
| Organization Users  | `GET /organization/{id}/users`, `POST /organization/{id}/users`, `PUT /organization/{id}/users/{user_id}`, `DELETE /organization/{id}/users/{user_id}`       | ✅ Role management for org members.                                                                                         |
| Roles               | `GET /roles?user_id=`                                                                                                                                        | ✅ Returns all roles for a user. `user_id` should eventually come from the token.                                           |

### Client

The Next.js frontend has routing scaffolded but most pages are placeholders. The events list page is the most functional page beyond auth.

| Route                       | Status         | Notes                                                                                                                 |
| --------------------------- | -------------- | --------------------------------------------------------------------------------------------------------------------- |
| `/`                         | 🟡 Placeholder | Theme toggle test — no landing page content.                                                                          |
| `/signin`                   | ✅ Functional  | POSTs to `/api/auth/login`. No token storage after login.                                                             |
| `/signup`                   | ✅ Functional  | POSTs to `/api/auth/signup`. Redirects to `/` on success.                                                             |
| `/events`                   | ✅ Functional  | Fetches events, supports availability filtering, renders carousel. Forces `user_id=1` for roles — needs auth context. |
| `/events/[id]`              | 🔴 Stub        | Renders placeholder text only.                                                                                        |
| `/events/create`            | 🔴 Stub        | Renders placeholder text only.                                                                                        |
| `/events/[id]/edit`         | 🔴 Stub        | Renders placeholder text only.                                                                                        |
| `/organizations`            | 🔴 Stub        | Renders placeholder text only.                                                                                        |
| `/organizations/[id]`       | 🔴 Stub        | Renders placeholder text only.                                                                                        |
| `/organizations/create`     | 🔴 Stub        | Renders placeholder text only.                                                                                        |
| `/organizations/[id]/edit`  | 🔴 Stub        | Renders placeholder text only.                                                                                        |
| `/organizations/[id]/users` | 🔴 Stub        | Renders placeholder text only.                                                                                        |
| `/profile`                  | 🔴 Stub        | Renders placeholder text only.                                                                                        |
| `/profile/history`          | 🔴 Stub        | Renders placeholder text only.                                                                                        |

---

## What to Build Next (Priority Order)

### 1. Authentication State Management (Client) — **Critical**

The API issues JWT tokens on login but the client never stores or uses them. Every protected action is blocked until this is resolved.

- Store the JWT after a successful login (e.g., `localStorage` or a cookie)
- Create an auth context/hook that exposes the current user and token
- Attach the `Authorization: Bearer <token>` header to all authenticated API requests
- Add route protection (redirect unauthenticated users to `/signin`)
- Remove the hardcoded `user_id=1` from the events page

---

### 2. Event Detail Page (`/events/[id]`) — **Critical**

Volunteers need to read full event details and register. The API endpoint exists (`GET /events/{id}`, `POST /event-registrations`) but there is no frontend.

- Display event name, description, location, date/time, and organization name
- Show a Register / Unregister button that calls the event registrations API
- Disable registration for unauthenticated users

---

### 3. Profile Page (`/profile`) — **High**

Users need to view and update their own information (name, availability). It is a core touchpoint for the matching loop.

- Fetch and display the current user's data from `GET /users/{id}`
- Allow editing name and availability via `PUT /users/{id}`
- Link from the NavBar once auth context exists

---

### 4. Landing / Home Page (`/`) — **High**

The current home page is only a dark-mode test. New visitors have no understanding of the platform.

- Add a brief platform description and call to action
- Link to `/events` (browse) and `/signup` (join)
- Optionally surface a few featured or upcoming events

---

### 5. Registration History (`/profile/history`) — **High**

Allows volunteers to track which events they have signed up for — a stated goal of the platform.

- Query `GET /event-registrations?user_id={id}` for the logged-in user
- Display a list of past and upcoming registrations
- Link to the individual event detail page for each entry

---

### 6. Skills and Interests System — **High**

The project description explicitly calls out skills and interests as matching criteria, but neither the data model nor the API has a concept of skills yet.

- Add `skills` / `interests` fields to the `users` table
- Add `required_skills` or `categories` to the `events` table
- Expose them via the relevant `GET`/`PUT` endpoints
- Add UI for selecting skills/interests during sign-up and on the profile page
- Use skills to influence event filtering or ordering on the events list page

---

### 7. Organizations List Page (`/organizations`) — **Medium**

Volunteers need to discover nonprofit organizations. The API endpoint (`GET /organization`) is complete.

- Fetch and display a paginated list of organizations
- Include name, description, and a link to each organization's detail page
- Add a search input that uses the existing `query` filter parameter

---

### 8. Organization Detail Page (`/organizations/[id]`) — **Medium**

The org detail page is the entry point for learning about a nonprofit and seeing its events.

- Display org name and description
- List events belonging to this organization
- Show a Join / Leave button for the organization (using org users endpoints)
- Note: `GET /organization/{id}` does not exist in the API yet — it needs to be added.

---

### 9. Location-Based Filtering — **Medium**

Events have a `location` field but there is no geographic filtering. The README calls this out as a matching criterion.

- Decide on a location format (city/state string, coordinates, or zip code)
- Add a location filter parameter to `GET /events`
- Add location input to the event filter UI on the client

---

### 10. Event Create / Edit Pages — **Medium**

Org admins cannot currently create or update events through the UI, only via API.

- `/events/create` — form with name, description, location, date/time, and org selector
- `/events/[id]/edit` — pre-populated form that calls `PUT /events/{id}`
- Gate access to users who hold an `admin` role in the relevant organization

---

### 11. Organization Create / Edit / Manage Pages — **Medium**

Completes the organization management workflow for admin users.

- `/organizations/create` — form calling `POST /organization`
- `/organizations/[id]/edit` — form calling `PUT /organization/{id}`
- `/organizations/[id]/users` — table of org members with role controls (uses org users endpoints)

---

### 12. Auth Enforcement on API Write Endpoints — **Medium**

Several API endpoints accept `user_id` as a query parameter instead of deriving it from the JWT. This is a noted TODO throughout the codebase.

- Replace `user_id` query/body params with `current_user = Depends(get_current_user)` on:
  - `POST /event-registrations` and its delete
  - `POST /organization`, `PUT /organization/{id}`, `DELETE /organization/{id}`
  - `PUT /users/{id}`
  - Org roles add/update/remove
- Add `GET /organization/{id}` endpoint (currently missing)

---

### 13. Password Reset UI — **Low**

The API fully supports password reset (request token → reset with token), but there is no frontend flow.

- Add a "Forgot password?" link on the sign-in page
- Create a request-reset form that calls `POST /auth/request-reset`
- Create a reset form (linked from the reset token) that calls `POST /auth/reset-password`
- Consider replacing console-logged tokens with an actual email service

---

### 14. Volunteer Matching / Recommendations — **Low (Future)**

The platform's differentiating feature — surfacing the right opportunities for each volunteer — depends on skills/interests data (#6) being in place first.

- Rank or weight events based on overlap between user skills/interests and event requirements
- Surface personalized recommendations on the home page or a dedicated `/discover` page
- Consider availability overlap as a secondary ranking signal
