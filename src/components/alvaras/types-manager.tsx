"use client";

import { EmptyState } from "@/components/ui/empty-state";
import { useState, useTransition } from "react";
import { Plus, Pencil, Trash2, Stamp } from "@/components/icons";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";
import { AlvaraTypeForm } from "./type-form";
import { createAlvaraType, updateAlvaraType, deleteAlvaraType } from "@/lib/alvaras/catalog";
import type { AlvaraType } from "@/lib/types/database";
import { confirmar } from "@/components/confirmar";

export function AlvaraTypesManager({ types }: { types: AlvaraType[] }) {
  const [modalType, setModalType] = useState<AlvaraType | "new" | null>(null);
  const [isPending, startTransition] = useTransition();

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-slate-500">Cadastro dos tipos de alvará usados em todo o sistema.</p>
        <Button size="sm" onClick={() => setModalType("new")}>
          <Plus size={14} /> Novo tipo
        </Button>
      </div>

      <div className="card divide-y divide-[rgba(15,23,42,.08)] overflow-hidden">
        {types.map((type) => (
          <div key={type.id} className="flex items-center justify-between gap-3 px-4 py-3">
            <div className="flex min-w-0 items-center gap-2">
              <span className="h-3 w-3 shrink-0 rounded-full" style={{ backgroundColor: type.color }} />
              <p className="truncate text-sm font-medium text-slate-900">{type.name}</p>
              {type.shared_attachment_by_municipality && (
                <span className="shrink-0 pill pill-neutral !h-5 before:!hidden">
                  anexo por município
                </span>
              )}
            </div>
            <div className="flex shrink-0 items-center gap-1">
              <button
                type="button"
                title="Editar"
                onClick={() => setModalType(type)}
                className="icon-btn !h-7 !w-7"
              >
                <Pencil size={14} />
              </button>
              <button
                type="button"
                title="Excluir"
                disabled={isPending}
                onClick={async () => {
                  if (await confirmar(`Excluir o tipo "${type.name}"?`, { acao: "Excluir", perigo: true })) {
                    startTransition(() => deleteAlvaraType(type.id));
                  }
                }}
                className="icon-btn !h-7 !w-7 hover:!text-[#b03a3a]"
              >
                <Trash2 size={14} />
              </button>
            </div>
          </div>
        ))}
        {types.length === 0 && (
          <EmptyState icon={Stamp} title="Nenhum tipo de alvará cadastrado" description="Crie os tipos (ex. Sanitário, Funcionamento) para usar nos alvarás." />
        )}
      </div>

      <Modal
        open={modalType !== null}
        onClose={() => setModalType(null)}
        title={modalType === "new" ? "Novo tipo de alvará" : `Editar tipo: ${modalType?.name ?? ""}`}
      >
        {modalType === "new" ? (
          <AlvaraTypeForm action={createAlvaraType} onSaved={() => setModalType(null)} />
        ) : modalType ? (
          <AlvaraTypeForm action={updateAlvaraType.bind(null, modalType.id)} type={modalType} onSaved={() => setModalType(null)} />
        ) : null}
      </Modal>
    </div>
  );
}
