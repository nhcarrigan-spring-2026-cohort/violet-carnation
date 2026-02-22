"use client";

import { Filters, SCOPE_OPTIONS } from "@/models/filters";
import { AVAILABILITY_OPTIONS, Availability } from "@/models/user";
import { useState } from "react";

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

        {/* TODO: Category filter removed until API supports it */}

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
