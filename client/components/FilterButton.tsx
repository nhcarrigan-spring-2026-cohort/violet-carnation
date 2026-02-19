import React from "react";

const FilterButton = ({
  onClick,
  activeCount,
}: {
  onClick: () => void;
  activeCount: number;
}) => (
  <button onClick={onClick} className="flex items-center gap-2">
    🔍 Filters
    {activeCount > 0 && <span className="badge">{activeCount} active</span>}
  </button>
);

export default FilterButton;
