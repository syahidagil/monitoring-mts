"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { BookMarked, Search, Download, ChevronLeft, ChevronRight } from "lucide-react";
import type { SiswaTahsin, KelasRingkas } from "@/actions/guru/tahsin.action";

const PER_HALAMAN = 8;

function inisial(nama: string): string {
  const kata = nama.trim().split(/\s+/);
  if (kata.length === 1) return kata[0].slice(0, 2).toUpperCase();
  return (kata[0][0] + kata[1][0]).toUpperCase();
}

export default function TahsinSiswaList({
  siswa,
  kelasList,
}: {
  siswa: SiswaTahsin[];
  kelasList: KelasRingkas[];
}) {
  const [kelasId, setKelasId] = useState<number | "semua">(
    kelasList[0]?.id ?? "semua"
  );
  const [cari, setCari] = useState("");
  const [halaman, setHalaman] = useState(1);

  const terfilter = useMemo(() => {
    const q = cari.trim().toLowerCase();
    return siswa.filter((s) => {
      const cocokKelas = kelasId === "semua" || s.kelasId === kelasId;
      const cocokCari =
        q === "" ||
        s.nama.toLowerCase().includes(q) ||
        s.nis.toLowerCase().includes(q);
      return cocokKelas && cocokCari;
    });
  }, [siswa, kelasId, cari]);

  const totalHalaman = Math.max(1, Math.ceil(terfilter.length / PER_HALAMAN));
  const halamanAktif = Math.min(halaman, totalHalaman);
  const mulai = (halamanAktif - 1) * PER_HALAMAN;
  const tampil = terfilter.slice(mulai, mulai + PER_HALAMAN);

  function ubahKelas(v: string) {
    setKelasId(v === "semua" ? "semua" : Number(v));
    setHalaman(1);
  }
  function ubahCari(v: string) {
    setCari(v);
    setHalaman(1);
  }

  const namaKelasAktif =
    kelasId === "semua"
      ? "Semua Kelas"
      : kelasList.find((k) => k.id === kelasId)?.nama ?? "";

  return (
    <div className="space-y-5">
      {/* Filter */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5">
        <div className="flex items-center gap-2 mb-4">
          <span className="text-emerald-700">
            <BookMarked size={16} />
          </span>
          <h2 className="text-sm font-bold text-gray-800">Filter Data Siswa</h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-[11px] font-semibold text-gray-500 uppercase tracking-wide mb-1.5">
              Pilih Kelas
            </label>
            <select
              value={kelasId}
              onChange={(e) => ubahKelas(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
              {kelasList.length > 1 && <option value="semua">Semua Kelas</option>}
              {kelasList.map((k) => (
                <option key={k.id} value={k.id}>
                  {k.nama}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-gray-500 uppercase tracking-wide mb-1.5">
              Cari Siswa
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                <Search size={16} />
              </span>
              <input
                value={cari}
                onChange={(e) => ubahCari(e.target.value)}
                placeholder="Nama atau NIS siswa..."
                className="w-full border border-gray-300 rounded-lg pl-9 pr-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Tabel */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h3 className="text-sm font-bold text-gray-800">
            Daftar Siswa {namaKelasAktif}
          </h3>
          <button
            type="button"
            disabled={terfilter.length === 0}
            className="flex items-center gap-2 text-xs font-medium text-gray-600 border border-gray-200 rounded-lg px-3 py-2 hover:bg-gray-50 disabled:opacity-40"
          >
            <Download size={14} /> Ekspor
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50/70 text-[11px] text-gray-500 uppercase tracking-wide">
                <th className="text-left font-semibold px-6 py-3 w-12">No</th>
                <th className="text-left font-semibold px-4 py-3">Nama Siswa</th>
                <th className="text-left font-semibold px-4 py-3">Kelas</th>
                <th className="text-center font-semibold px-4 py-3">Juz Terakhir</th>
                <th className="text-center font-semibold px-4 py-3">Halaman</th>
                <th className="text-right font-semibold px-6 py-3">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {tampil.map((s, i) => (
                <tr key={s.id} className="hover:bg-gray-50/60 transition-colors">
                  <td className="px-6 py-4 text-gray-400 tabular-nums">
                    {String(mulai + i + 1).padStart(2, "0")}
                  </td>
                  <td className="px-4 py-4">
                    <div className="flex items-center gap-3">
                      <span className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-700 text-[11px] font-bold flex items-center justify-center flex-shrink-0">
                        {inisial(s.nama)}
                      </span>
                      <div className="min-w-0">
                        <p className="font-medium text-gray-800 truncate">{s.nama}</p>
                        <p className="text-xs text-gray-400">{s.nis}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-4 text-gray-600">{s.kelasNama}</td>
                  <td className="px-4 py-4 text-center">
                    {s.juzTerakhir ? (
                      <span className="font-bold text-emerald-700">{s.juzTerakhir}</span>
                    ) : (
                      <span className="text-gray-300">–</span>
                    )}
                  </td>
                  <td className="px-4 py-4 text-center text-gray-600">
                    {s.halamanTerakhir ?? <span className="text-gray-300">–</span>}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <Link
                      href={`/guru/tahsin/${s.id}`}
                      className="inline-flex items-center gap-2 bg-[#1B5E20] hover:bg-[#2E7D32] text-white text-xs font-semibold px-4 py-2.5 rounded-lg transition-colors"
                    >
                      <BookMarked size={14} /> Input Tahsin
                    </Link>
                  </td>
                </tr>
              ))}

              {tampil.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-6 py-14 text-center">
                    <p className="text-sm text-gray-500">
                      {siswa.length === 0
                        ? "Belum ada siswa non-tahfidz di kelas yang Anda ajar."
                        : "Tidak ada siswa yang cocok dengan filter."}
                    </p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="flex items-center justify-between px-6 py-4 bg-gray-50/50 border-t border-gray-100">
          <p className="text-xs text-gray-500">
            Menampilkan {tampil.length} dari {terfilter.length} siswa
          </p>
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => setHalaman((h) => Math.max(1, h - 1))}
              disabled={halamanAktif <= 1}
              className="w-8 h-8 rounded-lg border border-gray-200 flex items-center justify-center text-gray-500 hover:bg-white disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <ChevronLeft size={16} />
            </button>
            <span className="text-xs text-gray-500 px-2 tabular-nums">
              {halamanAktif} / {totalHalaman}
            </span>
            <button
              type="button"
              onClick={() => setHalaman((h) => Math.min(totalHalaman, h + 1))}
              disabled={halamanAktif >= totalHalaman}
              className="w-8 h-8 rounded-lg border border-gray-200 flex items-center justify-center text-gray-500 hover:bg-white disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}