import { EmptyState } from "@/components/ui/empty-state";
import Link from "next/link";
import { ClickableRow } from "@/components/ui/clickable-row";
import { ArrowUpDown, Stamp } from "@/components/icons";
import { formatDocument } from "@/lib/documents/document";
import { AlvaraStatusBadge } from "@/components/alvaras/status-badge";
import { AlvaraRowActions } from "@/components/alvaras/alvara-row-actions";
import type { ColumnDef } from "@/lib/alvaras/columns";
import type { AlvaraWithCompany } from "@/lib/types/database";
import { SORTABLE_FIELDS } from "@/lib/alvaras/filters";
import { cn } from "@/lib/utils/cn";

function formatDate(value: string | null): string {
  if (!value) return "-";
  const [year, month, day] = value.split("-");
  return `${day}/${month}/${year}`;
}

function renderCell(row: AlvaraWithCompany, key: string): React.ReactNode {
  switch (key) {
    case "company_code":
      return row.company_code;
    case "company_document":
      return formatDocument(row.company_document);
    case "company_corporate_name":
      return (
        <div>
          <p className="font-medium text-slate-900">{row.company_corporate_name}</p>
          {row.company_short_name && <p className="text-xs text-slate-500">{row.company_short_name}</p>}
        </div>
      );
    case "type_name":
      return (
        <span className="inline-flex items-center gap-1.5">
          <span className="h-2 w-2 rounded-full" style={{ backgroundColor: row.type_color }} />
          {row.type_name}
        </span>
      );
    case "status":
      return <AlvaraStatusBadge status={row.status} />;
    case "issued_at":
      return formatDate(row.issued_at);
    case "valid_to":
      return formatDate(row.valid_to);
    case "days_remaining":
      return row.archived || row.days_remaining === null ? "-" : row.days_remaining;
    case "prioritario":
      return row.prioritario ? <span className="text-amber-600">★</span> : "-";
    case "metragem_m2":
      return row.metragem_m2 !== null ? `${row.metragem_m2} m²` : "-";
    case "municipality":
      return row.municipality ?? "-";
    case "uf":
      return row.uf ?? "-";
    case "notes":
      return row.notes ? <span className="line-clamp-1 max-w-xs">{row.notes}</span> : "-";
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
    <Link href={`?${params.toString()}`} className="inline-flex items-center gap-1 hover:text-slate-900">
      {column.label}
      <ArrowUpDown size={11} className={cn(currentSort === column.key ? "text-slate-900" : "text-slate-300")} />
    </Link>
  );
}

export function AlvarasTable({
  rows,
  columns,
  sort,
  dir,
  currentQuery,
  isAdmin,
}: {
  rows: AlvaraWithCompany[];
  columns: ColumnDef[];
  sort: string;
  dir: "asc" | "desc";
  currentQuery: string;
  isAdmin: boolean;
}) {
  if (rows.length === 0) {
    return (
      <div className="card">
        <EmptyState icon={Stamp} title="Nenhum alvará encontrado" description="Ajuste ou limpe os filtros para ver outros resultados." />
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
                  {renderCell(row, col.key)}
                </td>
              ))}
              <td className="col-actions">
                <AlvaraRowActions alvaraId={row.id} companyId={row.company_id} archived={row.archived} isAdmin={isAdmin} />
              </td>
            </ClickableRow>
          ))}
        </tbody>
      </table>
    </div>
  );
}
