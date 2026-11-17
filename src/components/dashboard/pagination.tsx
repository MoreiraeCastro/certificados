import Link from "next/link";

export function Pagination({
  page,
  pageSize,
  total,
  currentQuery,
}: {
  page: number;
  pageSize: number;
  total: number;
  currentQuery: string;
}) {
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const from = total === 0 ? 0 : (page - 1) * pageSize + 1;
  const to = Math.min(total, page * pageSize);

  function linkFor(targetPage: number, targetPageSize = pageSize) {
    const params = new URLSearchParams(currentQuery);
    params.set("page", String(targetPage));
    params.set("pageSize", String(targetPageSize));
    return `?${params.toString()}`;
  }

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 px-1 py-1 text-[13px] text-slate-500">
      <p className="tabular-nums">
        Mostrando {from}–{to} de {total.toLocaleString("pt-BR")} registros
      </p>
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-500">Por página</span>
          <div className="seg">
          {[25, 50, 100, 200].map((size) => (
            <Link
              key={size}
              href={linkFor(1, size)}
              aria-current={size === pageSize ? "true" : undefined}
              className={size === pageSize ? "seg-item is-on !h-6 tabular-nums" : "seg-item !h-6 tabular-nums"}
            >
              {size}
            </Link>
          ))}
          </div>
        </div>
        <div className="flex items-center gap-1">
          <Link
            href={linkFor(Math.max(1, page - 1))}
            aria-disabled={page <= 1}
            className={
              page <= 1
                ? "btn btn-secondary btn-sm pointer-events-none opacity-50"
                : "btn btn-secondary btn-sm"
            }
          >
            Anterior
          </Link>
          <span className="px-2 text-xs tabular-nums text-slate-500">
            Página {page} de {totalPages}
          </span>
          <Link
            href={linkFor(Math.min(totalPages, page + 1))}
            aria-disabled={page >= totalPages}
            className={
              page >= totalPages
                ? "btn btn-secondary btn-sm pointer-events-none opacity-50"
                : "btn btn-secondary btn-sm"
            }
          >
            Próxima
          </Link>
        </div>
      </div>
    </div>
  );
}
