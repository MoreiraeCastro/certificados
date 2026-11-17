import { EmptyState } from "@/components/ui/empty-state";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Pencil, Plus, FileCheck2, History } from "@/components/icons";
import { createClient } from "@/lib/supabase/server";
import { formatDocument } from "@/lib/documents/document";
import { StatusBadge } from "@/components/certificates/status-badge";
import { CertificateActions } from "@/components/certificates/certificate-actions";
import { CertificateAttachment } from "@/components/certificates/certificate-attachment";
import { CompanyAlvarasSection } from "@/components/alvaras/company-alvaras-section";
import { getCurrentUser } from "@/lib/auth/current-user";
import { ButtonLink } from "@/components/ui/button";
import type { Company, CertificateWithCompany, CertificateHistoryEntry, AlvaraWithCompany } from "@/lib/types/database";

export const dynamic = "force-dynamic";

function formatDate(value: string | null): string {
  if (!value) return "-";
  const [year, month, day] = value.split("-");
  return `${day}/${month}/${year}`;
}

function formatDateTime(value: string): string {
  const date = new Date(value);
  return date.toLocaleString("pt-BR", { dateStyle: "short", timeStyle: "short" });
}

const HISTORY_ACTION_LABELS: Record<string, string> = {
  created: "Certificado cadastrado",
  renewed: "Certificado renovado",
  updated: "Certificado atualizado",
  archived: "Certificado arquivado",
  restored: "Certificado restaurado",
  deleted: "Certificado excluído",
};

