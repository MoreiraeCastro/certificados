import { FileBarChart } from "@/components/icons";
import { EmptyState } from "@/components/ui/empty-state";
import { getExportValue, type ReportBase } from "@/lib/reports/engine";
import type { ColumnDef } from "@/lib/certificates/columns";

function formatCellValue(value: string | number | Date | null): string {
  if (value === null || value === undefined) return "-";
  if (value instanceof Date) {
    const day = String(value.getDate()).padStart(2, "0");
    const month = String(value.getMonth() + 1).padStart(2, "0");
    return `${day}/${month}/${value.getFullYear()}`;
  }
  return String(value);
}

export function ReportTable({
  base,
  rows,
  columns,
}: {
  base: ReportBase;
  rows: Record<string, unknown>[];
  columns: ColumnDef[];
}) {
  if (rows.length === 0) {
    return (
      <div className="card">
        <EmptyState icon={FileBarChart} title="Nenhum registro encontrado" description="Ajuste os filtros do relatório e gere novamente." />
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
                {col.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr key={i}>
              {columns.map((col) => (
                <td key={col.key} className="whitespace-nowrap">
                  {formatCellValue(getExportValue(base, row, col.key).value)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
