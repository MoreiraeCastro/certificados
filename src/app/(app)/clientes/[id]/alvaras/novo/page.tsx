import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { AlvaraForm } from "@/components/alvaras/alvara-form";
import { createAlvara } from "@/lib/alvaras/actions";
import { listAlvaraTypes } from "@/lib/alvaras/queries";

export const dynamic = "force-dynamic";

export default async function NewAlvaraPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  const [{ data: company }, types] = await Promise.all([
    supabase.from("companies").select("id, corporate_name").eq("id", id).maybeSingle(),
    listAlvaraTypes(supabase),
  ]);

  if (!company) notFound();

  const boundAction = createAlvara.bind(null, id);

  return (
    <div className="max-w-2xl space-y-4">
      <div>
        <h1 className="page-title">Novo alvará</h1>
        <p className="page-subtitle">{company.corporate_name}</p>
      </div>
      <div className="card p-6">
        <AlvaraForm action={boundAction} types={types} companyId={id} />
      </div>
    </div>
  );
}
