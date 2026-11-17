import { EmptyState } from "@/components/ui/empty-state";
import { Plus, Paperclip, Stamp } from "@/components/icons";
import { ButtonLink } from "@/components/ui/button";
import { AlvaraStatusBadge } from "@/components/alvaras/status-badge";
import { AlvaraRowActions } from "@/components/alvaras/alvara-row-actions";
import type { AlvaraWithCompany } from "@/lib/types/database";

function formatDate(value: string | null): string {
  if (!value) return "-";
  const [year, month, day] = value.split("-");
  return `${day}/${month}/${year}`;
}

export function CompanyAlvarasSection({
  companyId,
  alvaras,
  isAdmin,
}: {
  companyId: string;
  alvaras: AlvaraWithCompany[];
  isAdmin: boolean;
}) {
  return (
    <div className="card">
      <div className="flex items-center justify-between border-b border-line px-5 py-3.5">
        <h2 className="card-title">Alvarás</h2>
        <ButtonLink href={`/clientes/${companyId}/alvaras/novo`} size="sm">
          <Plus size={13} /> Novo alvará
        </ButtonLink>
      </div>

      {alvaras.length === 0 ? (
        <EmptyState icon={Stamp} title="Nenhum alvará cadastrado" description="Os alvarás deste cliente aparecem aqui." className="!py-8" />
      ) : (
        <ul className="divide-y divide-[rgba(15,23,42,.08)]">
          {alvaras.map((alvara) => (
            <li key={alvara.id} className="flex flex-wrap items-center justify-between gap-3 px-5 py-3 transition-colors hover:bg-[#F8FAFC]">
              <div className="min-w-0">
                <p className="flex items-center gap-2 text-[13.5px] font-medium text-[#141d28]">
                  <span className="h-2 w-2 shrink-0 rounded-full" style={{ backgroundColor: alvara.type_color }} />
                  {alvara.type_name}
                  {alvara.prioritario && <span className="text-[#d95a08]" title="Prioritário">★</span>}
                  {alvara.attachment_name && <Paperclip size={12} className="text-slate-400" />}
                </p>
                <p className="mt-0.5 text-xs tabular-nums text-slate-500">
                  {alvara.valid_to ? `Vence ${formatDate(alvara.valid_to)}` : "Sem data de vencimento"}
                  {alvara.metragem_m2 !== null ? ` · ${alvara.metragem_m2} m²` : ""}
                </p>
              </div>
              <div className="flex items-center gap-3">
                <AlvaraStatusBadge status={alvara.status} />
                <AlvaraRowActions alvaraId={alvara.id} companyId={companyId} archived={alvara.archived} isAdmin={isAdmin} />
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
