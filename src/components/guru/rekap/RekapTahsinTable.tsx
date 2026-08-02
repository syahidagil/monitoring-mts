"use client";
import { useState } from "react";
import { Search, BookOpen } from "lucide-react";

export default function RekapTahsinTable({ data }: { data: any[] }) {
  const [search, setSearch] = useState("");
  const filtered = data.filter((r) =>
    r.siswa.nama.toLowerCase().includes(search.toLowerCase()) ||
    (r.surat && r.surat.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="space-y-4">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Cari nama siswa atau surat..."
          className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500 bg-white"
        />
      </div>
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-x-auto">
        <table className="w-full min-w-[560px]">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-200">
              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Siswa</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Surat &amp; Rentang Ayat</th>
              <th className="text-center px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Juz</th>
              <th className="text-center px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Halaman</th>
              <th className="text-center px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Tajwid</th>
              <th className="text-center px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Makhraj</th>
              <th className="text-center px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Sifatul</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Tanggal</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {filtered.length === 0 && (
              <tr>
                <td colSpan={8} className="text-center py-12 text-gray-400 text-sm">
                  <BookOpen className="w-8 h-8 mx-auto mb-2 opacity-30" />
                  Tidak ada data tahsin
                </td>
              </tr>
            )}
            {filtered.map((r) => (
              <tr key={r.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-4 py-3">
                  <p className="text-sm font-medium text-gray-800">{r.siswa.nama}</p>
                  <p className="text-xs text-gray-400">{r.siswa.nis} • Kelas {r.siswa.kelas.nama}</p>
                </td>
                <td className="px-4 py-3 text-sm text-gray-800 font-semibold">{r.surat}</td>
                <td className="px-4 py-3 text-center text-sm text-gray-600 font-mono">
                  {r.juz ? `Juz ${r.juz}` : "-"}
                </td>
                <td className="px-4 py-3 text-center text-sm text-gray-600 font-mono">
                  {r.halaman ? `Hal. ${r.halaman}` : "-"}
                </td>
                <td className="px-4 py-3 text-center">
                  <span className={`text-xs font-bold px-2 py-0.5 rounded ${r.tajwid === "L" ? "bg-green-100 text-green-700" : "bg-amber-100 text-amber-700"}`}>
                    {r.tajwid}
                  </span>
                </td>
                <td className="px-4 py-3 text-center">
                  <span className={`text-xs font-bold px-2 py-0.5 rounded ${r.makhraj === "L" ? "bg-green-100 text-green-700" : "bg-amber-100 text-amber-700"}`}>
                    {r.makhraj}
                  </span>
                </td>
                <td className="px-4 py-3 text-center">
                  <span className={`text-xs font-bold px-2 py-0.5 rounded ${r.sifatul === "L" ? "bg-green-100 text-green-700" : "bg-amber-100 text-amber-700"}`}>
                    {r.sifatul}
                  </span>
                </td>
                <td className="px-4 py-3 text-xs text-gray-500">
                  {new Date(r.tanggal).toLocaleDateString("id-ID", {
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                  })}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}