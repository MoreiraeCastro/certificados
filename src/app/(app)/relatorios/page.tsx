import Link from "next/link";
import { Plus, Trash2 } from "@/components/icons";
import { createClient } from "@/lib/supabase/server";
import { resolveDueQuickFilter } from "@/lib/certificates/filters";
import { deleteReportPreset } from "@/lib/reports/presets";
import type { ReportPreset } from "@/lib/types/database";

export const dynamic = "force-dynamic";

function link(base: "companies" | "certificates", params: Record<string, string>): string {
  const search = new URLSearchParams({ base, ...params });
  return `/relatorios/novo?${search.toString()}`;
}

const PREBUILT_GROUPS: { title: string; reports: { label: string; href: string }[] }[] = [
  {
    title: "Empresas",
    reports: [
      { label: "Todos os clientes", href: link("companies", {}) },
      { label: "Empresas ativas", href: link("companies", { active: "true" }) },
      { label: "Empresas inativas", href: link("companies", { active: "false" }) },
      { label: "Empresas importadas recentemente", href: link("companies", { origin: "import", sort: "created_at", dir: "desc" }) },
      { label: "Clientes sem certificado cadastrado", href: "/relatorios/sem-certificado" },
      { label: "Empresas com mais de um certificado", href: "/relatorios/multiplos-certificados" },
    ],
  },
  {
    title: "Certificados por status",
    reports: [
      { label: "Todos os certificados", href: link("certificates", {}) },
      { label: "Certificados ativos", href: link("certificates", { archived: "false" }) },
      { label: "Certificados em dia", href: link("certificates", { status: "EM_DIA" }) },
      { label: "Certificados vencendo", href: link("certificates", { status: "VENCENDO" }) },
      { label: "Certificados vencidos", href: link("certificates", { status: "VENCIDO" }) },
      { label: "Certificados arquivados", href: link("certificates", { archived: "true" }) },
      { label: "Certificados A1", href: link("certificates", { model: "A1" }) },
      { label: "Certificados A3", href: link("certificates", { model: "A3" }) },
      { label: "Certificados cadastrados recentemente", href: link("certificates", { sort: "created_at", dir: "desc" }) },
    ],
  },
  {
    title: "Certificados por vencimento",
    reports: (
      [
        ["today", "Vencem hoje"],
        ["next_7", "Próximos 7 dias"],
        ["next_15", "Próximos 15 dias"],
        ["next_30", "Próximos 30 dias"],
        ["next_60", "Próximos 60 dias"],
        ["next_90", "Próximos 90 dias"],
        ["this_month", "Vencem este mês"],
        ["next_month", "Vencem no próximo mês"],
      ] as const
    ).map(([key, label]) => {
      const { dueFrom, dueTo } = resolveDueQuickFilter(key);
      return { label, href: link("certificates", { dueFrom, dueTo }) };
    }),
  },
  {
    title: "Histórico e auditoria",
    reports: [
      { label: "Histórico de certificados renovados", href: "/relatorios/renovacoes" },
      { label: "Alterações realizadas por usuários", href: "/relatorios/auditoria" },
      { label: "Relatório de importações", href: "/importar/historico" },
    ],
  },
];

export default async function ReportsPage() {
  const supabase = await createClient();
  const { data: presets } = await supabase
    .from("report_presets")
    .select("*")
    .order("created_at", { ascending: false });

  const rows = (presets ?? []) as ReportPreset[];

  return (
    <div className="space-y-8">
      <div className="page-header">
        <div className="min-w-0">
          <h1 className="page-title">Relatórios</h1>
          <p className="page-subtitle">Relatórios prontos ou monte o seu no construtor de relatórios.</p>
        </div>
        <Link
          href="/relatorios/novo"
          className="btn btn-primary"
        >
          <Plus size={14} /> Novo relatório
        </Link>
      </div>

      {rows.length > 0 && (
        <section>
          <h2 className="card-title mb-2.5">Relatórios salvos</h2>
          <div className="card divide-y divide-[rgba(15,23,42,.08)] overflow-hidden">
            {rows.map((preset) => {
              const params = new URLSearchParams({ base: preset.base, ...preset.filters as Record<string, string> });
              if (preset.columns?.length) params.set("cols", preset.columns.join(","));
              if (preset.order_by && "field" in preset.order_by) {
                params.set("sort", preset.order_by.field);
                params.set("dir", preset.order_by.direction);
              }
              return (
                <div key={preset.id} className="flex items-center justify-between px-4 py-3 transition-colors hover:bg-[#F8FAFC]">
                  <div>
                    <p className="text-[13.5px] font-medium text-[#141d28]">{preset.name}</p>
                    <p className="text-xs text-slate-500">
                      {preset.base === "companies" ? "Empresas" : "Certificados"}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <Link href={`/relatorios/novo?${params.toString()}`} className="link text-xs">
                      Abrir
                    </Link>
                    <form action={deleteReportPreset.bind(null, preset.id)}>
                      <button type="submit" className="icon-btn !h-7 !w-7 hover:!text-[#b03a3a]" title="Excluir" aria-label="Excluir">
                        <Trash2 size={14} />
                      </button>
                    </form>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {PREBUILT_GROUPS.map((group) => (
        <section key={group.title}>
          <h2 className="card-title mb-2.5">{group.title}</h2>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-4">
            {group.reports.map((report) => (
              <Link
                key={report.label}
                href={report.href}
                className="card card-link group flex items-center justify-between gap-2 px-4 py-3 text-[13px] font-medium text-slate-700"
              >
                {report.label}
                <span aria-hidden="true" className="text-slate-300 transition-[transform,color] group-hover:translate-x-0.5 group-hover:text-[#d95a08]">→</span>
              </Link>
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}
