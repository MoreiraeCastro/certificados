import { Building2 } from "@/components/icons";
import { EmptyState } from "@/components/ui/empty-state";
import Link from "next/link";
import { ClickableRow } from "@/components/ui/clickable-row";
import { createClient } from "@/lib/supabase/server";
import { parseCompanyFilters, listCompanies } from "@/lib/companies/queries";
import { getCertificateThresholds } from "@/lib/settings/thresholds";
import { formatDocument } from "@/lib/documents/document";
import { Input, Select } from "@/components/ui/input";
import { Pagination } from "@/components/dashboard/pagination";
import { NewCompanyModal } from "@/components/companies/new-company-modal";

export const dynamic = "force-dynamic";

type SearchParams = Record<string, string | string[] | undefined>;

export default async function CompaniesPage({ searchParams }: { searchParams: Promise<SearchParams> }) {
  const params = await searchParams;
  const filters = parseCompanyFilters(params);
  const supabase = await createClient();
  const [{ rows, total }, thresholds, { data: users }] = await Promise.all([
    listCompanies(supabase, filters),
    getCertificateThresholds(supabase),
    supabase.from("profiles").select("id, full_name").eq("active", true).order("full_name"),
  ]);

  const currentQuery = new URLSearchParams(
    Object.entries(params).flatMap(([key, value]) =>
      value === undefined ? [] : Array.isArray(value) ? value.map((v) => [key, v] as [string, string]) : [[key, value] as [string, string]]
    )
  ).toString();

  return (
    <div className="space-y-4">
      <div className="page-header">
        <div className="min-w-0">
          <h1 className="page-title">Clientes</h1>
          <p className="page-subtitle">Cadastro dos clientes do escritório.</p>
        </div>
        <NewCompanyModal defaultWarningDays={thresholds.warning_days} users={users ?? []} />
      </div>

      <form className="flex flex-wrap items-end gap-3 card p-4" method="get">
        <div className="min-w-[220px] flex-1">
          <label className="field-label">Nome, código ou CNPJ/CPF</label>
          <Input name="q" defaultValue={filters.q ?? ""} placeholder="Buscar..." />
        </div>
        <div className="w-40">
          <label className="field-label">Município</label>
          <Input name="municipality" defaultValue={filters.municipality ?? ""} />
        </div>
        <div className="w-24">
          <label className="field-label">UF</label>
          <Input name="uf" maxLength={2} defaultValue={filters.uf ?? ""} />
        </div>
        <div className="w-36">
          <label className="field-label">Situação</label>
          <Select name="active" defaultValue={filters.active === undefined ? "" : String(filters.active)}>
            <option value="">Todas</option>
            <option value="true">Ativas</option>
            <option value="false">Inativas</option>
          </Select>
        </div>
        <button
          type="submit"
          className="btn btn-primary"
        >
          Filtrar
        </button>
      </form>

      <div className="table-wrap">
        <table className="data-table min-w-max">
          <thead>
            <tr>
              <th>Código</th>
              <th>CNPJ/CPF</th>
              <th>Razão social</th>
              <th>Município</th>
              <th>UF</th>
              <th>Situação</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((company) => (
              <ClickableRow key={company.id} href={`/clientes/${company.id}`}>
                <td className="cell-strong">
                  <Link href={`/clientes/${company.id}`} className="hover:underline">
                    {company.code}
                  </Link>
                </td>
                <td>{formatDocument(company.document)}</td>
                <td>
                  <Link href={`/clientes/${company.id}`} className="hover:underline">
                    {company.corporate_name}
                  </Link>
                  {company.short_name && <span className="ml-1 text-xs text-slate-500">({company.short_name})</span>}
                </td>
                <td>{company.municipality ?? "-"}</td>
                <td>{company.uf ?? "-"}</td>
                <td>
                  {company.active ? (
                    <span className="pill pill-ok">Ativa</span>
                  ) : (
                    <span className="pill pill-neutral">Inativa</span>
                  )}
                </td>
              </ClickableRow>
            ))}
            {rows.length === 0 && (
              <tr>
                <td colSpan={6} className="!p-0">
                  <EmptyState icon={Building2} title="Nenhum cliente encontrado" description="Ajuste os filtros ou cadastre um novo cliente." />
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <Pagination page={filters.page} pageSize={filters.pageSize} total={total} currentQuery={currentQuery} />
    </div>
  );
}
