import Link from "next/link";
import type { Icon } from "@/components/icons";
import { cn } from "@/lib/utils/cn";

export interface ModuleCardDef {
  key: string;
  label: string;
  value: number;
  icon: Icon;
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
            className="card card-link group flex items-center justify-between gap-3 px-5 py-4"
          >
            <span>
              <span className="block text-xs font-medium text-[#6d7885]">{card.label}</span>
              <span className="kpi-value block">{card.value.toLocaleString("pt-BR")}</span>
              <span className="mt-1 inline-flex items-center gap-1 text-xs font-medium text-[#b94700] opacity-0 transition-opacity group-hover:opacity-100 group-focus-visible:opacity-100">
                Abrir <span aria-hidden="true" className="transition-transform group-hover:translate-x-0.5">→</span>
              </span>
            </span>
            <span className={cn("flex h-9 w-9 shrink-0 items-center justify-center self-start rounded-md", card.colorClasses)}>
              <Icon size={18} strokeWidth={1.7} />
            </span>
          </Link>
        );
      })}
    </div>
  );
}
