"use client";

import { useTransition } from "react";
import Link from "next/link";
import { Archive, ArchiveRestore, Eye, Pencil, Trash2 } from "@/components/icons";
import { archiveCertificate, restoreCertificate, deleteCertificate } from "@/lib/certificates/actions";
import { confirmar } from "@/components/confirmar";

export function CertificateRowActions({
  certificateId,
  companyId,
  archived,
  isAdmin,
}: {
  certificateId: string;
  companyId: string;
  archived: boolean;
  isAdmin: boolean;
}) {
  const [isPending, startTransition] = useTransition();

  return (
    <div className="flex items-center gap-1">
      <Link
        href={`/clientes/${companyId}`}
        title="Ver empresa"
        className="icon-btn !h-7 !w-7"
      >
        <Eye size={14} />
      </Link>
      <Link
        href={`/clientes/${companyId}/certificados/${certificateId}/editar`}
        title="Editar"
        className="icon-btn !h-7 !w-7"
      >
        <Pencil size={14} />
      </Link>
      {archived ? (
        <button
          type="button"
          title="Restaurar"
          disabled={isPending}
          onClick={() => startTransition(() => restoreCertificate(certificateId, companyId))}
          className="icon-btn !h-7 !w-7 hover:!text-[#1b7a51]"
        >
          <ArchiveRestore size={14} />
        </button>
      ) : (
        <button
          type="button"
          title="Arquivar"
          disabled={isPending}
          onClick={async () => {
            if (await confirmar("Arquivar este certificado?", { acao: "Arquivar" })) {
              startTransition(() => archiveCertificate(certificateId, companyId));
            }
          }}
          className="icon-btn !h-7 !w-7 hover:!text-[#97600a]"
        >
          <Archive size={14} />
        </button>
      )}
      {isAdmin && (
        <button
          type="button"
          title="Excluir"
          disabled={isPending}
          onClick={async () => {
            if (await confirmar("Excluir este certificado permanentemente?\nEsta ação não pode ser desfeita.", { acao: "Excluir", perigo: true })) {
              startTransition(() => deleteCertificate(certificateId, companyId));
            }
          }}
          className="icon-btn !h-7 !w-7 hover:!text-[#b03a3a]"
        >
          <Trash2 size={14} />
        </button>
      )}
    </div>
  );
}
