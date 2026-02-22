"use client";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Sheet,
  SheetContent,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Filters, SCOPE_OPTIONS } from "@/models/filters";
import { AVAILABILITY_OPTIONS, Availability } from "@/models/user";
import { useState } from "react";

const SCOPE_LABELS: Record<string, string> = {
  all: "All Events",
  myOrgs: "My Organizations",
  admin: "Admin Only",
};

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
    <Sheet open onOpenChange={(open) => !open && onClose()}>
      <SheetContent side="right" className="w-80">
        <SheetHeader>
          <SheetTitle>Filters</SheetTitle>
        </SheetHeader>

        <div className="flex flex-col gap-6 mt-6 px-1">
          {/* Scope */}
          <div className="flex flex-col gap-3">
            <p className="text-sm font-semibold">Scope</p>
            <RadioGroup
              value={localFilters.scope}
              onValueChange={(value) =>
                setLocalFilters({ ...localFilters, scope: value as Filters["scope"] })
              }
              className="flex flex-col gap-2"
            >
              {SCOPE_OPTIONS.map((option) => (
                <div key={option} className="flex items-center gap-2">
                  <RadioGroupItem value={option} id={`scope-${option}`} />
                  <Label htmlFor={`scope-${option}`}>{SCOPE_LABELS[option]}</Label>
                </div>
              ))}
            </RadioGroup>
          </div>

          {/* TODO: Category filter removed until API supports it */}

          {/* Availability */}
          <div className="flex flex-col gap-3">
            <p className="text-sm font-semibold">Availability</p>
            <div className="flex flex-col gap-2">
              {AVAILABILITY_OPTIONS.map((option) => (
                <div key={option} className="flex items-center gap-2">
                  <Checkbox
                    id={`avail-${option}`}
                    checked={localFilters.availability?.includes(option) || false}
                    onCheckedChange={() => handleAvailabilityToggle(option)}
                  />
                  <Label htmlFor={`avail-${option}`}>{option}</Label>
                </div>
              ))}
            </div>
          </div>
        </div>

        <SheetFooter className="mt-8 flex gap-2">
          <Button variant="outline" onClick={onClose} className="flex-1">
            Cancel
          </Button>
          <Button onClick={() => onApply(localFilters)} className="flex-1">
            Apply
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
};

export default FilterModal;
