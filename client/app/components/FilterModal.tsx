"use client";

import React, { useState } from "react";
import { Filters } from "@/models/filters";
import { EVENT_CATEGORIES } from "@/models/eventCategories";

interface FilterModalProps {
  isOpen: boolean;
  onClose: () => void;
  filters: Filters;
  onApply: (filters: Filters) => void;
}

const FilterModal = ({ isOpen, onClose, filters, onApply }: FilterModalProps) => {
  const [localFilters, setLocalFilters] = useState(filters);
  const [selectedAvailability, setSelectedAvailability] = useState<string[]>([]);

  const handleAvailabilityToggle = (availability: string) => {
    if (selectedAvailability.includes(availability)) {
      setSelectedAvailability((prev) => prev.filter((a) => a !== availability));
    } else {
      setSelectedAvailability((prev) => [...prev, availability]);
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
            onChange={(e) =>
              setLocalFilters({ ...localFilters, category: e.target.value || null })
            }
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
        </fieldset>
        <button onClick={() => onApply(localFilters)}>Apply</button>
        <button onClick={onClose}>Cancel</button>
      </div>
    </div>
  );
};

export default FilterModal;
