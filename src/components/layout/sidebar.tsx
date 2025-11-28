"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  FileText,
  TrendingUp,
  Settings,
  Sparkles,
  Wrench,
} from "lucide-react";

const menuItems = [
  {
    title: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    title: "Matérias-Primas",
    href: "/materias-primas",
    icon: Package,
  },
  {
    title: "Mão de Obra",
    href: "/mao-de-obra",
    icon: Wrench,
  },
  {
    title: "Produtos",
    href: "/produtos",
    icon: ShoppingCart,
  },
  {
    title: "Orçamentos",
    href: "/orcamentos",
    icon: FileText,
  },
  {
    title: "Prezzo AI",
    href: "/prezzo-ai",
    icon: Sparkles,
    badge: "IA",
  },
  {
    title: "Relatórios",
    href: "/relatorios",
    icon: TrendingUp,
  },
  {
    title: "Configurações",
    href: "/configuracoes",
    icon: Settings,
  },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <div className="flex h-full w-64 flex-col border-r bg-card">
      {/* Logo */}
      <div className="flex h-16 items-center border-b px-6">
        <Link href="/dashboard" className="flex items-center gap-2">
          <div className="text-2xl font-heading font-bold text-primary">Prezzo</div>
        </Link>
      </div>

      {/* Menu */}
      <nav className="flex-1 space-y-1 p-4">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href || pathname?.startsWith(item.href + "/");

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                isActive
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
              )}
            >
              <Icon className="h-5 w-5" />
              <span className="flex-1">{item.title}</span>
              {item.badge && (
                <span className="rounded-full bg-success px-2 py-0.5 text-xs font-semibold text-white">
                  {item.badge}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="border-t p-4">
        <div className="text-xs text-muted-foreground">
          <p className="font-medium">Prezzo v0.1.0</p>
          <p>Sistema de Precificação</p>
        </div>
      </div>
    </div>
  );
}
