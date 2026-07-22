"use client";
import { useState } from "react";
import { Search } from "lucide-react";

const JENIS_COLOR: Record<string, string> = {
  HARIAN:"bg-blue-50 text-blue-700", UTS:"bg-purple-50 text-purple-700",
  UAS:"bg-red-50 text-red-700", TUGAS:"bg-yellow-50 text-yellow-700",
  PRAKTIK:"bg-green-50 text-green-700",
};

export default function RekapNilaiTable({ data }: { data: any[] }) {
  const [search, setSearch] = useState("");
  const filtered = data.filter((r) =>
    r.siswa.nama.toLowerCase().includes(search.toLowerCase()) ||
    r.siswa.nis.includes(search)
  );

  return (
    <div className="space-y-4">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input value={search} onChange={(e) => setSearch(e.target.value)}
          placeholder="Cari nama atau NIS..."
          className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500" />
      </div>

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-200">
              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase w-10">No</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Siswa</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Kelas</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Rincian Nilai</th>
              <th className="text-center px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Rata-rata</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {filtered.length === 0 && (
              <tr><td colSpan={5} className="text-center py-12 text-gray-400 text-sm">Tidak ada data nilai</td></tr>
            )}
            {filtered.map((r, i) => (
              <tr key={r.siswa.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-4 py-3 text-sm text-gray-400">{i + 1}</td>
                <td className="px-4 py-3">
                  <p className="text-sm font-medium text-gray-800">{r.siswa.nama}</p>
                  <p className="text-xs text-gray-400">{r.siswa.nis}</p>
                </td>
                <td className="px-4 py-3 text-sm text-gray-600">{r.kelas}</td>
                <td className="px-4 py-3">
                  <div className="flex flex-wrap gap-1.5">
                    {r.nilaiList.map((n: any, j: number) => (
                      <span key={j} className={`text-xs px-2 py-0.5 rounded-full font-medium ${JENIS_COLOR[n.jenis] ?? "bg-gray-100 text-gray-600"}`}>
                        {n.jenis}: {n.nilai}
                      </span>
                    ))}
                  </div>
                </td>
                <td className="px-4 py-3 text-center">
                  <span className={`text-sm font-bold px-3 py-1 rounded-full ${Number(r.rata) >= 75 ? "bg-green-100 text-green-700" : Number(r.rata) >= 60 ? "bg-yellow-100 text-yellow-700" : "bg-red-100 text-red-700"}`}>
                    {r.rata}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}