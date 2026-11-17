import { LogOut } from "@/components/icons";
import { signOut } from "@/app/login/actions";
import { GlobalSearch } from "./global-search";
import { NotificationsBell } from "./notifications-bell";
import type { CombinedNotification } from "@/lib/notifications/combined";

export function Topbar({ userName, notifications }: { userName: string; notifications: CombinedNotification[] }) {
  return (
    <header className="flex h-[60px] shrink-0 items-center justify-between gap-4 border-b border-line bg-white/90 px-6 backdrop-blur-sm">
      <div className="flex w-full max-w-lg items-center gap-3">
        {/* eslint-disable-next-line @next/next/no-html-link-for-pages -- o portal fica na raiz do domínio, fora do basePath */}
        <a href="/" title="Voltar ao portal" className="inline-flex h-8 shrink-0 items-center gap-1 rounded-md border border-line pl-2 pr-3 text-[12.5px] font-medium text-slate-500 transition-colors hover:border-line-strong hover:bg-[#F8FAFC] hover:text-slate-800">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true"><path d="M14.5 6l-6 6 6 6" /></svg>
          Portal
        </a>
        <div className="min-w-0 flex-1"><GlobalSearch /></div>
      </div>
      <div className="flex items-center gap-2">
        <NotificationsBell items={notifications} />
        <span className="hidden h-5 w-px bg-[rgba(15,23,42,.08)] sm:block" aria-hidden="true" />
        <span className="flex items-center gap-2 text-[13px] text-slate-600">
          <span aria-hidden="true" className="grid h-7 w-7 place-items-center rounded-full bg-[#F1F5F9] text-[11px] font-semibold text-slate-600">
            {userName.trim().charAt(0).toUpperCase()}
          </span>
          <span className="hidden sm:inline">{userName}</span>
        </span>
        <form action={signOut}>
          <button
            type="submit"
            title="Sair"
            aria-label="Sair"
            className="grid h-9 w-9 place-items-center rounded-md text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-800"
          >
            <LogOut size={16} />
          </button>
        </form>
      </div>
    </header>
  );
}
