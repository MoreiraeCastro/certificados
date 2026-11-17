"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Search } from "@/components/icons";
import { formatDocument } from "@/lib/documents/document";
import { withBasePath } from "@/lib/utils/base-path";
import type { Company } from "@/lib/types/database";

export function GlobalSearch() {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Company[]>([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    const timeout = setTimeout(async () => {
      if (query.trim().length < 2) {
        setResults([]);
        return;
      }
      setLoading(true);
      try {
        const res = await fetch(withBasePath(`/api/search?q=${encodeURIComponent(query)}`));
        const data = await res.json();
        setResults(data.results ?? []);
        setOpen(true);
      } finally {
        setLoading(false);
      }
    }, 250);
    return () => clearTimeout(timeout);
  }, [query]);

  return (
    <div ref={containerRef} className="relative">
      <div className="relative">
        <Search size={15} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => results.length > 0 && setOpen(true)}
          placeholder="Buscar por nome, CNPJ, CPF ou código..."
          className="h-9 w-full rounded-md border border-line bg-[#F8FAFC] pl-9 pr-3 text-[13px] text-slate-900 transition-[border-color,box-shadow,background-color] duration-150 placeholder:text-slate-400 hover:border-line-strong focus:border-accent focus:bg-white focus:shadow-[0_0_0_3px_rgba(217,90,8,.15)] focus:outline-none"
        />
      </div>

      {open && (
        <div className="absolute z-20 mt-1 w-full max-w-lg overflow-hidden rounded-lg border border-line bg-white py-1 shadow-lg">
          {loading && <p className="px-3 py-2 text-xs text-slate-500">Buscando...</p>}
          {!loading && results.length === 0 && (
            <p className="px-3 py-2 text-xs text-slate-500">Nenhuma empresa encontrada.</p>
          )}
          <ul>
            {results.map((company) => (
              <li key={company.id}>
                <button
                  type="button"
                  onClick={() => {
                    setOpen(false);
                    setQuery("");
                    router.push(`/clientes/${company.id}`);
                  }}
                  className="flex w-full flex-col items-start gap-0.5 px-3 py-2 text-left text-[13px] transition-colors hover:bg-[#F8FAFC]"
                >
                  <span className="font-medium text-slate-900">
                    {company.corporate_name}
                    {company.short_name ? ` · ${company.short_name}` : ""}
                  </span>
                  <span className="text-xs tabular-nums text-slate-500">
                    Código {company.code} · {formatDocument(company.document)}
                    {company.municipality ? ` · ${company.municipality}/${company.uf}` : ""}
                  </span>
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
