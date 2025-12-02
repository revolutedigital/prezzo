"use client";

import { ReactNode } from "react";

interface TourGuideProps {
  children: ReactNode;
}

/**
 * Tour Guide simplificado
 *
 * Nota: A implementação completa com react-joyride não é compatível com React 19.
 * Esta é uma versão placeholder que pode ser expandida com uma solução customizada
 * ou aguardar atualização da biblioteca react-joyride.
 *
 * Para implementar um tour completo no futuro, considere:
 * - Criar tooltips customizados com Radix UI Popover
 * - Usar uma biblioteca alternativa compatível com React 19
 * - Implementar uma solução custom com state management
 */
export function TourGuide({ children }: TourGuideProps) {
  // Por enquanto, apenas renderiza os children sem tour
  return <>{children}</>;
}

/**
 * Hook placeholder para controle manual do tour
 */
export function useTourGuide() {
  return {
    startTour: () => {
      console.log("Tour guide não disponível - aguardando compatibilidade com React 19");
    },
    resetAllTours: () => {
      console.log("Tour guide não disponível - aguardando compatibilidade com React 19");
    },
    hasTour: false,
  };
}
