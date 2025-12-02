"use client";

import { Button } from "@/components/ui/button";
import { HelpCircle } from "lucide-react";
import { useTourGuide } from "./tour-guide";

export function TourButton() {
  const { startTour, hasTour } = useTourGuide();

  if (!hasTour) return null;

  return (
    <Button variant="ghost" size="icon" onClick={startTour} title="Iniciar tour guiado">
      <HelpCircle className="h-5 w-5" />
    </Button>
  );
}
