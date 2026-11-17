"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { Bell, Download } from "@/components/icons";
import { StatusBadge } from "@/components/certificates/status-badge";
import { EmptyState } from "@/components/ui/empty-state";
import {
  markNotificationRead,
  markAllNotificationsRead,
  markActivityNotificationRead,
  markAllActivityNotificationsRead,
} from "@/lib/notifications/actions";
import { withBasePath } from "@/lib/utils/base-path";
import type { CombinedNotification } from "@/lib/notifications/combined";

function formatDate(value: string): string {
  const [year, month, day] = value.split("-");
  return `${day}/${month}/${year}`;
}

export function NotificationsBell({ items }: { items: CombinedNotification[] }) {
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const unread = items.filter((item) => !item.isRead);

  function markItemRead(item: CombinedNotification) {
    if (item.kind === "due") startTransition(() => markNotificationRead(item.due.certificate.id));
    else startTransition(() => markActivityNotificationRead(item.activity.id));
  }

  function markAllRead() {
    const dueIds = unread.filter((i) => i.kind === "due").map((i) => i.due.certificate.id);
    const activityIds = unread.filter((i) => i.kind === "activity").map((i) => i.activity.id);
    startTransition(async () => {
      await Promise.all([markAllNotificationsRead(dueIds), markAllActivityNotificationsRead(activityIds)]);
    });
  }

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        title="Notificações"
        aria-label="Notificações"
        aria-expanded={open}
        className="relative grid h-9 w-9 place-items-center rounded-md text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-800"
      >
        <Bell size={16} />
        {unread.length > 0 && (
          <span className="absolute right-0.5 top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-[#d95a08] px-1 text-[10px] font-semibold leading-none tabular-nums text-white ring-2 ring-white">
            {unread.length > 99 ? "99+" : unread.length}
          </span>
        )}
      </button>

      {open && (
        <>
          <button
            type="button"
            aria-label="Fechar notificações"
            className="fixed inset-0 z-10 cursor-default"
            onClick={() => setOpen(false)}
          />
          <div className="absolute right-0 z-20 mt-2 w-[22rem] overflow-hidden rounded-lg border border-line bg-white shadow-lg">
            <div className="flex items-center justify-between border-b border-line px-4 py-3">
              <p className="text-[13.5px] font-semibold text-[#141d28]">Notificações</p>
              {unread.length > 0 && (
                <button
                  type="button"
                  disabled={isPending}
                  onClick={markAllRead}
                  className="text-xs font-medium text-[#b94700] hover:underline disabled:opacity-50"
                >
                  Marcar todas como lidas
                </button>
              )}
            </div>

            <div className="max-h-96 overflow-y-auto">
              {unread.length === 0 ? (
                <EmptyState icon={Bell} title="Tudo em dia" description="Nenhuma notificação pendente." className="!py-8" />
              ) : (
                unread.slice(0, 10).map((item) =>
                  item.kind === "due" ? (
                    <div
                      key={item.id}
                      className="flex items-start justify-between gap-2 border-b border-line px-4 py-3 transition-colors last:border-0 hover:bg-[#F8FAFC]"
                    >
                      <Link
                        href={`/clientes/${item.due.certificate.company_id}`}
                        onClick={() => setOpen(false)}
                        className="min-w-0 flex-1"
                      >
                        <p className="truncate text-sm font-medium text-slate-900">
                          {item.due.certificate.company_corporate_name}
                        </p>
                        <p className="mt-1 flex items-center gap-1.5 text-xs tabular-nums text-slate-500">
                          Vence {formatDate(item.due.certificate.valid_to)}
                          <StatusBadge status={item.due.certificate.status} />
                        </p>
                      </Link>
                      <button
                        type="button"
                        disabled={isPending}
                        title="Marcar como lida"
                        onClick={() => markItemRead(item)}
                        className="shrink-0 rounded-md px-2 py-1 text-xs text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-800"
                      >
                        Lida
                      </button>
                    </div>
                  ) : (
                    <div
                      key={item.id}
                      className="flex items-start gap-2 border-b border-line px-4 py-3 transition-colors last:border-0 hover:bg-[#F8FAFC]"
                    >
                      <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-[#F7F9FB] text-slate-500 shadow-[inset_0_0_0_1px_rgba(15,23,42,.08)]">
                        <Download size={12} />
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium text-slate-900">{item.activity.title}</p>
                        <p className="mt-0.5 flex items-center gap-2 text-xs text-slate-500">
                          {item.activity.action_path && (
                            <a
                              href={withBasePath(`/api/notifications/${item.activity.id}/download`)}
                              target="_blank"
                              rel="noreferrer"
                              className="link"
                            >
                              {item.activity.action_label ?? "Baixar"}
                            </a>
                          )}
                        </p>
                      </div>
                      <button
                        type="button"
                        disabled={isPending}
                        title="Marcar como lida"
                        onClick={() => markItemRead(item)}
                        className="shrink-0 rounded-md px-2 py-1 text-xs text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-800"
                      >
                        Lida
                      </button>
                    </div>
                  )
                )
              )}
            </div>

            <div className="border-t border-line bg-[#F8FAFC] px-4 py-2.5 text-center">
              <Link href="/notificacoes" onClick={() => setOpen(false)} className="link text-xs">
                Ver todas as notificações
              </Link>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
