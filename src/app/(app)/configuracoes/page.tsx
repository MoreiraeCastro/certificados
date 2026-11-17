import Link from "next/link";
import { Bell, Users, Stamp } from "@/components/icons";

const CARDS = [
  {
    href: "/configuracoes/notificacoes",
    icon: Bell,
    title: "Notificações de Vencimento",
    description: "Prazo de aviso e destinatários de certificados — com prazo por certificado onde faz sentido.",
  },
  {
    href: "/configuracoes/grupos",
    icon: Users,
    title: "Grupos de usuários",
    description: "Defina quais módulos cada grupo cobre — e aplique a vários usuários de uma vez.",
  },
  {
    href: "/configuracoes/alvara-tipos",
    icon: Stamp,
    title: "Tipos de Alvará",
    description: "Cadastro dos tipos de alvará (nome e cor) usados na tabela e no calendário do Dashboard.",
  },
];

export default function SettingsHubPage() {
  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <h1 className="page-title">Configurações</h1>
        <p className="page-subtitle">Regras e cadastros usados em todo o sistema.</p>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {CARDS.map((card) => {
          const Icon = card.icon;
          return (
            <Link
              key={card.href}
              href={card.href}
              className="card card-link group block p-4"
            >
              <span className="mb-3 grid h-9 w-9 place-items-center rounded-md bg-[#F7F9FB] text-slate-500 shadow-[inset_0_0_0_1px_rgba(15,23,42,.08)]">
                <Icon size={17} strokeWidth={1.7} />
              </span>
              <p className="text-[13.5px] font-semibold text-[#141d28]">{card.title}</p>
              <p className="mt-1 text-xs text-slate-500">{card.description}</p>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
