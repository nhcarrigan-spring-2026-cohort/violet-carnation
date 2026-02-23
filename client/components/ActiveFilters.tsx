import { Badge } from "@/components/ui/badge";
import { Filters } from "@/models/filters";
import { X } from "lucide-react";

const SCOPE_LABELS: Record<string, string> = {
  myOrgs: "My Organizations",
  admin: "Admin Only",
};

interface ActiveFiltersProps {
  filters: Filters;
  onRemove: (key: string) => void;
}

const ActiveFilters = ({ filters, onRemove }: ActiveFiltersProps) => {
  const activeFilters: { key: string; label: string }[] = [];

  if (filters.scope !== "all" && filters.scope) {
    activeFilters.push({
      key: "scope",
      label: `Scope: ${SCOPE_LABELS[filters.scope] ?? filters.scope}`,
    });
  }

  if (filters.availability) {
    activeFilters.push({
      key: "availability",
      label: `Availability: ${filters.availability.join(", ")}`,
    });
  }

  if (activeFilters.length === 0) return null;

  return (
    <div className="flex flex-wrap gap-2 mt-2">
      {activeFilters.map((filter) => (
        <Badge
          key={filter.key}
          variant="secondary"
          className="flex items-center gap-1 pr-1"
        >
          {filter.label}
          <button
            onClick={() => onRemove(filter.key)}
            className="ml-1 rounded-full hover:bg-muted-foreground/20 p-0.5"
            aria-label={`Remove ${filter.label} filter`}
          >
            <X className="h-3 w-3" />
          </button>
        </Badge>
      ))}
    </div>
  );
};

export default ActiveFilters;
