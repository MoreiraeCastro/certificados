"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { logAudit } from "@/lib/audit/log";

export const CERTIFICATE_BUCKET = "certificado-anexos";
const MAX_SIZE_BYTES = 5 * 1024 * 1024;
const ALLOWED_EXTENSIONS = [".pfx", ".p12"];

export interface CertificateAttachmentState {
  error?: string;
}

function sanitizeFileName(name: string): string {
  return name.replace(/[^a-zA-Z0-9._-]/g, "_").slice(-140);
}

export async function uploadCertificateAttachment(
  certificateId: string,
  companyId: string,
  _prevState: CertificateAttachmentState,
  formData: FormData
): Promise<CertificateAttachmentState> {
  const file = formData.get("file");
  if (!(file instanceof File) || file.size === 0) return { error: "Selecione um arquivo." };
  if (file.size > MAX_SIZE_BYTES) return { error: "Arquivo muito grande (máximo 5MB)." };
  const extension = file.name.toLowerCase().slice(file.name.lastIndexOf("."));
  if (!ALLOWED_EXTENSIONS.includes(extension)) return { error: "Use o arquivo .pfx ou .p12 do certificado." };

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: current } = await supabase.from("certificates").select("attachment_path").eq("id", certificateId).maybeSingle();

  const path = `${companyId}/${certificateId}/${Date.now()}-${sanitizeFileName(file.name)}`;
  const { error: uploadError } = await supabase.storage
    .from(CERTIFICATE_BUCKET)
    .upload(path, file, { contentType: "application/x-pkcs12" });
  if (uploadError) return { error: "Não foi possível enviar o arquivo. Tente novamente." };

  if (current?.attachment_path) await supabase.storage.from(CERTIFICATE_BUCKET).remove([current.attachment_path]);

  await supabase
    .from("certificates")
    .update({
      attachment_path: path,
      attachment_name: file.name,
      attachment_size: file.size,
      attachment_uploaded_at: new Date().toISOString(),
    })
    .eq("id", certificateId);

  await logAudit(supabase, {
    userId: user.id,
    action: "upload_certificate_attachment",
    entityType: "certificate",
    entityId: certificateId,
    description: `anexou o arquivo "${file.name}" a um certificado`,
  });

  revalidatePath(`/clientes/${companyId}`);
  return {};
}

export async function removeCertificateAttachment(certificateId: string, companyId: string): Promise<void> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: current } = await supabase.from("certificates").select("attachment_path").eq("id", certificateId).maybeSingle();
  if (!current?.attachment_path) return;

  await supabase.storage.from(CERTIFICATE_BUCKET).remove([current.attachment_path]);
  await supabase
    .from("certificates")
    .update({ attachment_path: null, attachment_name: null, attachment_size: null, attachment_uploaded_at: null })
    .eq("id", certificateId);

  await logAudit(supabase, {
    userId: user.id,
    action: "remove_certificate_attachment",
    entityType: "certificate",
    entityId: certificateId,
    description: "removeu o arquivo de um certificado",
  });

  revalidatePath(`/clientes/${companyId}`);
}
