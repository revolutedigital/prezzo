"use client";

import React, { useState, useEffect } from "react";
import Joyride, { Step, CallBackProps, STATUS, EVENTS } from "react-joyride";
import { usePathname } from "next/navigation";

interface TourGuideProps {
  children?: React.ReactNode;
}

// Tour steps for different pages
const TOURS: Record<string, Step[]> = {
  "/dashboard": [
    {
      target: "#dashboard-stats",
      content: "Aqui você vê um resumo dos seus dados: produtos, orçamentos e matérias-primas.",
      disableBeacon: true,
    },
    {
      target: "#recent-activity",
      content: "Acompanhe suas atividades recentes e ações importantes.",
    },
    {
      target: "#sidebar-produtos",
      content: "Navegue para a seção de Produtos para gerenciar seu catálogo.",
    },
    {
      target: "#sidebar-orcamentos",
      content: "Crie e gerencie seus orçamentos aqui.",
    },
  ],
  "/produtos": [
    {
      target: "#novo-produto-btn",
      content: "Clique aqui para criar um novo produto composto.",
      disableBeacon: true,
    },
    {
      target: "#produtos-table",
      content:
        "Veja todos os seus produtos cadastrados. Você pode editar, duplicar ou excluir produtos.",
    },
    {
      target: "#search-produtos",
      content: "Use a busca para encontrar produtos rapidamente.",
    },
  ],
  "/materias-primas": [
    {
      target: "#nova-materia-prima-btn",
      content: "Adicione novas matérias-primas que serão usadas nos seus produtos.",
      disableBeacon: true,
    },
    {
      target: "#materias-primas-table",
      content:
        "Gerencie todas as suas matérias-primas aqui. O sistema rastreia preços e fornecedores.",
    },
  ],
  "/orcamentos": [
    {
      target: "#novo-orcamento-btn",
      content: "Crie um novo orçamento para seus clientes.",
      disableBeacon: true,
    },
    {
      target: "#orcamentos-table",
      content: "Veja todos os orçamentos. Você pode enviar, aprovar ou exportar como PDF.",
    },
    {
      target: "#status-filter",
      content: "Filtre orçamentos por status: rascunho, enviado ou aprovado.",
    },
  ],
  "/prezzo-ai": [
    {
      target: "#prezzo-ai-upload",
      content:
        "Use o Prezzo AI para extrair dados de notas fiscais automaticamente. Basta fazer upload do PDF!",
      disableBeacon: true,
    },
    {
      target: "#historico-processamento",
      content: "Veja o histórico de todas as notas fiscais processadas.",
    },
  ],
  "/relatorios": [
    {
      target: "#relatorios-tabs",
      content:
        "Explore diferentes tipos de relatórios: margens, rentabilidade e evolução de custos.",
      disableBeacon: true,
    },
    {
      target: "#export-relatorio",
      content: "Exporte seus relatórios em PDF ou Excel para análise externa.",
    },
  ],
};

export function TourGuide({ children }: TourGuideProps) {
  const pathname = usePathname();
  const [run, setRun] = useState(false);
  const [stepIndex, setStepIndex] = useState(0);

  // Check if user has seen the tour for this page
  useEffect(() => {
    if (typeof window === "undefined") return;

    const tourKey = `tour_completed_${pathname}`;
    const hasSeenTour = localStorage.getItem(tourKey);

    if (!hasSeenTour && TOURS[pathname]) {
      // Small delay to ensure elements are rendered
      setTimeout(() => {
        setRun(true);
      }, 1000);
    }
  }, [pathname]);

  const handleJoyrideCallback = (data: CallBackProps) => {
    const { status, type, index } = data;

    if ([STATUS.FINISHED, STATUS.SKIPPED].includes(status as any)) {
      // Mark tour as completed
      const tourKey = `tour_completed_${pathname}`;
      localStorage.setItem(tourKey, "true");
      setRun(false);
      setStepIndex(0);
    } else if (type === EVENTS.STEP_AFTER) {
      setStepIndex(index + 1);
    }
  };

  const steps = TOURS[pathname] || [];

  if (steps.length === 0) {
    return <>{children}</>;
  }

  return (
    <>
      <Joyride
        steps={steps}
        run={run}
        continuous
        showProgress
        showSkipButton
        stepIndex={stepIndex}
        callback={handleJoyrideCallback}
        styles={{
          options: {
            primaryColor: "#2563eb",
            zIndex: 10000,
          },
        }}
        locale={{
          back: "Voltar",
          close: "Fechar",
          last: "Finalizar",
          next: "Próximo",
          skip: "Pular",
        }}
      />
      {children}
    </>
  );
}

/**
 * Hook to manually trigger tour
 */
export function useTourGuide() {
  const pathname = usePathname();

  const startTour = () => {
    const tourKey = `tour_completed_${pathname}`;
    localStorage.removeItem(tourKey);
    window.location.reload();
  };

  const resetAllTours = () => {
    Object.keys(TOURS).forEach((path) => {
      localStorage.removeItem(`tour_completed_${path}`);
    });
  };

  return {
    startTour,
    resetAllTours,
    hasTour: !!TOURS[pathname],
  };
}
