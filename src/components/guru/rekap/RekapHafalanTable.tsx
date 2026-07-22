"use client";
import { useState } from "react";
import { Search } from "lucide-react";

const S_COLOR: Record<string, string> = {
  BELUM:"bg-gray-100 text-gray-600", PROSES:"bg-blue-100 text-blue-700",
  LULUS:"bg-green-100 text-green-700", MENGULANG:"bg-red-100 text-red-700",
};

export default function RekapHafalanTable({ data }: { data: any[] }) {
  const [search, setSearch] = useState("");
  const filtered = data.filter((r) => r.siswa.nama.toLowerCase().includes(search.toLowerCase()));

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
              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Surah</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Ayat</th>
              <th className="text-center px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Juz</th>
              <th className="text-center px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Nilai</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Status</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Tanggal</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {filtered.length === 0 && (
              <tr><td colSpan={7} className="text-center py-12 text-gray-400 text-sm">Tidak ada data hafalan</td></tr>
            )}
            {filtered.map((r) => (
              <tr key={r.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-4 py-3">
                  <p className="text-sm font-medium text-gray-800">{r.siswa.nama}</p>
                  <p className="text-xs text-gray-400">Kelas {r.siswa.kelas.nama}</p>
                </td>
                <td className="px-4 py-3 text-sm text-gray-800 font-medium">{r.surah}</td>
                <td className="px-4 py-3 text-sm text-gray-600">{r.ayatMulai}–{r.ayatSelesai}</td>
                <td className="px-4 py-3 text-center text-sm text-gray-600">{r.juz ?? "-"}</td>
                <td className="px-4 py-3 text-center">
                  {r.nilai ? (
                    <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${Number(r.nilai) >= 80 ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"}`}>
                      {String(r.nilai)}
                    </span>
                  ) : <span className="text-gray-300 text-xs">—</span>}
                </td>
                <td className="px-4 py-3">
                  <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${S_COLOR[r.status]}`}>{r.status}</span>
                </td>
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