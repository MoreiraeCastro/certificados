import Link from "next/link";
import { cn } from "@/lib/utils/cn";
import type { StatusCounts } from "@/lib/certificates/queries";

interface CardDef {
  key: string;
  label: string;
  value: number;
  activeClasses: string;
  bgClasses: string;
  query: URLSearchParams;
}

export function StatusCards({
  counts,
  currentQuery,
  activeStatus,
  activeArchived,
}: {
  counts: StatusCounts;
  currentQuery: string;
  activeStatus?: string;
  activeArchived?: string;
}) {
  function buildQuery(overrides: Record<string, string | undefined>) {
    const params = new URLSearchParams(currentQuery);
    params.delete("status");
    params.delete("archived");
    params.delete("page");
    for (const [key, value] of Object.entries(overrides)) {
      if (value === undefined) params.delete(key);
      else params.set(key, value);
    }
    return params;
  }

  const cards: CardDef[] = [
    {
      key: "active",
      label: "Ativos",
      value: counts.active,
      activeClasses: "after:bg-[#0F172A]",
      bgClasses: "bg-[#94A3B8]",
      query: buildQuery({ archived: "false" }),
    },
    {
      key: "em_dia",
      label: "Em dia",
      value: counts.em_dia,
      activeClasses: "after:bg-[#1b7a51]",
      bgClasses: "bg-[#1b7a51]",
      query: buildQuery({ status: "EM_DIA" }),
    },
    {
      key: "vencendo",
      label: "Vencendo",
      value: counts.vencendo,
      activeClasses: "after:bg-[#97600a]",
      bgClasses: "bg-[#c98a1a]",
      query: buildQuery({ status: "VENCENDO" }),
    },
    {
      key: "vencido",
      label: "Vencidos",
      value: counts.vencido,
      activeClasses: "after:bg-[#b03a3a]",
      bgClasses: "bg-[#b03a3a]",
      query: buildQuery({ status: "VENCIDO" }),
    },
    {
      key: "arquivado",
      label: "Arquivados",
      value: counts.arquivado,
      activeClasses: "after:bg-[#64748B]",
      bgClasses: "bg-[#CBD5E1]",
      query: buildQuery({ archived: "true" }),
    },
  ];

  return (
    <div className="kpis">
      {cards.map((card) => {
        const isActive =
          (card.key === "active" && activeArchived === "false") ||
          (card.key === "arquivado" && activeArchived === "true") ||
          (card.key !== "active" && card.key !== "arquivado" && activeStatus === card.query.get("status"));

        return (
          <Link
            key={card.key}
            href={`?${card.query.toString()}`}
            aria-current={isActive ? "true" : undefined}
            className={cn("kpi", isActive && ["is-active", card.activeClasses])}
          >
            <p className="kpi-label">
              <span className={cn("kpi-dot", card.bgClasses)} aria-hidden="true" />
              {card.label}
            </p>
            <p className="kpi-value">{card.value.toLocaleString("pt-BR")}</p>
          </Link>
        );
      })}
    </div>
  );
}
