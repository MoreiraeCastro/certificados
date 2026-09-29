import Link from "next/link";
import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils/cn";

export interface ModuleCardDef {
  key: string;
  label: string;
  value: number;
  icon: LucideIcon;
  href: string;
  colorClasses: string;
}

/**
 * One card per module. Only "Certificados" exists today -- Alvarás enters
 * later by adding an entry to this same array, no layout change needed.
 */
export function ModuleCards({ cards }: { cards: ModuleCardDef[] }) {
  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
      {cards.map((card) => {
        const Icon = card.icon;
        return (
          <Link
            key={card.key}
            href={card.href}
            className="flex items-center justify-between gap-3 rounded-lg border border-slate-200 bg-white px-5 py-4 shadow-sm transition-colors hover:border-slate-400"
          >
            <span>
              <span className="block text-xs font-medium uppercase tracking-wide text-slate-500">{card.label}</span>
              <span className="mt-1 block text-3xl font-bold text-slate-900">{card.value.toLocaleString("pt-BR")}</span>
            </span>
            <span className={cn("flex h-12 w-12 shrink-0 items-center justify-center rounded-xl", card.colorClasses)}>
              <Icon size={22} strokeWidth={2} />
            </span>
          </Link>
        );
      })}
    </div>
  );
}
