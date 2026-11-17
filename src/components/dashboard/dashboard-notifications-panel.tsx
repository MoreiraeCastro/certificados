"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { BellOff, Download } from "@/components/icons";
import { EmptyState } from "@/components/ui/empty-state";
import { StatusBadge } from "@/components/certificates/status-badge";
import { markNotificationRead, markAllNotificationsRead, markActivityNotificationRead, markAllActivityNotificationsRead } from "@/lib/notifications/actions";
import { withBasePath } from "@/lib/utils/base-path";
import type { CombinedNotification } from "@/lib/notifications/combined";

function formatDate(value: string): string {
  const [year, month, day] = value.split("-");
  return `${day}/${month}/${year}`;
}

function timeAgo(iso: string): string {
  const diffMs = Date.now() - new Date(iso).getTime();
  const hours = Math.round(diffMs / 3_600_000);
  if (hours < 1) return "há poucos minutos";
  if (hours < 24) return `há cerca de ${hours}h`;
  const days = Math.round(hours / 24);
  return `há ${days} dia${days === 1 ? "" : "s"}`;
}

export function DashboardNotificationsPanel({ items }: { items: CombinedNotification[] }) {
  const [tab, setTab] = useState<"unread" | "read">("unread");
  const [isPending, startTransition] = useTransition();

  const unread = items.filter((item) => !item.isRead);
  const read = items.filter((item) => item.isRead);
  const visible = tab === "unread" ? unread : read;

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
    <div className="card flex h-full flex-col overflow-hidden">
      <div className="flex items-center justify-between gap-2 px-5 pt-4">
        <p className="card-title">Notificações</p>
        {tab === "unread" && unread.length > 0 && (
          <button
            type="button"
            disabled={isPending}
            onClick={markAllRead}
            className="link text-xs disabled:opacity-50"
          >
            Marcar todas como lidas
          </button>
        )}
      </div>
      <div className="flex items-center justify-between border-b border-line px-5 pb-3 pt-2.5">
        <div className="seg" role="tablist">
          <button
            type="button"
            onClick={() => setTab("unread")}
            role="tab"
            aria-selected={tab === "unread"}
            className="seg-item"
          >
            Não lidas {unread.length > 0 && <span className="count-pill">{unread.length}</span>}
          </button>
          <button
            type="button"
            onClick={() => setTab("read")}
            role="tab"
            aria-selected={tab === "read"}
            className="seg-item"
          >
            Lidas
          </button>
        </div>
      </div>

      <div className="max-h-[28rem] flex-1 overflow-y-auto">
        {visible.length === 0 ? (
          <EmptyState
            icon={BellOff}
            title={tab === "unread" ? "Tudo em dia" : "Nenhuma notificação lida ainda"}
            description={tab === "unread" ? "Nenhum vencimento ou aviso pendente." : "As notificações marcadas como lidas aparecem aqui."}
          />
        ) : (
          <div className="divide-y divide-[rgba(15,23,42,.08)]">
            {visible.map((item) =>
              item.kind === "due" ? (
                <div key={item.id} className="flex items-center justify-between gap-2 px-5 py-3 transition-colors hover:bg-[#F8FAFC]">
                  <Link href={`/clientes/${item.due.certificate.company_id}`} className="min-w-0 flex-1">
                    <p className="truncate text-[13px] font-medium text-[#141d28]">
                      {item.due.certificate.company_corporate_name}
                    </p>
                    <p className="mt-1 flex items-center gap-1.5 text-xs tabular-nums text-slate-500">
                      Vence {formatDate(item.due.certificate.valid_to)}
                      <StatusBadge status={item.due.certificate.status} />
                    </p>
                  </Link>
                  {!item.isRead && (
                    <button
                      type="button"
                      disabled={isPending}
                      onClick={() => markItemRead(item)}
                      className="shrink-0 rounded-md border border-[rgba(15,23,42,.10)] bg-white px-2 py-1 text-xs font-medium text-slate-600 transition-colors hover:border-line-strong hover:text-slate-900 disabled:opacity-50"
                    >
                      Marcar como lida
                    </button>
                  )}
                </div>
              ) : (
                <div key={item.id} className="flex items-start gap-3 px-5 py-3 transition-colors hover:bg-[#F8FAFC]">
                  <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-[#F7F9FB] text-slate-500 shadow-[inset_0_0_0_1px_rgba(15,23,42,.08)]">
                    <Download size={15} />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="text-[13px] font-medium text-[#141d28]">{item.activity.title}</p>
                    <p className="mt-0.5 text-xs text-slate-500">{item.activity.message}</p>
                    <div className="mt-1 flex items-center gap-3">
                      {item.activity.action_path && (
                        <a
                          href={withBasePath(`/api/notifications/${item.activity.id}/download`)}
                          target="_blank"
                          rel="noreferrer"
                          className="link text-xs"
                        >
                          {item.activity.action_label ?? "Baixar"}
                        </a>
                      )}
                      <span className="text-xs text-slate-400">{timeAgo(item.activity.created_at)}</span>
                      {!item.isRead && (
                        <button
                          type="button"
                          disabled={isPending}
                          onClick={() => markItemRead(item)}
                          className="text-xs font-medium text-slate-500 hover:text-slate-900 disabled:opacity-50"
                        >
                          Marcar como lida
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              )
            )}
          </div>
        )}
      </div>
    </div>
  );
}
