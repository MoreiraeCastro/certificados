import { getCurrentUser } from "@/lib/auth/current-user";
import { createClient } from "@/lib/supabase/server";
import { getOrganizationInfo } from "@/lib/settings/organization";
import { OrganizationForm } from "@/components/settings/organization-form";

export const dynamic = "force-dynamic";

export default async function OrganizationPage() {
  const user = await getCurrentUser();
  const supabase = await createClient();
  const organization = await getOrganizationInfo(supabase);

  return (
    <div className="max-w-xl space-y-6">
      <div>
        <h1 className="page-title">Minha Organização</h1>
        <p className="page-subtitle">Dados do próprio escritório, usados em documentos e comunicações.</p>
      </div>

      <div className="card p-6">
        <OrganizationForm organization={organization} readOnly={user.profile.role !== "admin"} />
      </div>
    </div>
  );
}
