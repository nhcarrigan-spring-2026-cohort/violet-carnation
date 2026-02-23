"use client";

import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Separator } from "@/components/ui/separator";
import { Filters, SCOPE_OPTIONS } from "@/models/filters";
import { AVAILABILITY_OPTIONS, Availability } from "@/models/user";

const SCOPE_LABELS: Record<string, string> = {
  all: "All Events",
  myOrgs: "My Organizations",
  admin: "Admin Only",
};

interface FilterBarProps {
  filters: Filters;
  onChange: (filters: Filters) => void;
}

const FilterModal = ({ filters, onChange }: FilterBarProps) => {
  const handleAvailabilityToggle = (availability: Availability) => {
    const current = filters.availability || [];
    const updated = current.includes(availability)
      ? current.filter((a) => a !== availability)
      : [...current, availability];
    onChange({ ...filters, availability: updated.length > 0 ? updated : null });
  };

  return (
    <div className="flex flex-wrap items-center gap-x-6 gap-y-3 rounded-lg border bg-card px-4 py-3 text-sm">
      {/* Scope */}
      <div className="flex items-center gap-3">
        <span className="font-semibold text-muted-foreground whitespace-nowrap">Scope</span>
        <RadioGroup
          value={filters.scope ?? "all"}
          onValueChange={(value) => onChange({ ...filters, scope: value as Filters["scope"] })}
          className="flex items-center gap-3"
        >
          {SCOPE_OPTIONS.map((option) => (
            <div key={option} className="flex items-center gap-1.5">
              <RadioGroupItem value={option} id={`scope-${option}`} />
              <Label htmlFor={`scope-${option}`} className="cursor-pointer">
                {SCOPE_LABELS[option]}
              </Label>
            </div>
          ))}
        </RadioGroup>
      </div>

      <Separator orientation="vertical" className="h-5 hidden sm:block" />

      {/* TODO: Category filter removed until API supports it */}

      {/* Availability */}
      <div className="flex items-center gap-3">
        <span className="font-semibold text-muted-foreground whitespace-nowrap">Availability</span>
        <div className="flex flex-wrap items-center gap-3">
          {AVAILABILITY_OPTIONS.map((option) => (
            <div key={option} className="flex items-center gap-1.5">
              <Checkbox
                id={`avail-${option}`}
                checked={filters.availability?.includes(option) || false}
                onCheckedChange={() => handleAvailabilityToggle(option)}
              />
              <Label htmlFor={`avail-${option}`} className="cursor-pointer">
                {option}
              </Label>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default FilterModal;
