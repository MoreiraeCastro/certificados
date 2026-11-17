"use client";

import { useActionState, useTransition } from "react";
import { Paperclip, Download, Trash2 } from "@/components/icons";
import { Button } from "@/components/ui/button";
import { withBasePath } from "@/lib/utils/base-path";
import {
  uploadCertificateAttachment,
  removeCertificateAttachment,
  type CertificateAttachmentState,
} from "@/lib/certificates/attachments";
import { confirmar } from "@/components/confirmar";

function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  return `${(bytes / 1024).toFixed(0)} KB`;
}

export function CertificateAttachment({
  certificateId,
  companyId,
  attachmentName,
  attachmentSize,
  isAdmin,
}: {
  certificateId: string;
  companyId: string;
  attachmentName: string | null;
  attachmentSize: number | null;
  isAdmin: boolean;
}) {
  const uploadAction = uploadCertificateAttachment.bind(null, certificateId, companyId);
  const [state, formAction, pending] = useActionState<CertificateAttachmentState, FormData>(uploadAction, {});
  const [removing, startRemoving] = useTransition();

  return (
    <div className="mt-4 rounded-lg border border-line bg-white p-4">
      <p className="mb-3 flex items-center gap-1.5 text-xs font-medium text-slate-700 [&_svg]:text-slate-400">
        <Paperclip size={13} /> Arquivo do certificado
      </p>

      {attachmentName ? (
        <div className="flex items-center justify-between gap-3 rounded-md border border-line bg-[#F8FAFC] px-3 py-2">
          <div className="min-w-0">
            <p className="truncate text-sm text-slate-900">{attachmentName}</p>
            {attachmentSize !== null && <p className="text-xs text-slate-500">{formatSize(attachmentSize)}</p>}
          </div>
          <div className="flex shrink-0 items-center gap-1">
            <a
              href={withBasePath(`/api/certificates/${certificateId}/attachment`)}
              title="Baixar"
              className="icon-btn !h-7 !w-7"
            >
              <Download size={14} />
            </a>
            {isAdmin && <button
              type="button"
              title="Remover"
              disabled={removing}
              onClick={async () => {
                if (await confirmar("Remover o arquivo deste certificado?", { acao: "Remover", perigo: true })) {
                  startRemoving(() => removeCertificateAttachment(certificateId, companyId));
                }
              }}
              className="icon-btn !h-7 !w-7 hover:!text-[#b03a3a]"
            >
              <Trash2 size={14} />
            </button>}
          </div>
        </div>
      ) : (
        <p className="mb-2 text-xs text-slate-500">Nenhum arquivo anexado.</p>
      )}

      <form action={formAction} className="dropzone dropzone-inline mt-3">
        <input
          type="file"
          name="file"
          accept=".pfx,.p12"
          required
          className="file-input"
        />
        <Button type="submit" size="sm" variant="secondary" disabled={pending}>
          {pending ? "Enviando..." : attachmentName ? "Substituir" : "Enviar"}
        </Button>
      </form>
      {state.error && <p className="mt-1.5 text-xs text-[#b03a3a]">{state.error}</p>}
    </div>
  );
}
