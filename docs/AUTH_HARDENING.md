# Auth Hardening: Endpoints Missing Session Authentication

Several API endpoints perform user-specific or sensitive operations but are missing
`Depends(get_current_user)` entirely. This means any unauthenticated caller can
access or modify data without a valid session.

The correct pattern is to add `current_user: dict = Depends(get_current_user)` (or
`_current_user` for endpoints that don't need to reference the value directly) to the
endpoint signature. `get_current_user` is defined in `utils/auth.py` and reads the
JWT from the `session` cookie or `Authorization` header, validates it, and raises
`401 Unauthorized` automatically if no valid session is present.

This dependency is already used correctly in: `POST /event-registrations`,
`DELETE /event-registrations/{...}`, `PUT /users/{user_id}`,
`POST /organization`, `DELETE /organization/{id}`, `PUT /organization/{id}`,
`POST /organization/{id}/users`, `DELETE /organization/{id}/users/{user_id}`,
`PUT /organization/{id}/users/{user_id}`, `GET /auth/me`,
`DELETE /auth/delete-account`.

---

## Routes to Change

### 1. `GET /roles` — `routes/roles.py`

**Problem:** No authentication at all. `user_id` is a required query parameter
and any unauthenticated caller can retrieve the roles of any user by supplying an
arbitrary ID. The existing TODO comment in the source already flags this.

**Fix:**
- Add `current_user: dict = Depends(get_current_user)` and remove the `user_id`
  query parameter.
- Derive `user_id = current_user["user_id"]` inside the function body.

---

### 2. `GET /events/recommended` — `routes/events.py`

**Problem:** No authentication at all. `user_id` is a required query parameter,
allowing any unauthenticated caller to fetch personalised recommendations for any
user.

**Fix:**
- Add `current_user: dict = Depends(get_current_user)` and remove the `user_id`
  query parameter.
- Derive `user_id = current_user["user_id"]` inside the function body.

---

### 3. `GET /event-registrations` — `routes/event_registrations.py`

**Problem:** No authentication at all. The optional `user_id` query filter allows
any unauthenticated caller to enumerate the registration history of any user.

**Fix:**
- Add `current_user: dict = Depends(get_current_user)`.
- Remove the `user_id` query parameter and always scope the query to
  `current_user["user_id"]`, **or** if cross-user listing is a legitimate
  admin use-case, verify that the supplied `user_id` matches the session user
  (returning `403 Forbidden` otherwise) and gate any broader access behind a
  role/permission check.

---

### 4. `GET /event-registrations/{organization_id}/{event_id}/{user_id}` — `routes/event_registrations.py`

**Problem:** No authentication at all. Any unauthenticated caller can read any
registration record by guessing the composite key.

**Fix:**
- Add `current_user: dict = Depends(get_current_user)`.
- After fetching the row, verify `row["user_id"] == current_user["user_id"]` and
  return `403 Forbidden` if not.
- If org admins should also be permitted to view registrations, add the
  appropriate role check in place of the strict equality check.

---

### 5. `POST /users` — `routes/users.py`

**Problem:** No authentication. This endpoint creates a user record directly and
duplicates the registration flow that already exists at `POST /auth/signup`. Its
own docstring marks it as `TEMPORARY` and notes it should be removed once auth is
implemented.

**Fix:**
- Delete this endpoint entirely. User creation should only happen through
  `POST /auth/signup`, which correctly handles password hashing and credentials.

---

### 6. `GET /organizations/{organization_id}/users` — `routes/organization_roles.py`

**Problem:** No authentication. The member list of an organisation (including names
and permission levels) is visible to any unauthenticated caller.

**Fix:**
- Add `_current_user: dict = Depends(get_current_user)` to require a valid
  session before returning the member list.
- Optionally, further restrict access to members of the organisation only.

---

## Reference: Correct Pattern

```python
from utils.auth import get_current_user

@router.get("/some-endpoint")
def some_endpoint(
    conn: sqlite3.Connection = Depends(get_connection),
    current_user: dict = Depends(get_current_user),
):
    user_id = current_user["user_id"]  # derived from the validated session token
    ...
```

`get_current_user` reads the JWT from the `session` cookie (or `Authorization`
header), decodes and validates it, and returns the user row from the database.
It raises `401 Unauthorized` automatically if no valid session is present.
