"use client";

import { useRouter } from "next/navigation";
import type { MouseEvent, ReactNode } from "react";

const INTERATIVO = "a, button, input, select, textarea, label, [role='menu'], [role='menuitem'], [role='dialog']";

/**
 * Linha de tabela que abre a ficha ao clicar em qualquer ponto. Cliques em links, botões e menus da linha
 * (inclusive os abertos em portal, que não ficam dentro do <tr>) seguem com o próprio comportamento;
 * arrastar para selecionar texto não navega; Ctrl/⌘ abre em outra aba.
 */
export function ClickableRow({ href, className, children }: { href: string; className?: string; children: ReactNode }) {
  const router = useRouter();
  function abrir(event: MouseEvent<HTMLTableRowElement>) {
    const alvo = event.target as Element;
    if (!event.currentTarget.contains(alvo) || alvo.closest(INTERATIVO)) return;
    if (window.getSelection()?.toString()) return;
    if (event.ctrlKey || event.metaKey) {
      window.open(`${process.env.NEXT_PUBLIC_BASE_PATH ?? ""}${href}`, "_blank");
      return;
    }
    router.push(href);
  }
  return <tr className={`${className ?? ""} cursor-pointer`} onClick={abrir}>{children}</tr>;
}
