import { History } from "@/components/icons";
import { EmptyState } from "@/components/ui/empty-state";
import { createClient } from "@/lib/supabase/server";
import type { ImportRun } from "@/lib/types/database";

export const dynamic = "force-dynamic";

function formatDateTime(value: string): string {
  return new Date(value).toLocaleString("pt-BR", { dateStyle: "short", timeStyle: "short" });
}

export default async function ImportHistoryPage() {
  const supabase = await createClient();
  const { data: imports } = await supabase
    .from("imports")
    .select("*, imported_by_profile:profiles(full_name)")
    .order("created_at", { ascending: false })
    .limit(100);

  const rows = (imports ?? []) as (ImportRun & { imported_by_profile: { full_name: string } | null })[];

  return (
    <div className="space-y-4">
      <div>
        <h1 className="page-title">Histórico de importações</h1>
        <p className="page-subtitle">Registro de todas as importações realizadas.</p>
      </div>

      <div className="table-wrap">
        <table className="data-table min-w-max">
          <thead>
            <tr>
              <th>Data</th>
              <th>Arquivo</th>
              <th>Usuário</th>
              <th>Linhas</th>
              <th>Empresas criadas</th>
              <th>Empresas atualizadas</th>
              <th>Certificados criados</th>
              <th>Duplicidades</th>
              <th>Conflitos</th>
              <th>Erros</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((run) => (
              <tr key={run.id}>
                <td>{formatDateTime(run.created_at)}</td>
                <td>{run.file_name}</td>
                <td>{run.imported_by_profile?.full_name ?? "-"}</td>
                <td>{run.total_rows}</td>
                <td>{run.companies_created}</td>
                <td>{run.companies_updated}</td>
                <td>{run.certificates_created}</td>
                <td>{run.duplicates}</td>
                <td>{run.conflicts}</td>
                <td>{run.errors}</td>
                <td>{run.status}</td>
              </tr>
            ))}
            {rows.length === 0 && (
              <tr>
                <td colSpan={11} className="!p-0">
                  <EmptyState icon={History} title="Nenhuma importação realizada ainda" description="As planilhas enviadas em Importar aparecem aqui." />
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
