"use client";
import { useState } from "react";
import { Search } from "lucide-react";

const P_COLOR: Record<string, string> = {
  SB:"bg-green-100 text-green-700", B:"bg-blue-100 text-blue-700",
  C:"bg-yellow-100 text-yellow-700", K:"bg-red-100 text-red-700",
};
const P_LABEL: Record<string, string> = { SB:"Sangat Baik", B:"Baik", C:"Cukup", K:"Kurang" };

export default function RekapSikapTable({ data }: { data: any[] }) {
  const [search, setSearch] = useState("");
  const filtered = data.filter((r) =>
    r.siswa.nama.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-4">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input value={search} onChange={(e) => setSearch(e.target.value)}
          placeholder="Cari nama siswa..."
          className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500" />
      </div>
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-200">
              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Siswa</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Aspek</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Predikat</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Deskripsi</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Tanggal</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {filtered.length === 0 && (
              <tr><td colSpan={5} className="text-center py-12 text-gray-400 text-sm">Tidak ada data</td></tr>
            )}
            {filtered.map((r) => (
              <tr key={r.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-4 py-3">
                  <p className="text-sm font-medium text-gray-800">{r.siswa.nama}</p>
                  <p className="text-xs text-gray-400">Kelas {r.siswa.kelas.nama}</p>
                </td>
                <td className="px-4 py-3 text-sm text-gray-700">{r.aspek}</td>
                <td className="px-4 py-3">
                  <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${P_COLOR[r.predikat]}`}>{P_LABEL[r.predikat]}</span>
                </td>
                <td className="px-4 py-3 text-xs text-gray-500 max-w-xs truncate">{r.deskripsi ?? "-"}</td>
                <td className="px-4 py-3 text-xs text-gray-500">
                  {new Date(r.tanggal).toLocaleDateString("id-ID", { day:"numeric", month:"short", year:"numeric" })}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}