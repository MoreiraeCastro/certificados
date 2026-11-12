"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { logAudit } from "@/lib/audit/log";

const CERTIFICATE_BUCKET = "certificado-anexos";
const MAX_SIZE_BYTES = 5 * 1024 * 1024;
const ALLOWED_EXTENSIONS = [".pfx", ".p12"];

export interface CertificateAttachmentState {
  error?: string;
}

function sanitizeFileName(name: string): string {
  return name.replace(/[^a-zA-Z0-9._-]/g, "_").slice(-140);
}

/**
 * O bucket não tem política para usuários: só o servidor (chave de serviço) lê e grava o .pfx, depois de conferir
 * quem pediu. A empresa vem da linha do certificado, nunca do navegador.
 */
async function caller() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");
  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single();
  return { supabase, user, isAdmin: profile?.role === "admin" };
}

export async function uploadCertificateAttachment(
  certificateId: string,
  _companyId: string,
  _prevState: CertificateAttachmentState,
  formData: FormData
): Promise<CertificateAttachmentState> {
  const file = formData.get("file");
  if (!(file instanceof File) || file.size === 0) return { error: "Selecione um arquivo." };
  if (file.size > MAX_SIZE_BYTES) return { error: "Arquivo muito grande (máximo 5MB)." };
  const extension = file.name.toLowerCase().slice(file.name.lastIndexOf("."));
  if (!ALLOWED_EXTENSIONS.includes(extension)) return { error: "Use o arquivo .pfx ou .p12 do certificado." };

  const { supabase, user } = await caller();
  // Lida com o cliente do usuário: se ele não enxerga o certificado (RLS), não anexa.
  const { data: current } = await supabase.from("certificates").select("company_id, attachment_path").eq("id", certificateId).maybeSingle();
  if (!current) return { error: "Certificado não encontrado." };

  const admin = createAdminClient();
  const path = `${current.company_id}/${certificateId}/${Date.now()}-${sanitizeFileName(file.name)}`;
  const { error: uploadError } = await admin.storage
    .from(CERTIFICATE_BUCKET)
    .upload(path, file, { contentType: "application/x-pkcs12" });
  if (uploadError) return { error: "Não foi possível enviar o arquivo. Tente novamente." };

  const { error: updateError } = await supabase
    .from("certificates")
    .update({
      attachment_path: path,
      attachment_name: file.name,
      attachment_size: file.size,
      attachment_uploaded_at: new Date().toISOString(),
    })
    .eq("id", certificateId);
  if (updateError) {
    // A linha continua apontando para o arquivo antigo: tira o novo para não ficar órfão.
    await admin.storage.from(CERTIFICATE_BUCKET).remove([path]);
    return { error: "Não foi possível salvar o arquivo no certificado. Tente novamente." };
  }
  // Só agora o antigo sai: antes disso a linha ainda apontava para ele.
  if (current.attachment_path) await admin.storage.from(CERTIFICATE_BUCKET).remove([current.attachment_path]);

  await logAudit(supabase, {
    userId: user.id,
    action: "upload_certificate_attachment",
    entityType: "certificate",
    entityId: certificateId,
    description: `anexou o arquivo "${file.name}" a um certificado`,
  });

  revalidatePath(`/clientes/${current.company_id}`);
  return {};
}

export async function removeCertificateAttachment(certificateId: string, _companyId: string): Promise<void> {
  const { supabase, user, isAdmin } = await caller();
  if (!isAdmin) throw new Error("Apenas administradores podem remover o arquivo do certificado.");

  const { data: current } = await supabase.from("certificates").select("company_id, attachment_path").eq("id", certificateId).maybeSingle();
  if (!current?.attachment_path) return;

  const { error: updateError } = await supabase
    .from("certificates")
    .update({ attachment_path: null, attachment_name: null, attachment_size: null, attachment_uploaded_at: null })
    .eq("id", certificateId);
  if (updateError) throw new Error("Não foi possível remover o arquivo. Tente novamente.");
  await createAdminClient().storage.from(CERTIFICATE_BUCKET).remove([current.attachment_path]);

  await logAudit(supabase, {
    userId: user.id,
    action: "remove_certificate_attachment",
    entityType: "certificate",
    entityId: certificateId,
    description: "removeu o arquivo de um certificado",
  });

  revalidatePath(`/clientes/${current.company_id}`);
}
