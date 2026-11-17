"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  FileCheck2,
  Stamp,
  Building2,
  Building,
  FileBarChart,
  UploadCloud,
  Bell,
  Settings,
  Users,
  FolderKanban,
  ChevronDown,
  ChevronRight,
} from "@/components/icons";
import { cn } from "@/lib/utils/cn";

const DASHBOARD_ITEM = { href: "/", label: "Dashboard", icon: LayoutDashboard, exact: true } as const;

const NAV_ITEMS: { href: string; label: string; icon: typeof FileCheck2; exact?: boolean }[] = [
  { href: "/painel-certificados", label: "Certificados", icon: FileCheck2 },
  { href: "/alvaras", label: "Alvarás", icon: Stamp },
  { href: "/notificacoes", label: "Notificações", icon: Bell },
  { href: "/relatorios", label: "Relatórios", icon: FileBarChart },
  { href: "/importar", label: "Importar", icon: UploadCloud },
];

interface GestaoItem {
  href: string;
  label: string;
  icon: typeof Building2;
  adminOnly?: boolean;
}

const GESTAO_ITEMS: GestaoItem[] = [
  { href: "/usuarios", label: "Usuários", icon: Users, adminOnly: true },
  { href: "/clientes", label: "Clientes", icon: Building2 },
  { href: "/organizacao", label: "Minha Organização", icon: Building },
];

// Item atual: fundo translúcido + indicador laranja de 2px à esquerda (DESIGN.md §5), nunca bloco escuro cheio.
const ITEM_CLASSES =
  "relative flex w-full items-center gap-2.5 rounded-md px-2.5 py-[7px] text-[13px] transition-colors duration-150";
const ITEM_IDLE = "text-slate-600 hover:bg-slate-100 hover:text-slate-900 [&_svg]:text-slate-400 hover:[&_svg]:text-slate-600";
const ITEM_ACTIVE =
  "bg-[rgba(15,23,42,.055)] font-medium text-[#141d28] [&_svg]:text-[#d95a08] before:absolute before:inset-y-[7px] before:left-0 before:w-[2px] before:rounded-r-[2px] before:bg-[#d95a08]";

function NavLink({ href, label, icon: Icon, active }: { href: string; label: string; icon: typeof Building2; active: boolean }) {
  return (
    <Link
      href={href}
      aria-current={active ? "page" : undefined}
      className={cn(ITEM_CLASSES, active ? ITEM_ACTIVE : ITEM_IDLE)}
    >
      <Icon size={16} strokeWidth={1.7} />
      {label}
    </Link>
  );
}

export function Sidebar({ isAdmin }: { isAdmin: boolean }) {
  const pathname = usePathname();
  const gestaoItems = GESTAO_ITEMS.filter((item) => !item.adminOnly || isAdmin);
  const gestaoActive = gestaoItems.some((item) => pathname.startsWith(item.href));
  const [gestaoOpen, setGestaoOpen] = useState(gestaoActive);

  return (
    <nav className="flex h-full w-60 shrink-0 flex-col border-r border-line bg-white px-3 py-4">
      <div className="mb-5 flex items-center gap-2.5 px-1.5">
        <span
          aria-hidden="true"
          className="grid h-8 w-8 shrink-0 place-items-center rounded-md bg-[#FFFBEB] text-[#B45309] shadow-[inset_0_0_0_1px_rgba(180,83,9,.15)]"
        >
          <FileCheck2 size={16} strokeWidth={1.7} />
        </span>
        <div className="min-w-0">
          <p className="truncate text-[13.5px] font-semibold leading-tight text-[#141d28]">Certificados e Alvarás</p>
          <p className="text-[10px] font-semibold uppercase tracking-[.14em] text-[#d95a08]">Gestão interna</p>
        </div>
      </div>

      <ul className="flex-1 space-y-0.5">
        <li>
          <NavLink
            href={DASHBOARD_ITEM.href}
            label={DASHBOARD_ITEM.label}
            icon={DASHBOARD_ITEM.icon}
            active={pathname === DASHBOARD_ITEM.href}
          />
        </li>

        <li>
          <button
            type="button"
            onClick={() => setGestaoOpen((v) => !v)}
            aria-expanded={gestaoOpen}
            className={cn(ITEM_CLASSES, gestaoActive && !gestaoOpen ? ITEM_ACTIVE : ITEM_IDLE)}
          >
            <FolderKanban size={16} strokeWidth={1.7} />
            <span className="flex-1 text-left">Gestão</span>
            {gestaoOpen ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
          </button>
          {gestaoOpen && (
            <ul className="mt-0.5 ml-[18px] space-y-0.5 border-l border-line pl-2">
              {gestaoItems.map((item) => (
                <li key={item.href}>
                  <NavLink href={item.href} label={item.label} icon={item.icon} active={pathname.startsWith(item.href)} />
                </li>
              ))}
            </ul>
          )}
        </li>

        {NAV_ITEMS.map((item) => (
          <li key={item.href}>
            <NavLink
              href={item.href}
              label={item.label}
              icon={item.icon}
              active={item.exact ? pathname === item.href : pathname.startsWith(item.href)}
            />
          </li>
        ))}
      </ul>

      <ul className="space-y-0.5 border-t border-line pt-2">
        <li>
          <NavLink href="/configuracoes" label="Configurações" icon={Settings} active={pathname.startsWith("/configuracoes")} />
        </li>
      </ul>
    </nav>
  );
}
