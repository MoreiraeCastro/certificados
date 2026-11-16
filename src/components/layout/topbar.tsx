import { LogOut } from "@/components/icons";
import { signOut } from "@/app/login/actions";
import { GlobalSearch } from "./global-search";
import { NotificationsBell } from "./notifications-bell";
import type { CombinedNotification } from "@/lib/notifications/combined";

export function Topbar({ userName, notifications }: { userName: string; notifications: CombinedNotification[] }) {
  return (
    <header className="flex h-14 items-center justify-between gap-4 border-b border-slate-200 bg-white px-4">
      <div className="flex w-full max-w-lg items-center gap-3">
        {/* eslint-disable-next-line @next/next/no-html-link-for-pages -- o portal fica na raiz do domínio, fora do basePath */}
        <a href="/" title="Voltar ao portal" className="inline-flex h-8 shrink-0 items-center gap-1 rounded-full border border-slate-200 pl-2 pr-3 text-[12.5px] font-medium text-slate-500 hover:bg-slate-100 hover:text-slate-800">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true"><path d="M14.5 6l-6 6 6 6" /></svg>
          Portal
        </a>
        <div className="min-w-0 flex-1"><GlobalSearch /></div>
      </div>
      <div className="flex items-center gap-3">
        <NotificationsBell items={notifications} />
        <span className="text-sm text-slate-600">{userName}</span>
        <form action={signOut}>
          <button
            type="submit"
            title="Sair"
            className="rounded-md p-2 text-slate-500 hover:bg-slate-100 hover:text-slate-700"
          >
            <LogOut size={16} />
          </button>
        </form>
      </div>
    </header>
  );
}
