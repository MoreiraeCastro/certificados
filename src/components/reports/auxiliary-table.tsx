import { EmptyState } from "@/components/ui/empty-state";
import Link from "next/link";
import { Download, FileBarChart } from "@/components/icons";
import type { ExportColumn } from "@/lib/export/xlsx";
import type { ExportCell } from "@/lib/certificates/export-value";
import type { AuxiliaryReportKind } from "@/lib/reports/auxiliary";

function formatCell(cell: ExportCell): string {
  if (cell.value === null || cell.value === undefined) return "-";
  if (cell.value instanceof Date) {
    const d = cell.value;
    return `${String(d.getDate()).padStart(2, "0")}/${String(d.getMonth() + 1).padStart(2, "0")}/${d.getFullYear()}`;
  }
  return String(cell.value);
}

export function AuxiliaryTable({
  kind,
  title,
  description,
  columns,
  rows,
  toCells,
}: {
  kind: AuxiliaryReportKind;
  title: string;
  description: string;
  columns: ExportColumn[];
  rows: Record<string, unknown>[];
  toCells: (row: Record<string, unknown>) => ExportCell[];
}) {
  return (
    <div className="space-y-4">
      <div className="page-header">
        <div className="min-w-0">
          <h1 className="page-title">{title}</h1>
          <p className="page-subtitle">{description}</p>
        </div>
        <div className="flex items-center gap-2">
          <Link
            href={`/api/reports/export-auxiliary?kind=${kind}&format=xlsx`}
            className="btn btn-secondary"
          >
            <Download size={14} /> Excel
          </Link>
          <Link
            href={`/api/reports/export-auxiliary?kind=${kind}&format=csv`}
            className="btn btn-secondary"
          >
            <Download size={14} /> CSV
          </Link>
        </div>
      </div>

      <p className="text-xs text-slate-500">{rows.length.toLocaleString("pt-BR")} registro(s)</p>

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
            {rows.map((row, i) => {
              const cells = toCells(row);
              return (
                <tr key={i}>
                  {cells.map((cell, j) => (
                    <td key={j} className="whitespace-nowrap">
                      {formatCell(cell)}
                    </td>
                  ))}
                </tr>
              );
            })}
            {rows.length === 0 && (
              <tr>
                <td colSpan={columns.length} className="!p-0">
                  <EmptyState icon={FileBarChart} title="Nenhum registro encontrado" description="Não há dados para este relatório no momento." />
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
