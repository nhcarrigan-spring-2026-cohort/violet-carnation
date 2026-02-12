"use client";

import React, { useState } from "react";
import { Filters } from "@/models/filters";
import { EVENT_CATEGORIES, EventCategory } from "@/models/eventCategories";
import { AVAILABILITY_OPTIONS, Availability } from "@/models/user";
import { SCOPE_OPTIONS } from "@/models/filters";

interface FilterModalProps {
  onClose: () => void;
  filters: Filters;
  onApply: (filters: Filters) => void;
}

const FilterModal = ({ onClose, filters, onApply }: FilterModalProps) => {
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

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <h2>Filters</h2>

        {/* Scope */}
        <fieldset>
          <legend>Scope</legend>
          {SCOPE_OPTIONS.map((option) => (
            <label key={option}>
              <input
                type="radio"
                checked={localFilters.scope === option}
                onChange={() => setLocalFilters({ ...localFilters, scope: option })}
              />
              {option === "myOrgs"
                ? "My Organizations"
                : option === "admin"
                  ? "Admin Only"
                  : "All Events"}
            </label>
          ))}
        </fieldset>

        {/* Category */}
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

        {/* Availability */}
        <fieldset>
          <legend>Availability</legend>
          {AVAILABILITY_OPTIONS.map((option) => (
            <label key={option}>
              <input
                type="checkbox"
                checked={localFilters.availability?.includes(option) || false}
                onChange={() => handleAvailabilityToggle(option)}
              />
              {option === "Mornings"
                ? "Mornings"
                : option === "Afternoons"
                  ? "Afternoons"
                  : option === "Evenings"
                    ? "Evenings"
                    : option === "Weekends"
                      ? "Weekends"
                      : "Flexible"}
            </label>
          ))}
        </fieldset>
        <button onClick={() => onApply(localFilters)}>Apply</button>
        <button onClick={onClose}>Cancel</button>
      </div>
    </div>
  );
};

export default FilterModal;
