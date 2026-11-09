"use client";

import { useEffect } from "react";
import { createRoot } from "react-dom/client";

type Opcoes = { acao?: string; perigo?: boolean };

/**
 * Aviso de confirmação no estilo do sistema, no lugar do confirm do navegador.
 * A primeira linha do texto vira a pergunta; o resto, o detalhe.
 */
export function confirmar(texto: string, { acao = "Confirmar", perigo = false }: Opcoes = {}): Promise<boolean> {
  const host = document.body.appendChild(document.createElement("div"));
  const root = createRoot(host);
  return new Promise((resolve) => {
    const fim = (ok: boolean) => { root.unmount(); host.remove(); resolve(ok); };
    root.render(<Aviso texto={texto} acao={acao} perigo={perigo} fim={fim} />);
  });
}

function Aviso({ texto, acao, perigo, fim }: Required<Opcoes> & { texto: string; fim: (ok: boolean) => void }) {
  const [pergunta, ...detalhe] = texto.split("\n");
  useEffect(() => {
    const onKey = (event: KeyboardEvent) => { if (event.key === "Escape") fim(false); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [fim]);
  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-900/40 px-4" role="presentation"
      onMouseDown={(event) => { if (event.target === event.currentTarget) fim(false); }}>
      <div className="w-full max-w-md rounded-lg border border-slate-200 bg-white p-6 shadow-xl" role="alertdialog" aria-modal="true" aria-labelledby="confirmar-titulo">
        <h2 id="confirmar-titulo" className="text-base font-semibold text-slate-900">{pergunta}</h2>
        {detalhe.length ? <p className="mt-2 whitespace-pre-line text-sm text-slate-600">{detalhe.join("\n")}</p> : null}
        <div className="mt-6 flex justify-end gap-2">
          {/* Ação perigosa: o foco começa no Cancelar, para um Enter distraído não apagar nada. */}
          <button type="button" autoFocus={perigo} onClick={() => fim(false)}
            className="rounded-md border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50">Cancelar</button>
          <button type="button" autoFocus={!perigo} onClick={() => fim(true)}
            className={`rounded-md px-4 py-2 text-sm font-medium text-white ${perigo ? "bg-red-600 hover:bg-red-700" : "bg-slate-900 hover:bg-slate-800"}`}>{acao}</button>
        </div>
      </div>
    </div>
  );
}