export default async function CompanyDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ erro?: string }>;
}) {
  const { id } = await params;
  const { erro } = await searchParams;
  const supabase = await createClient();

  const { data: company } = await supabase
    .from("companies")
    .select("*, responsible_profile:profiles!companies_responsible_user_id_fkey(full_name)")
    .eq("id", id)
    .maybeSingle();
  if (!company) notFound();

  const [{ data: certificates }, { data: history }, { data: alvaras }, user] = await Promise.all([
    supabase
      .from("certificates_view")
      .select("*")
      .eq("company_id", id)
      .order("valid_to", { ascending: false }),
    supabase
      .from("certificate_history")
      .select("*, changed_by_profile:profiles(full_name)")
      .eq("company_id", id)
      .order("changed_at", { ascending: false })
      .limit(50),
    supabase
      .from("alvaras_view")
      .select("*")
      .eq("company_id", id)
      .order("status_priority", { ascending: true }),
    getCurrentUser(),
  ]);

  const rows = (certificates ?? []) as CertificateWithCompany[];
  const alvaraRows = (alvaras ?? []) as AlvaraWithCompany[];
  const current = rows.find((c) => c.is_current && !c.archived) ?? rows.find((c) => c.is_current);
  const { data: currentFile } = current
    ? await supabase.from("certificates").select("attachment_name, attachment_size").eq("id", current.id).maybeSingle()
    : { data: null };
  const typedCompany = company as Company & { responsible_profile: { full_name: string } | null };
  const responsibleLabel = typedCompany.responsible_profile?.full_name ?? typedCompany.responsible ?? "-";

  return (
    <div className="space-y-6">
      {erro === "certificado" && (
        <div className="alert alert-warn">
          O cliente foi criado, mas não foi possível salvar o certificado. Cadastre-o abaixo.
        </div>
      )}
      <div className="page-header">
        <div className="min-w-0">
          <h1 className="page-title">{typedCompany.corporate_name}</h1>
          {typedCompany.short_name && <p className="page-subtitle">{typedCompany.short_name}</p>}
        </div>
        <ButtonLink href={`/clientes/${id}/editar`} variant="secondary" size="sm">
          <Pencil size={13} /> Editar cliente
        </ButtonLink>
      </div>

      <div className="grid grid-cols-2 gap-4 card p-5 sm:grid-cols-4">
        <div>
          <p className="meta-label">Código</p>
          <p className="meta-value">{typedCompany.code}</p>
        </div>
        <div>
          <p className="meta-label">CNPJ/CPF</p>
          <p className="meta-value">{formatDocument(typedCompany.document)}</p>
        </div>
        <div>
          <p className="meta-label">Município/UF</p>
          <p className="meta-value">
            {typedCompany.municipality ?? "-"}
            {typedCompany.uf ? ` - ${typedCompany.uf}` : ""}
          </p>
        </div>
        <div>
          <p className="meta-label">Responsável</p>
          <p className="meta-value">{responsibleLabel}</p>
        </div>
      </div>

      <div className="card p-5">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="card-title">Certificado atual</h2>
          <ButtonLink href={`/clientes/${id}/certificados/novo`} size="sm">
            <Plus size={13} /> {current ? "Renovar certificado" : "Novo certificado"}
          </ButtonLink>
        </div>

        {current ? (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            <div>
              <p className="meta-label">Tipo</p>
              <p className="meta-value">
                {current.type === "e-cnpj" ? "e-CNPJ" : "e-CPF"} · {current.model}
              </p>
            </div>
            <div>
              <p className="meta-label">Válido até</p>
              <p className="meta-value">{formatDate(current.valid_to)}</p>
            </div>
            <div>
              <p className="meta-label">Dias restantes</p>
              <p className="meta-value">{current.archived ? "-" : current.days_remaining}</p>
            </div>
            <div>
              <p className="meta-label">Status</p>
              <div className="mt-0.5">
                <StatusBadge status={current.status} />
              </div>
            </div>
          </div>
        ) : null}
        {current ? (
          <CertificateAttachment
            certificateId={current.id}
            companyId={id}
            attachmentName={currentFile?.attachment_name ?? null}
            attachmentSize={currentFile?.attachment_size ?? null}
            isAdmin={user.profile.role === "admin"}
          />
        ) : (
          <EmptyState icon={FileCheck2} title="Nenhum certificado cadastrado" description="Cadastre o certificado atual deste cliente para acompanhar o vencimento." className="!py-6" />
        )}
      </div>

      <CompanyAlvarasSection companyId={id} alvaras={alvaraRows} isAdmin={user.profile.role === "admin"} />

      <div className="card">
        <div className="border-b border-line px-5 py-3.5">
          <h2 className="card-title">Histórico de certificados</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="data-table min-w-max">
            <thead>
              <tr>
                <th>Tipo</th>
                <th>Início</th>
                <th>Vencimento</th>
                <th>Status</th>
                <th className="col-actions">Ações</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((cert) => (
                <tr key={cert.id}>
                  <td>
                    {cert.type === "e-cnpj" ? "e-CNPJ" : "e-CPF"} · {cert.model}
                  </td>
                  <td>{formatDate(cert.valid_from)}</td>
                  <td>{formatDate(cert.valid_to)}</td>
                  <td>
                    <StatusBadge status={cert.status} />
                  </td>
                  <td className="col-actions">
                    <CertificateActions certificateId={cert.id} companyId={id} archived={cert.archived} />
                  </td>
                </tr>
              ))}
              {rows.length === 0 && (
                <tr>
                  <td colSpan={5} className="!p-0">
                    <EmptyState icon={History} title="Nenhum certificado no histórico" className="!py-8" />
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="card">
        <div className="border-b border-line px-5 py-3.5">
          <h2 className="card-title">Histórico de alterações</h2>
        </div>
        <ul className="divide-y divide-[rgba(15,23,42,.08)]">
          {((history ?? []) as (CertificateHistoryEntry & { changed_by_profile: { full_name: string } | null })[]).map(
            (entry) => (
              <li key={entry.id} className="px-5 py-3 text-sm">
                <p className="text-slate-900">
                  {HISTORY_ACTION_LABELS[entry.action] ?? entry.action}
                  {entry.field_changed === "valid_to" && entry.old_value && entry.new_value && (
                    <span className="text-slate-500">
                      {" "}
                      — vencimento de {formatDate(entry.old_value)} para {formatDate(entry.new_value)}
                    </span>
                  )}
                </p>
                <p className="mt-0.5 text-xs text-slate-400">
                  {formatDateTime(entry.changed_at)} · {entry.changed_by_profile?.full_name ?? "Sistema"}
                </p>
              </li>
            )
          )}
          {(!history || history.length === 0) && (
            <li><EmptyState icon={History} title="Nenhuma alteração registrada ainda" className="!py-8" /></li>
          )}
        </ul>
      </div>

      <div>
        <Link href="/painel-certificados" className="link text-xs">
          ← Voltar para certificados
        </Link>
      </div>
    </div>
  );
}
