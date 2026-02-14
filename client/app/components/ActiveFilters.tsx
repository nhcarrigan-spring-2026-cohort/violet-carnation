import React from "react";
import { Filters } from "@/models/filters";

interface ActiveFiltersProps {
  filters: Filters;
  onRemove: (key: string) => void;
}

const ActiveFilters = ({ filters, onRemove }: ActiveFiltersProps) => {
  const activeFilters = [];

  if (filters.scope !== "all") {
    activeFilters.push({ key: "scope", label: `Scope: ${filters.scope}` });
  }
  if (filters.category) {
    activeFilters.push({ key: "category", label: filters.category });
  }

  if (filters.availability) {
    activeFilters.push({ key: "availability", label: filters.availability.join(", ") });
  }

  if (activeFilters.length === 0) return null;
  return (
    <div>
      {activeFilters.map((filter) => (
        <span key={filter.key} className="badge">
          {filter.label}
          <button onClick={() => onRemove(filter.key)}>×</button>
        </span>
      ))}
    </div>
  );
};

export default ActiveFilters;
