# Task: Location-Based Filtering

**Priority:** Medium  
**Effort:** Small

---

## Overview

Events have a `location` field (free-text `TEXT` in SQLite), but there is no way to filter events by location. The `GET /events` route already has a commented-out `# TODO: add location filter` note. This task adds a `location` substring filter to the backend and a corresponding input in the frontend filter UI.

---

## Decision: Location Format

A team decision is needed before implementation. Three options are available:

| Option                        | Description                                                                                                  | Effort | Recommendation      |
| ----------------------------- | ------------------------------------------------------------------------------------------------------------ | ------ | ------------------- |
| **A — Free-text LIKE search** | Add `location LIKE ?` to the existing query. Zero schema changes.                                            | XS     | **Start here**      |
| B — Structured city/state     | Split `location TEXT` into `city TEXT` + `state TEXT` columns. Requires schema migration and data migration. | L      | Future improvement  |
| C — Coordinates + radius      | Add `latitude REAL` + `longitude REAL`; use Haversine query.                                                 | XL     | Out of scope for v1 |

**Recommended approach:** Implement Option A now. Add a `TODO` comment noting Option B as a future structured follow-up.

---

## Backend Changes

### `api/routes/events.py`

Add `location: Optional[str] = None` to the `list_events` function signature (replacing the commented-out `locale` TODO):

```python
location: Optional[str] = None,
```

Add to the query-building block:

```python
if location:
    query += " AND LOWER(location) LIKE LOWER(?)"
    params.append(f"%{location}%")
```

Using `LOWER()` on both sides avoids case-sensitivity issues with ASCII characters.

**No schema changes are required for Option A.**

---

## Frontend Changes

### `client/models/filters.ts`

Add `location: string | null` to the `Filters` interface:

```typescript
export interface Filters {
  scope: Scope | null;
  availability: Availability[] | null;
  location: string | null; // new
}
```

### `client/app/events/page.tsx`

Update the initial filters state:

```typescript
const [filters, setFilters] = useState<Filters>({
  scope: "all",
  availability: null,
  location: null, // new
});
```

### `client/app/events/filters-to-query-params.ts`

Add serialization for the `location` field:

```typescript
if (filters.location) {
  params.set("location", filters.location);
}
```

Add a corresponding test case to `client/app/events/filters-to-query-params.test.ts`.

### `client/components/FilterModal.tsx`

Add a location text input section (the `Input` component is already installed):

```tsx
<div className="flex items-center gap-3">
  <span className="font-semibold text-muted-foreground whitespace-nowrap">
    Location
  </span>
  <Input
    placeholder="City, state, or venue..."
    value={filters.location ?? ""}
    onChange={(e) => onChange({ ...filters, location: e.target.value || null })}
    className="w-48"
  />
</div>
```

### `client/components/ActiveFilters.tsx`

Add a badge entry for an active location filter:

```typescript
if (filters.location) {
  activeFilters.push({
    key: "location",
    label: `Location: ${filters.location}`,
  });
}
```

---

## shadcn/ui Components

**No new shadcn components are required.** The existing `input.tsx` component handles the location text field.

If a future structured city/state approach (Option B) is taken with dropdown selects, a `Select` or `Combobox` (`popover` + `command`) would be needed at that time.

---

## Follow-up Tasks

| Priority | Task                                                                               |
| -------- | ---------------------------------------------------------------------------------- |
| High     | Decide on location format (Option A vs B)                                          |
| High     | Add `location` query param to `GET /events` (backend)                              |
| High     | Add `location` to `Filters` interface and initial state (frontend)                 |
| High     | Update `filtersToQueryParams` + add test                                           |
| High     | Add location input to `FilterModal`                                                |
| High     | Add location badge to `ActiveFilters`                                              |
| Medium   | Audit seed data: `SELECT DISTINCT location FROM events` to verify LIKE is workable |
| Medium   | Add debounce to the location input (avoid firing an API call on every keystroke)   |
| Low      | Note Option B (city/state columns) as a future improvement in a code comment       |

---

## Dependencies

- No hard blockers — the `location` column already exists in the database.
- The filter modal and `filtersToQueryParams` function already exist as the integration point.
- Pre-existing gap: `ActiveFilters` component's `onRemove` callback may not be fully wired in `events/page.tsx` — check and fix this before or alongside adding location, since it affects all filters.
