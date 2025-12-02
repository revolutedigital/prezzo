"use client";

import dynamic from "next/dynamic";
import { Skeleton } from "@/components/ui/skeleton";

// Lazy load dos gráficos pesados
export const LazyPieChart = dynamic(
  () => import("recharts").then((mod) => ({ default: mod.PieChart })),
  {
    loading: () => <Skeleton className="h-[300px] w-full" />,
    ssr: false,
  }
);

export const LazyLineChart = dynamic(
  () => import("recharts").then((mod) => ({ default: mod.LineChart })),
  {
    loading: () => <Skeleton className="h-[300px] w-full" />,
    ssr: false,
  }
);

export const LazyBarChart = dynamic(
  () => import("recharts").then((mod) => ({ default: mod.BarChart })),
  {
    loading: () => <Skeleton className="h-[300px] w-full" />,
    ssr: false,
  }
);

// Lazy load de PDF
export const LazyPDFPreview = dynamic(
  () =>
    import("@/components/ui/pdf-preview-dialog").then((mod) => ({ default: mod.PDFPreviewDialog })),
  {
    loading: () => <Skeleton className="h-[600px] w-full" />,
    ssr: false,
  }
);

// Nota: Storybook deve ser usado apenas em desenvolvimento via npm run storybook
// Não é necessário fazer lazy load do Storybook no código da aplicação
