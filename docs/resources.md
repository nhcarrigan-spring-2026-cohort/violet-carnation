# Backend API Resources

This document describes the backend API endpoints.
It is intended for developers working on the frontend or contributing to the backend.

The API documentation below is derived from the FastAPI Swagger UI (`/docs`).

---

## Base URL

http://localhost:8000

---

## Health

### `GET /health`

Checks whether the backend service is running.

**Response**

- `200 OK`
- JSON object with service status

---

## Volunteers

The volunteers resource manages individuals who participate in events.

---

### `GET /volunteers`

Retrieve a list of all volunteers.

**Response**

- `200 OK`
- Array of volunteer objects

---

### `GET /volunteers/{id}`

Retrieve details for a single volunteer.

**Path Parameters**
| Name | Type | Description |
|-----|------|-------------|
| id | integer | Volunteer ID |

**Response**

- `200 OK`
- Volunteer object
- `404 Not Found` if the volunteer does not exist

---

### `POST /volunteers`

Create a new volunteer.

**Request Body**
| Field | Type | Required |
|------|------|----------|
| name | string | yes |
| email | string | yes |

**Response**

- `201 Created`
- Newly created volunteer object
- `422 Unprocessable Entity` for validation errors

---

### `PUT /volunteers/{id}`

Update an existing volunteer.

**Path Parameters**
| Name | Type | Description |
|-----|------|-------------|
| id | integer | Volunteer ID |

**Request Body**
| Field | Type | Required |
|------|------|----------|
| name | string | no |
| email | string | no |

**Response**

- `200 OK`
- Updated volunteer object
- `404 Not Found` if the volunteer does not exist
- `422 Unprocessable Entity` for validation errors

---

### `DELETE /volunteers/{id}`

Delete a volunteer.

**Path Parameters**
| Name | Type | Description |
|-----|------|-------------|
| id | integer | Volunteer ID |

**Response**

- `204 No Content`
- `404 Not Found` if the volunteer does not exist

## Events

### `GET /events`

Fetch all events.

**Response**

- `200 OK`
- Array of event objects

---

### `POST /events`

Create a new event.

**Request Body**
| Field | Type | Required |
|------|------|----------|
| title | string | yes |
| start_time | datetime | yes |
| end_time | datetime | yes |

**Response**

- `201 Created`
- Event object

---

### `GET /events/{event_id}`

Fetch event details by ID.

**Path Parameters**
| Name | Type |
|------|------|
| event_id | integer |

**Response**

- `200 OK`
- Event object
- `404 Not Found`

## Related Files

- Backend source: `api/`
- FastAPI entry point: `api/main.py`
