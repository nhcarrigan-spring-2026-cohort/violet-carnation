"use client";

import React, { useState } from "react";
import { Filters } from "@/models/filters";
import { EVENT_CATEGORIES, EventCategory } from "@/models/eventCategories";
import { Availability } from "@/models/user";

interface FilterModalProps {
  isOpen: boolean;
  onClose: () => void;
  filters: Filters;
  onApply: (filters: Filters) => void;
}

const FilterModal = ({ isOpen, onClose, filters, onApply }: FilterModalProps) => {
  const [localFilters, setLocalFilters] = useState(filters);

  const handleAvailabilityToggle = (availability: Availability) => {
    const current = localFilters.availability || [];

    if (current.includes(availability)) {
      const updated = current.filter((a) => a !== availability);
      setLocalFilters({
        ...localFilters,
        availability: updated.length > 0 ? updated : null,
      });
    } else {
      setLocalFilters({
        ...localFilters,
        availability: [...current, availability],
      });
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <h2>Filters</h2>

        {/* Scope */}
        <fieldset>
          <legend>Scope</legend>
          <label>
            <input
              type="radio"
              checked={localFilters.scope === "all"}
              onChange={() => setLocalFilters({ ...localFilters, scope: "all" })}
            />
            All Events
          </label>
          <label>
            <input
              type="radio"
              checked={localFilters.scope === "myOrgs"}
              onChange={() => setLocalFilters({ ...localFilters, scope: "myOrgs" })}
            />
            My Organizations
          </label>
          <label>
            <input
              type="radio"
              checked={localFilters.scope === "admin"}
              onChange={() => setLocalFilters({ ...localFilters, scope: "admin" })}
            />
            Admin Only
          </label>
        </fieldset>
        <fieldset>
          <legend>Category</legend>
          <select
            value={localFilters.category || ""}
            onChange={(e) => {
              const value = e.target.value;
              setLocalFilters({
                ...localFilters,
                category: value ? (value as EventCategory) : null,
              });
            }}
          >
            <option value="">All Categories</option>
            {EVENT_CATEGORIES.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
        </fieldset>
        <fieldset>
          <legend>Availability</legend>
          <label>
            <input
              type="checkbox"
              checked={localFilters.availability?.includes("Mornings") || false}
              onChange={() => handleAvailabilityToggle("Mornings")}
            />
            Mornings
          </label>
          <label>
            <input
              type="checkbox"
              checked={localFilters.availability?.includes("Afternoons") || false}
              onChange={() => handleAvailabilityToggle("Afternoons")}
            />
            Afternoons
          </label>
          <label>
            <input
              type="checkbox"
              checked={localFilters.availability?.includes("Evenings") || false}
              onChange={() => handleAvailabilityToggle("Evenings")}
            />
            Evenings
          </label>
          <label>
            <input
              type="checkbox"
              checked={localFilters.availability?.includes("Weekends") || false}
              onChange={() => handleAvailabilityToggle("Weekends")}
            />
            Weekends
          </label>
          <label>
            <input
              type="checkbox"
              checked={localFilters.availability?.includes("Flexible") || false}
              onChange={() => handleAvailabilityToggle("Flexible")}
            />
            Flexible
          </label>
        </fieldset>
        <button onClick={() => onApply(localFilters)}>Apply</button>
        <button onClick={onClose}>Cancel</button>
      </div>
    </div>
  );
};

export default FilterModal;
