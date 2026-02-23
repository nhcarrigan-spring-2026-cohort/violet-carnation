"use client";

import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Separator } from "@/components/ui/separator";
import { EVENT_CATEGORIES, EventCategory } from "@/models/eventCategories";
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
  const handleCategoryToggle = (category: EventCategory) => {
    const current = filters.category || [];
    const updated = current.includes(category)
      ? current.filter((c) => c !== category)
      : [...current, category];
    onChange({ ...filters, category: updated.length > 0 ? updated : null });
  };

  return (
    <div className="flex flex-wrap items-center gap-x-6 gap-y-3 rounded-lg border bg-card px-4 py-3 text-sm">
      {/* Scope */}
      <div className="flex items-center gap-3">
        <span className="font-semibold text-muted-foreground whitespace-nowrap">
          Scope
        </span>
        <RadioGroup
          value={filters.scope ?? "all"}
          onValueChange={(value) =>
            onChange({ ...filters, scope: value as Filters["scope"] })
          }
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

      {/* Category */}
      <div className="flex items-center gap-3">
        <span className="font-semibold text-muted-foreground whitespace-nowrap">
          Category
        </span>
        <div className="flex flex-wrap items-center gap-3">
          {EVENT_CATEGORIES.map((option) => (
            <div key={option} className="flex items-center gap-1.5">
              <Checkbox
                id={`cat-${option}`}
                checked={filters.category?.includes(option) || false}
                onCheckedChange={() => handleCategoryToggle(option)}
              />
              <Label htmlFor={`cat-${option}`} className="cursor-pointer">
                {option}
              </Label>
            </div>
          ))}
        </div>
      </div>

      <Separator orientation="vertical" className="h-5 hidden sm:block" />

      {/* Location */}
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

      <Separator orientation="vertical" className="h-5 hidden sm:block" />

      {/* Availability */}
      <div className="flex items-center gap-3">
        <span className="font-semibold text-muted-foreground whitespace-nowrap">
          Availability
        </span>
        <RadioGroup
          value={filters.availability ?? ""}
          onValueChange={(value) =>
            onChange({
              ...filters,
              availability: value ? (value as Availability) : null,
            })
          }
          className="flex flex-wrap items-center gap-3"
        >
          <div className="flex items-center gap-1.5">
            <RadioGroupItem value="" id="avail-none" />
            <Label htmlFor="avail-none" className="cursor-pointer">
              Any
            </Label>
          </div>
          {AVAILABILITY_OPTIONS.map((option) => (
            <div key={option} className="flex items-center gap-1.5">
              <RadioGroupItem value={option} id={`avail-${option}`} />
              <Label htmlFor={`avail-${option}`} className="cursor-pointer">
                {option}
              </Label>
            </div>
          ))}
        </RadioGroup>
      </div>
    </div>
  );
};

export default FilterModal;
