"use client";
import { useState } from "react";
import { Search, Download } from "lucide-react";

const STATUS_COLOR: Record<string, string> = {
  HADIR:"bg-green-100 text-green-700", SAKIT:"bg-blue-100 text-blue-700",
  IZIN:"bg-yellow-100 text-yellow-700", ALPHA:"bg-red-100 text-red-700",
};

export default function RekapAbsensiTable({ data }: { data: any[] }) {
  const [search, setSearch] = useState("");
  const filtered = data.filter((r) =>
    r.siswa.nama.toLowerCase().includes(search.toLowerCase()) ||
    r.siswa.nis.includes(search)
  );

  const totalHadir = filtered.reduce((a, r) => a + r.HADIR, 0);
  const totalAlpha = filtered.reduce((a, r) => a + r.ALPHA, 0);

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input value={search} onChange={(e) => setSearch(e.target.value)}
            placeholder="Cari nama atau NIS..."
            className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500" />
        </div>
        <div className="flex items-center gap-3 text-xs text-gray-500">
          <span className="font-semibold text-green-700">{totalHadir} Hadir</span>
          <span className="font-semibold text-red-600">{totalAlpha} Alpha</span>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-200">
              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase w-10">No</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Siswa</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Kelas</th>
              <th className="text-center px-4 py-3 text-xs font-semibold text-green-600 uppercase">H</th>
              <th className="text-center px-4 py-3 text-xs font-semibold text-blue-600 uppercase">S</th>
              <th className="text-center px-4 py-3 text-xs font-semibold text-yellow-600 uppercase">I</th>
              <th className="text-center px-4 py-3 text-xs font-semibold text-red-600 uppercase">A</th>
              <th className="text-center px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Total</th>
              <th className="text-center px-4 py-3 text-xs font-semibold text-gray-500 uppercase">% Hadir</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {filtered.length === 0 && (
              <tr><td colSpan={9} className="text-center py-12 text-gray-400 text-sm">Tidak ada data</td></tr>
            )}
            {filtered.map((r, i) => {
              const pct = r.total > 0 ? ((r.HADIR / r.total) * 100).toFixed(0) : "0";
              return (
                <tr key={r.siswa.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3 text-sm text-gray-400">{i + 1}</td>
                  <td className="px-4 py-3">
                    <p className="text-sm font-medium text-gray-800">{r.siswa.nama}</p>
                    <p className="text-xs text-gray-400">{r.siswa.nis}</p>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600">{r.kelas}</td>
                  <td className="px-4 py-3 text-center text-sm font-semibold text-green-700">{r.HADIR}</td>
                  <td className="px-4 py-3 text-center text-sm font-semibold text-blue-700">{r.SAKIT}</td>
                  <td className="px-4 py-3 text-center text-sm font-semibold text-yellow-700">{r.IZIN}</td>
                  <td className="px-4 py-3 text-center text-sm font-semibold text-red-700">{r.ALPHA}</td>
                  <td className="px-4 py-3 text-center text-sm text-gray-600">{r.total}</td>
                  <td className="px-4 py-3 text-center">
                    <span className={`text-xs font-bold px-2 py-1 rounded-full ${Number(pct) >= 80 ? "bg-green-100 text-green-700" : Number(pct) >= 60 ? "bg-yellow-100 text-yellow-700" : "bg-red-100 text-red-700"}`}>
                      {pct}%
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        <div className="px-4 py-3 bg-gray-50 border-t border-gray-100 text-xs text-gray-400">
          {filtered.length} siswa • H=Hadir, S=Sakit, I=Izin, A=Alpha
        </div>
      </div>
    </div>
  );
}