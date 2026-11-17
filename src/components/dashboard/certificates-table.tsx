import { EmptyState } from "@/components/ui/empty-state";
import Link from "next/link";
import { ClickableRow } from "@/components/ui/clickable-row";
import { ArrowUpDown, FileCheck2 } from "@/components/icons";
import { formatDocument } from "@/lib/documents/document";
import { StatusBadge } from "@/components/certificates/status-badge";
import { CertificateRowActions } from "@/components/dashboard/certificate-row-actions";
import type { ColumnDef } from "@/lib/certificates/columns";
import type { CertificateWithCompany } from "@/lib/types/database";
import { SORTABLE_FIELDS } from "@/lib/certificates/filters";

function formatDate(value: string | null): string {
  if (!value) return "-";
  const [year, month, day] = value.split("-");
  return `${day}/${month}/${year}`;
}

function renderCell(row: CertificateWithCompany, key: string, defaultWarningDays: number): React.ReactNode {
  switch (key) {
    case "company_code":
      return row.company_code;
    case "company_document":
      return formatDocument(row.company_document);
    case "company_corporate_name":
      return (
        <div>
          <p className="font-medium text-slate-900">{row.company_corporate_name}</p>
          {row.company_short_name && (
            <p className="text-xs text-slate-500">{row.company_short_name}</p>
          )}
        </div>
      );
    case "company_municipality":
      return row.company_municipality ?? "-";
    case "company_uf":
      return row.company_uf ?? "-";
    case "type":
      return row.type === "e-cnpj" ? "e-CNPJ" : "e-CPF";
    case "model":
      return row.model;
    case "valid_to":
      return formatDate(row.valid_to);
    case "days_remaining":
      return row.archived ? "-" : row.days_remaining;
    case "status":
      return <StatusBadge status={row.status} />;
    case "warning_days":
      return row.warning_days ? `${row.warning_days} dias` : `Padrão (${defaultWarningDays} dias)`;
    case "company_responsible":
      return row.company_responsible ?? "-";
    case "created_at":
      return formatDate(row.created_at.slice(0, 10));
    case "updated_at":
      return formatDate(row.updated_at.slice(0, 10));
    default:
      return "-";
  }
}

function SortableHeader({
  column,
  currentSort,
  currentDir,
  currentQuery,
}: {
  column: ColumnDef;
  currentSort: string;
  currentDir: "asc" | "desc";
  currentQuery: string;
}) {
  const isSortable = (SORTABLE_FIELDS as readonly string[]).includes(column.key);
  if (!isSortable) {
    return <span>{column.label}</span>;
  }

  // 1º clique: crescente; 2º: decrescente; 3º: volta à ordem padrão (sem sort na URL).
  const params = new URLSearchParams(currentQuery);
  if (currentSort !== column.key) {
    params.set("sort", column.key);
    params.set("dir", "asc");
  } else if (currentDir === "asc") {
    params.set("sort", column.key);
    params.set("dir", "desc");
  } else {
    params.delete("sort");
    params.delete("dir");
  }
  params.set("page", "1");

  return (
    <Link
      href={`?${params.toString()}`}
      className="inline-flex items-center gap-1 hover:text-slate-900"
    >
      {column.label}
      <ArrowUpDown size={11} className={currentSort === column.key ? "text-slate-900" : "text-slate-300"} />
    </Link>
  );
}

export function CertificatesTable({
  rows,
  columns,
  sort,
  dir,
  currentQuery,
  isAdmin,
  defaultWarningDays,
}: {
  rows: CertificateWithCompany[];
  columns: ColumnDef[];
  sort: string;
  dir: "asc" | "desc";
  currentQuery: string;
  isAdmin: boolean;
  defaultWarningDays: number;
}) {
  if (rows.length === 0) {
    return (
      <div className="card">
        <EmptyState icon={FileCheck2} title="Nenhum certificado encontrado" description="Ajuste ou limpe os filtros para ver outros resultados." />
      </div>
    );
  }

  return (
    <div className="table-wrap">
      <table className="data-table min-w-max">
        <thead>
          <tr>
            {columns.map((col) => (
              <th key={col.key}>
                <SortableHeader column={col} currentSort={sort} currentDir={dir} currentQuery={currentQuery} />
              </th>
            ))}
            <th className="col-actions">Ações</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <ClickableRow key={row.id} href={`/clientes/${row.company_id}`}>
              {columns.map((col) => (
                <td key={col.key} className="whitespace-nowrap">
                  {renderCell(row, col.key, defaultWarningDays)}
                </td>
              ))}
              <td className="col-actions">
                <CertificateRowActions
                  certificateId={row.id}
                  companyId={row.company_id}
                  archived={row.archived}
                  isAdmin={isAdmin}
                />
              </td>
            </ClickableRow>
          ))}
        </tbody>
      </table>
    </div>
  );
}
