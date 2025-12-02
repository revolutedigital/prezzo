"use client";

import * as React from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";

export interface PriceRange {
  min: number | null;
  max: number | null;
}

interface PriceRangeFilterProps {
  value: PriceRange;
  onChange: (range: PriceRange) => void;
  currency?: string;
  minPlaceholder?: string;
  maxPlaceholder?: string;
  className?: string;
}

export function PriceRangeFilter({
  value,
  onChange,
  currency = "R$",
  minPlaceholder = "Mínimo",
  maxPlaceholder = "Máximo",
  className,
}: PriceRangeFilterProps) {
  const [localMin, setLocalMin] = React.useState(value.min?.toString() || "");
  const [localMax, setLocalMax] = React.useState(value.max?.toString() || "");

  const handleMinChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setLocalMin(val);
    const numVal = parseFloat(val);
    onChange({
      min: val && !isNaN(numVal) ? numVal : null,
      max: value.max,
    });
  };

  const handleMaxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setLocalMax(val);
    const numVal = parseFloat(val);
    onChange({
      min: value.min,
      max: val && !isNaN(numVal) ? numVal : null,
    });
  };

  const handleClear = () => {
    setLocalMin("");
    setLocalMax("");
    onChange({ min: null, max: null });
  };

  const hasValue = value.min !== null || value.max !== null;

  return (
    <div className={className}>
      <div className="flex items-center space-x-2">
        <div className="flex-1 space-y-1">
          <Label htmlFor="price-min" className="text-xs text-muted-foreground">
            Preço mínimo
          </Label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
              {currency}
            </span>
            <Input
              id="price-min"
              type="number"
              placeholder={minPlaceholder}
              value={localMin}
              onChange={handleMinChange}
              className="pl-10"
              min="0"
              step="0.01"
            />
          </div>
        </div>
        <div className="pt-6 text-muted-foreground">-</div>
        <div className="flex-1 space-y-1">
          <Label htmlFor="price-max" className="text-xs text-muted-foreground">
            Preço máximo
          </Label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
              {currency}
            </span>
            <Input
              id="price-max"
              type="number"
              placeholder={maxPlaceholder}
              value={localMax}
              onChange={handleMaxChange}
              className="pl-10"
              min="0"
              step="0.01"
            />
          </div>
        </div>
        {hasValue && (
          <Button
            variant="ghost"
            size="icon"
            className="mt-6 h-10 w-10"
            onClick={handleClear}
            title="Limpar filtro"
          >
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>
    </div>
  );
}
