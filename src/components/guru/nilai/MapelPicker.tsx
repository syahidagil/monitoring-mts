"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { BookOpen, Search, ChevronRight } from "lucide-react";

type Mapel = {
  jadwalId: number;
  kodeMapel: string;
  namaMapel: string;
  kelasNama: string;
  tingkat: number;
};

const WARNA = [
  "bg-emerald-50 text-emerald-700",
  "bg-blue-50 text-blue-700",
  "bg-violet-50 text-violet-700",
  "bg-amber-50 text-amber-700",
  "bg-rose-50 text-rose-700",
];

export default function MapelPicker({ daftar }: { daftar: Mapel[] }) {
  const [cari, setCari] = useState("");
  const [tingkat, setTingkat] = useState<number | "semua">("semua");

  const tingkatOpsi = useMemo(
    () => Array.from(new Set(daftar.map((d) => d.tingkat))).sort(),
    [daftar]
  );

  const hasil = useMemo(() => {
    const q = cari.trim().toLowerCase();
    return daftar.filter((d) => {
      const okTingkat = tingkat === "semua" || d.tingkat === tingkat;
      const okCari =
        q === "" ||
        d.namaMapel.toLowerCase().includes(q) ||
        d.kelasNama.toLowerCase().includes(q);
      return okTingkat && okCari;
    });
  }, [daftar, cari, tingkat]);

  return (
    <div className="space-y-5">
      {/* Filter */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="sm:col-span-2">
            <label className="block text-[11px] font-semibold text-gray-500 uppercase tracking-wide mb-1.5">
              Cari Mata Pelajaran / Kelas
            </label>
            <div className="relative">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                value={cari}
                onChange={(e) => setCari(e.target.value)}
                placeholder="mis. Matematika atau 7A"
                className="w-full border border-gray-300 rounded-lg pl-9 pr-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          </div>
          <div>
            <label className="block text-[11px] font-semibold text-gray-500 uppercase tracking-wide mb-1.5">
              Tingkat
            </label>
            <select
              value={tingkat}
              onChange={(e) =>
                setTingkat(e.target.value === "semua" ? "semua" : Number(e.target.value))
              }
              className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
              <option value="semua">Semua Tingkat</option>
              {tingkatOpsi.map((t) => (
                <option key={t} value={t}>
                  Kelas {t}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Kartu mapel */}
      {hasil.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-200 p-12 text-center text-sm text-gray-400">
          {daftar.length === 0
            ? "Anda belum memiliki jadwal mengajar."
            : "Tidak ada mata pelajaran yang cocok."}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {hasil.map((d, i) => (
            <Link
              key={d.jadwalId}
              href={`/guru/nilai/${d.jadwalId}`}
              className="flex items-center gap-4 bg-white rounded-2xl border border-gray-200 p-5 hover:shadow-md hover:border-emerald-200 transition-all group"
            >
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${WARNA[i % WARNA.length]}`}>
                <BookOpen size={20} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-gray-800 truncate">{d.namaMapel}</p>
                <p className="text-xs text-gray-500 mt-0.5">
                  Kelas {d.kelasNama} &middot; {d.kodeMapel}
                </p>
              </div>
              <ChevronRight className="w-5 h-5 text-gray-300 group-hover:text-emerald-600 transition-colors flex-shrink-0" />
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}