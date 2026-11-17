"use client";

import { EmptyState } from "@/components/ui/empty-state";
import { useTransition } from "react";
import Link from "next/link";
import { Download, BellOff } from "@/components/icons";
import { cn } from "@/lib/utils/cn";
import { StatusBadge } from "@/components/certificates/status-badge";
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

function timeAgo(iso: string): string {
  const diffMs = Date.now() - new Date(iso).getTime();
  const hours = Math.round(diffMs / 3_600_000);
  if (hours < 1) return "há poucos minutos";
  if (hours < 24) return `há cerca de ${hours}h`;
  const days = Math.round(hours / 24);
  return `há ${days} dia${days === 1 ? "" : "s"}`;
}

export function NotificationsList({ items }: { items: CombinedNotification[] }) {
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

  if (items.length === 0) {
    return (
      <div className="card">
        <EmptyState icon={BellOff} title="Nenhuma notificação no momento" description="Vencimentos próximos e exportações prontas aparecem aqui." />
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {unread.length > 0 && (
        <div className="flex justify-end">
          <button
            type="button"
            disabled={isPending}
            onClick={markAllRead}
            className="btn btn-secondary btn-sm"
          >
            Marcar todas como lidas
          </button>
        </div>
      )}

      <div className="card divide-y divide-[rgba(15,23,42,.08)] overflow-hidden">
        {items.map((item) =>
          item.kind === "due" ? (
            <div
              key={item.id}
              className={cn("flex items-center justify-between gap-3 px-5 py-3.5 transition-colors hover:bg-[#F8FAFC]", item.isRead && "opacity-60")}
            >
              <Link href={`/clientes/${item.due.certificate.company_id}`} className="min-w-0 flex-1">
                <p className="truncate text-[13.5px] font-medium text-[#141d28]">{item.due.certificate.company_corporate_name}</p>
                <p className="mt-1 flex items-center gap-2 text-xs tabular-nums text-slate-500">
                  Código {item.due.certificate.company_code} · Vence {formatDate(item.due.certificate.valid_to)}
                  <StatusBadge status={item.due.certificate.status} />
                </p>
              </Link>
              {item.isRead ? (
                <span className="shrink-0 text-xs text-slate-400">Lida</span>
              ) : (
                <button
                  type="button"
                  disabled={isPending}
                  onClick={() => markItemRead(item)}
                  className="btn btn-secondary btn-sm"
                >
                  Marcar como lida
                </button>
              )}
            </div>
          ) : (
            <div key={item.id} className={cn("flex items-start gap-3 px-5 py-3.5 transition-colors hover:bg-[#F8FAFC]", item.isRead && "opacity-60")}>
              <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-[#F7F9FB] text-slate-500 shadow-[inset_0_0_0_1px_rgba(15,23,42,.08)]">
                <Download size={15} />
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-[13.5px] font-medium text-[#141d28]">{item.activity.title}</p>
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
                      className="text-xs font-medium text-slate-500 hover:text-slate-900"
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
    </div>
  );
}
