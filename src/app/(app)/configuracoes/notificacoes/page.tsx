import { getCurrentUser } from "@/lib/auth/current-user";
import { createClient } from "@/lib/supabase/server";
import { getCertificateThresholds } from "@/lib/settings/thresholds";
import { ThresholdsForm } from "@/components/settings/thresholds-form";
import { SendDigestButton } from "@/components/settings/send-digest-button";
import { Label } from "@/components/ui/input";

export const dynamic = "force-dynamic";

export default async function NotificationSettingsPage() {
  const user = await getCurrentUser();
  const supabase = await createClient();
  const thresholds = await getCertificateThresholds(supabase);

  return (
    <div className="max-w-xl space-y-6">
      <div>
        <h1 className="page-title">Notificações de Vencimento</h1>
        <p className="page-subtitle">Regras usadas em todo o sistema para calcular o status dos certificados.</p>
      </div>

      <div className="card p-6">
        <ThresholdsForm thresholds={thresholds} readOnly={user.profile.role !== "admin"} />
      </div>

      {user.profile.role === "admin" && (
        <div className="card p-6">
          <Label>Notificação por e-mail</Label>
          <p className="mb-3 text-xs text-slate-500">
            Um resumo é enviado automaticamente todo dia para todos os usuários ativos, com os certificados
            vencendo/vencidos no momento. Use o botão abaixo para disparar agora, sem esperar o horário programado.
          </p>
          <SendDigestButton />
        </div>
      )}
    </div>
  );
}
