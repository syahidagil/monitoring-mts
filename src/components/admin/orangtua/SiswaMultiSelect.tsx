"use client";
import { useState, useEffect, useRef, useCallback } from "react";
import { Search, X, User } from "lucide-react";
import { searchSiswaForSelect } from "@/actions/siswa.action";

type SiswaItem = { id: number; nis: string; nama: string; kelasNama: string };

type Props = {
  defaultSelected?: SiswaItem[];
  error?: string;
};

export default function SiswaMultiSelect({ defaultSelected = [], error }: Props) {
  const [selected, setSelected] = useState<SiswaItem[]>(defaultSelected);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SiswaItem[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const debounceRef = useRef<NodeJS.Timeout>();
  const wrapperRef = useRef<HTMLDivElement>(null);

  const search = useCallback(async (q: string) => {
    if (!q.trim()) { setResults([]); setShowDropdown(false); return; }
    setIsSearching(true);
    try {
      const data = await searchSiswaForSelect(q);
      const filtered = data.filter((s) => !selected.some((sel) => sel.id === s.id));
      setResults(filtered);
      setShowDropdown(true);
    } finally {
      setIsSearching(false);
    }
  }, [selected]);

  useEffect(() => {
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => search(query), 300);
    return () => clearTimeout(debounceRef.current);
  }, [query, search]);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setShowDropdown(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  function addSiswa(siswa: SiswaItem) {
    setSelected((prev) => [...prev, siswa]);
    setQuery("");
    setResults([]);
    setShowDropdown(false);
  }

  function removeSiswa(id: number) {
    setSelected((prev) => prev.filter((s) => s.id !== id));
  }

  return (
    <div ref={wrapperRef} className="space-y-2">
      {/* Hidden inputs untuk submit form */}
      {selected.map((s) => (
        <input key={s.id} type="hidden" name="siswaIds" value={s.id} />
      ))}

      {/* Chips siswa terpilih */}
      {selected.length > 0 && (
        <div className="flex flex-wrap gap-2 p-3 bg-green-50 border border-green-100 rounded-lg">
          {selected.map((s) => (
            <div key={s.id}
              className="flex items-center gap-1.5 bg-white border border-green-200 text-green-800 text-xs font-medium px-2.5 py-1.5 rounded-lg shadow-sm">
              <User className="w-3 h-3" />
              <span>{s.nama}</span>
              <span className="text-green-400">-</span>
              <span className="text-green-600">{s.nis}</span>
              <span className="text-green-400">-</span>
              <span className="text-green-600">{s.kelasNama}</span>
              <button type="button" onClick={() => removeSiswa(s.id)}
                className="ml-1 text-green-400 hover:text-red-500 transition-colors">
                <X className="w-3 h-3" />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Search input */}
      <div className="relative">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onFocus={() => query && setShowDropdown(true)}
            className="w-full pl-9 pr-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500 bg-white"
            placeholder="Cari Nama/NIS/Kelas..."
          />
          {isSearching && (
            <span className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 border-2 border-green-400 border-t-transparent rounded-full animate-spin" />
          )}
        </div>

        {showDropdown && results.length > 0 && (
          <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-xl shadow-lg z-20 max-h-48 overflow-y-auto">
            {results.map((s) => (
              <button key={s.id} type="button" onClick={() => addSiswa(s)}
                className="w-full flex items-center gap-3 px-4 py-3 hover:bg-green-50 transition-colors text-left border-b border-gray-50 last:border-0">
                <div className="w-7 h-7 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-xs font-bold text-green-700">{s.nama.charAt(0)}</span>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-800">{s.nama}</p>
                  <p className="text-xs text-gray-400">{s.nis} • Kelas {s.kelasNama}</p>
                </div>
              </button>
            ))}
          </div>
        )}

        {showDropdown && results.length === 0 && query && !isSearching && (
          <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-xl shadow-lg z-20 p-4 text-center text-sm text-gray-400">
            Siswa tidak ditemukan
          </div>
        )}
      </div>

      {error && <p className="text-xs text-red-500 flex items-center gap-1">{error}</p>}

      {selected.length === 0 && (
        <p className="text-xs text-gray-400">Belum ada siswa dipilih. Cari dan pilih siswa di atas.</p>
      )}
    </div>
  );
}