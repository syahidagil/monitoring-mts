"use client";

import { searchSiswaForSelect } from "@/actions/siswa.action";
import { Check, ChevronDown, Loader2, Search, X } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";

type SiswaOption = {
  id: number;
  nis: string;
  nama: string;
  kelasNama: string;
};

type Props = {
  errorMessage?: string | null;
  onSelectionChange?: (selected: SiswaOption[]) => void;
};

export default function SiswaMultiSelect({ errorMessage, onSelectionChange }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState<SiswaOption[]>([]);
  const [results, setResults] = useState<SiswaOption[]>([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const term = query.trim();
    if (!term) return;

    const timer = setTimeout(async () => {
      setLoading(true);
      try {
        const response = await searchSiswaForSelect(term);
        setResults(response.filter((item) => !selected.some((picked) => picked.id === item.id)));
        setOpen(true);
      } finally {
        setLoading(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [query, selected]);

  useEffect(() => {
    onSelectionChange?.(selected);
  }, [onSelectionChange, selected]);

  const selectedIds = useMemo(() => new Set(selected.map((item) => item.id)), [selected]);

  function addItem(item: SiswaOption) {
    setSelected((current) => [...current, item]);
    setQuery("");
    setResults([]);
    setOpen(false);
    inputRef.current?.focus();
  }

  function removeItem(id: number) {
    setSelected((current) => current.filter((item) => item.id !== id));
  }

  return (
    <div className="space-y-2">
      <div className="rounded-2xl border border-slate-300 bg-white px-4 py-3 focus-within:border-emerald-600 focus-within:ring-4 focus-within:ring-emerald-100">
        <div className="flex flex-wrap gap-2">
          {selected.map((item) => (
            <span key={item.id} className="inline-flex items-center gap-2 rounded-full bg-emerald-50 px-3 py-1.5 text-sm font-medium text-emerald-800">
              {item.nama} - {item.nis} - {item.kelasNama}
              <button type="button" onClick={() => removeItem(item.id)} className="rounded-full p-0.5 transition hover:bg-emerald-100" aria-label={`Hapus ${item.nama}`}>
                <X className="h-3.5 w-3.5" />
              </button>
            </span>
          ))}

          <div className="flex min-w-[220px] flex-1 items-center gap-2">
            <Search className="h-4 w-4 text-slate-400" />
            <input
              ref={inputRef}
              value={query}
              onChange={(event) => {
                const value = event.target.value;
                setQuery(value);
                if (!value.trim()) {
                  setResults([]);
                  setOpen(false);
                }
              }}
              onFocus={() => query.trim() && setOpen(true)}
              placeholder="Cari Nama/NIS/Kelas..."
              className="w-full bg-transparent py-1.5 text-sm outline-none placeholder:text-slate-400"
            />
            {loading ? <Loader2 className="h-4 w-4 animate-spin text-slate-400" /> : <ChevronDown className="h-4 w-4 text-slate-400" />}
          </div>
        </div>
      </div>

      {selected.map((item) => (
        <input key={item.id} type="hidden" name="siswaIds" value={item.id} />
      ))}

      {open && query.trim() && (
        <div className="max-h-72 overflow-y-auto rounded-2xl border border-slate-200 bg-white shadow-lg">
          {results.length === 0 && !loading ? (
            <div className="px-4 py-3 text-sm text-slate-500">Tidak ada hasil yang cocok.</div>
          ) : (
            results.map((item) => (
              <button key={item.id} type="button" onClick={() => addItem(item)} className="flex w-full items-center justify-between gap-4 border-b border-slate-100 px-4 py-3 text-left transition hover:bg-emerald-50 last:border-b-0">
                <div>
                  <p className="text-sm font-semibold text-slate-900">{item.nama}</p>
                  <p className="text-xs text-slate-500">{item.nis} - {item.kelasNama}</p>
                </div>
                {selectedIds.has(item.id) ? <Check className="h-4 w-4 text-emerald-700" /> : <span className="text-xs font-medium text-emerald-700">Pilih</span>}
              </button>
            ))
          )}
        </div>
      )}

      {errorMessage ? <p className="text-sm font-medium text-rose-600">{errorMessage}</p> : <p className="text-xs text-slate-500">Pilih minimal satu siswa untuk dihubungkan dengan akun wali.</p>}
    </div>
  );
}
