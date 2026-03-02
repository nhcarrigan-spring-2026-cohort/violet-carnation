"use client";

import { Checkbox } from "@/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Separator } from "@/components/ui/separator";
import { EVENT_CATEGORIES, EventCategory } from "@/models/eventCategories";
import { Filters, SCOPE_OPTIONS } from "@/models/filters";
import { AVAILABILITY_OPTIONS, Availability } from "@/models/user";
import { ChevronDown } from "lucide-react";

const SCOPE_LABELS: Record<string, string> = {
  all: "All Events",
  myOrgs: "My Organizations",
  admin: "Admin Only",
};

interface FilterBarProps {
  filters: Filters;
  onChange: (filters: Filters) => void;
}

const FilterBar = ({ filters, onChange }: FilterBarProps) => {
  const handleAvailabilityToggle = (availability: Availability) => {
    const current = filters.availability || [];
    const updated = current.includes(availability)
      ? current.filter((a) => a !== availability)
      : [...current, availability];
    onChange({ ...filters, availability: updated.length > 0 ? updated : null });
  };

  const handleCategoryToggle = (category: EventCategory) => {
    const current = filters.categories || [];
    const updated = current.includes(category)
      ? current.filter((c) => c !== category)
      : [...current, category];
    onChange({ ...filters, categories: updated.length > 0 ? updated : null });
  };

  return (
    <div className="flex flex-col gap-3 rounded-lg border bg-card px-4 py-3 text-sm">
      {/* Top row: Scope + Availability */}
      <div className="flex flex-wrap items-center gap-x-6 gap-y-3">
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

        <Separator />

        {/* Availability */}
        <div className="flex items-center gap-3">
          <span className="font-semibold text-muted-foreground whitespace-nowrap">
            Availability
          </span>
          <div className="flex flex-wrap items-center gap-3">
            {AVAILABILITY_OPTIONS.map((option) => (
              <div key={option} className="flex items-center gap-1.5">
                <Checkbox
                  // force them to look more like checkboxes, as you can pick multiple
                  // idk why they look like radial buttons which is confusing.
                  style={{ borderRadius: "2px" }}
                  id={`avail-${option}`}
                  checked={filters.availability?.includes(option) ?? false}
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

      <Separator />

      {/* Bottom row: Category */}
      <div className="flex items-center gap-3">
        <span className="font-semibold text-muted-foreground whitespace-nowrap">
          Category
        </span>
        <DropdownMenu>
          <DropdownMenuTrigger className="flex items-center gap-1.5 rounded-md border px-3 py-1.5 text-sm hover:bg-accent focus:outline-none">
            {filters.categories && filters.categories.length > 0
              ? `${filters.categories.length} selected`
              : "All categories"}
            <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="max-h-72 overflow-y-auto">
            {EVENT_CATEGORIES.map((category) => (
              <DropdownMenuCheckboxItem
                key={category}
                checked={filters.categories?.includes(category) ?? false}
                onSelect={(e) => e.preventDefault()}
                onCheckedChange={() => handleCategoryToggle(category)}
              >
                {category}
              </DropdownMenuCheckboxItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
};

export default FilterBar;
