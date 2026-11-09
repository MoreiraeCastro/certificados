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
        className="rounded p-1.5 text-slate-500 hover:bg-slate-100 hover:text-slate-900"
      >
        <Eye size={14} />
      </Link>
      <Link
        href={`/clientes/${companyId}/certificados/${certificateId}/editar`}
        title="Editar"
        className="rounded p-1.5 text-slate-500 hover:bg-slate-100 hover:text-slate-900"
      >
        <Pencil size={14} />
      </Link>
      {archived ? (
        <button
          type="button"
          title="Restaurar"
          disabled={isPending}
          onClick={() => startTransition(() => restoreCertificate(certificateId, companyId))}
          className="rounded p-1.5 text-slate-500 hover:bg-slate-100 hover:text-emerald-700"
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
          className="rounded p-1.5 text-slate-500 hover:bg-slate-100 hover:text-amber-700"
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
          className="rounded p-1.5 text-slate-500 hover:bg-slate-100 hover:text-red-700"
        >
          <Trash2 size={14} />
        </button>
      )}
    </div>
  );
}
