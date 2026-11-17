"use client";

import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { format, isSameDay, isSameMonth, parseISO } from "date-fns";
import { CalendarCheck, ChevronLeft, ChevronRight } from "@/components/icons";
import { EmptyState } from "@/components/ui/empty-state";
import { cn } from "@/lib/utils/cn";
import { shiftReferenceDate, type CalendarItem, type CalendarView } from "@/lib/certificates/calendar";

const CATEGORY_LABELS: Record<CalendarItem["category"], string> = {
  certificados: "Certificados",
  alvaras: "Alvarás",
};

const CATEGORY_DOT_CLASSES: Record<CalendarItem["category"], string> = {
  certificados: "bg-[#4b5fb8]",
  alvaras: "bg-[#b58a1f]",
};

const CATEGORY_CHIP_CLASSES: Record<CalendarItem["category"], string> = {
  certificados: "border-line bg-white text-slate-700 hover:border-line-strong",
  alvaras: "border-line bg-white text-slate-700 hover:border-line-strong",
};

const CATEGORY_SOLID_CLASSES: Record<CalendarItem["category"], string> = {
  certificados: "bg-[#EEF2FF] text-[#3B4A9E] shadow-[inset_2px_0_0_#4b5fb8] hover:bg-[#E0E7FF]",
  alvaras: "bg-[#FFFBEB] text-[#8A6414] shadow-[inset_2px_0_0_#b58a1f] hover:bg-[#FEF3C7]",
};

function formatDate(value: string): string {
  const [year, month, day] = value.split("-");
  return `${day}/${month}/${year}`;
}

