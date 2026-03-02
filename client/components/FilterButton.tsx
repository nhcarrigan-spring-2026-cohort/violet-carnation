import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { SlidersHorizontal } from "lucide-react";

const FilterButton = ({
  onClick,
  activeCount,
}: {
  onClick: () => void;
  activeCount: number;
}) => (
  <Button variant="outline" onClick={onClick} className="flex items-center gap-2">
    <SlidersHorizontal className="h-4 w-4" />
    Filters
    {activeCount > 0 && (
      <Badge variant="secondary" className="ml-1">
        {activeCount}
      </Badge>
    )}
  </Button>
);

export default FilterButton;
