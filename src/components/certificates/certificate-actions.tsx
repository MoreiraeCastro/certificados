"use client";

import { useTransition } from "react";
import Link from "next/link";
import { Archive, ArchiveRestore, Pencil } from "@/components/icons";
import { archiveCertificate, restoreCertificate } from "@/lib/certificates/actions";
import { confirmar } from "@/components/confirmar";

export function CertificateActions({
  certificateId,
  companyId,
  archived,
}: {
  certificateId: string;
  companyId: string;
  archived: boolean;
}) {
  const [isPending, startTransition] = useTransition();

  return (
    <div className="flex items-center gap-1">
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
    </div>
  );
}