export function VencimentosCalendar({
  view,
  referenceDate,
  showOverdue,
  display,
  days,
  monthLabel,
  items,
}: {
  view: CalendarView;
  referenceDate: string;
  showOverdue: boolean;
  display: "calendar" | "list";
  days: string[];
  monthLabel: string;
  items: CalendarItem[];
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const today = format(new Date(), "yyyy-MM-dd");
  const hiddenCategories = new Set(
    (searchParams.get("hideCategories") ?? "").split(",").filter(Boolean)
  );

  function pushParams(overrides: Record<string, string | undefined>) {
    const params = new URLSearchParams(searchParams.toString());
    for (const [key, value] of Object.entries(overrides)) {
      if (value === undefined) params.delete(key);
      else params.set(key, value);
    }
    router.push(`?${params.toString()}`);
  }

  function navigate(direction: 1 | -1) {
    const next = shiftReferenceDate(view, parseISO(referenceDate), direction);
    pushParams({ date: format(next, "yyyy-MM-dd") });
  }

  function toggleCategory(category: string) {
    const next = new Set(hiddenCategories);
    if (next.has(category)) next.delete(category);
    else next.add(category);
    pushParams({ hideCategories: next.size > 0 ? [...next].join(",") : undefined });
  }

  const visibleItems = items.filter((item) => !hiddenCategories.has(item.category));
  const itemsByDate = new Map<string, CalendarItem[]>();
  for (const item of visibleItems) {
    const list = itemsByDate.get(item.date) ?? [];
    list.push(item);
    itemsByDate.set(item.date, list);
  }

  return (
    <div className="card overflow-hidden">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-line px-5 py-3.5">
        <div className="flex items-center gap-1">
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="icon-btn"
          title="Anterior"
          aria-label="Período anterior"
        >
          <ChevronLeft size={16} />
        </button>
        <p className="min-w-44 text-center text-[15px] font-semibold capitalize tracking-[-0.01em] text-[#141d28]">{monthLabel}</p>
        <button
          type="button"
          onClick={() => navigate(1)}
          className="icon-btn"
          title="Próximo"
          aria-label="Próximo período"
        >
          <ChevronRight size={16} />
        </button>
        </div>

        <div className="seg">
          <button
            type="button"
            onClick={() => pushParams({ date: today })}
            className="seg-item"
          >
            Hoje
          </button>
          <button
            type="button"
            onClick={() => pushParams({ view: "month" })}
            aria-pressed={view === "month"}
            className="seg-item"
          >
            Mês
          </button>
          <button
            type="button"
            onClick={() => pushParams({ view: "week" })}
            aria-pressed={view === "week"}
            className="seg-item"
          >
            Semana
          </button>
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-line px-5 py-2.5 text-xs">
        <div className="seg">
          <button
            type="button"
            onClick={() => pushParams({ display: "calendar" })}
            aria-pressed={display === "calendar"}
            className="seg-item"
          >
            Calendário
          </button>
          <button
            type="button"
            onClick={() => pushParams({ display: "list" })}
            aria-pressed={display === "list"}
            className="seg-item"
          >
            Lista
          </button>
        </div>

        <div className="flex flex-wrap items-center gap-2">
        {(Object.keys(CATEGORY_LABELS) as CalendarItem["category"][]).map((category) => (
          <button
            key={category}
            type="button"
            onClick={() => toggleCategory(category)}
            aria-pressed={!hiddenCategories.has(category)}
            className={cn(
              "flex h-7 items-center gap-1.5 rounded-full border px-2.5 text-xs font-medium transition-[opacity,border-color]",
              CATEGORY_CHIP_CLASSES[category],
              hiddenCategories.has(category) && "opacity-45"
            )}
          >
            <span className={cn("h-1.5 w-1.5 rounded-full", CATEGORY_DOT_CLASSES[category])} />
            {CATEGORY_LABELS[category]}
          </button>
        ))}
        <label className="flex h-7 cursor-pointer items-center gap-1.5 rounded-full border border-line px-2.5 font-medium text-slate-600 hover:border-line-strong">
          <input
            type="checkbox"
            checked={showOverdue}
            onChange={(e) => pushParams({ showOverdue: e.target.checked ? "true" : undefined })}
            className="h-3.5 w-3.5 rounded border-slate-300"
          />
          Mostrar vencidos
        </label>
        </div>
      </div>

      {display === "list" ? (
        <div className="max-h-[32rem] divide-y divide-[rgba(15,23,42,.08)] overflow-y-auto">
          {visibleItems.length === 0 ? (
            <EmptyState icon={CalendarCheck} title="Nenhum vencimento no período" description="Mude o período ou marque “Mostrar vencidos” para ver pendências antigas." />
          ) : (
            [...visibleItems]
              .sort((a, b) => a.date.localeCompare(b.date))
              .map((item) => (
                <Link
                  key={item.id}
                  href={item.href}
                  className="flex items-center justify-between gap-3 px-5 py-3 transition-colors hover:bg-[#F8FAFC]"
                >
                  <span className="flex min-w-0 items-center gap-2">
                    <span className={cn("h-1.5 w-1.5 shrink-0 rounded-full", CATEGORY_DOT_CLASSES[item.category])} />
                    <span className="truncate text-[13px] text-[#141d28]">{item.label}</span>
                  </span>
                  <span className="shrink-0 text-xs tabular-nums text-slate-500">{formatDate(item.date)}</span>
                </Link>
              ))
          )}
        </div>
      ) : (
        <div className="grid grid-cols-7 text-xs">
          {["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"].map((weekday) => (
            <div
              key={weekday}
              className="border-b border-line bg-[#F8FAFC] px-2 py-2 text-center text-[11px] font-semibold uppercase tracking-[.05em] text-[#6d7885]"
            >
              {weekday}.
            </div>
          ))}
          {days.map((day) => {
            const dayItems = itemsByDate.get(day) ?? [];
            const inCurrentMonth = view === "week" || isSameMonth(parseISO(day), parseISO(referenceDate));
            const isCurrentDay = isSameDay(parseISO(day), parseISO(today));
            return (
              <div
                key={day}
                className={cn(
                  "min-h-28 border-b border-r border-line p-2 [&:nth-child(7n)]:border-r-0",
                  !inCurrentMonth && "bg-[#FAFBFC]"
                )}
              >
                <p
                  className={cn(
                    "mb-1.5 inline-flex h-6 min-w-6 items-center justify-center rounded-full px-1 text-xs font-medium tabular-nums",
                    isCurrentDay ? "bg-[#d95a08] font-semibold text-white" : "text-slate-600",
                    !inCurrentMonth && !isCurrentDay && "text-slate-400/70"
                  )}
                >
                  {format(parseISO(day), "d")}
                </p>
                <div className="max-h-20 space-y-1 overflow-y-auto">
                  {dayItems.map((item) => (
                    <Link
                      key={item.id}
                      href={item.href}
                      title={item.label}
                      className={cn(
                        "block truncate rounded px-1.5 py-1 text-[11px] font-medium transition-colors",
                        CATEGORY_SOLID_CLASSES[item.category]
                      )}
                    >
                      {item.label}
                    </Link>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

