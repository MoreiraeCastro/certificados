import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { logAudit } from "@/lib/audit/log";

const BUCKET = "certificado-anexos";

/** Bucket privado: o único caminho até o arquivo é um link assinado de 60s, e cada download fica no histórico. */
export async function GET(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const { data: certificate } = await supabase
    .from("certificates")
    .select("id, attachment_path, attachment_name")
    .eq("id", id)
    .maybeSingle();
  if (!certificate?.attachment_path) return NextResponse.json({ error: "Nenhum arquivo anexado." }, { status: 404 });

  // Sem política no bucket para usuários: o link sai pela chave de serviço, depois de o usuário enxergar o certificado.
  const { data: signed, error } = await createAdminClient().storage
    .from(BUCKET)
    .createSignedUrl(certificate.attachment_path, 60, { download: certificate.attachment_name ?? true });
  if (error || !signed) return NextResponse.json({ error: "Não foi possível gerar o link do arquivo." }, { status: 500 });

  await logAudit(supabase, {
    userId: user.id,
    action: "download_certificate_attachment",
    entityType: "certificate",
    entityId: id,
    description: `baixou o arquivo "${certificate.attachment_name ?? ""}" de um certificado`,
  });

  return NextResponse.redirect(signed.signedUrl);
}
