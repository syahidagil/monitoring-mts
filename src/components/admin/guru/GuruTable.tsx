"use client";
import { useState, useTransition } from "react";
import Link from "next/link";
import { Edit, Trash2, Search } from "lucide-react";
import { deleteGuru } from "@/actions/guru.action";

export default function GuruTable({ data }: { data: any[] }) {
  const [search, setSearch] = useState("");
  const [isPending, startTransition] = useTransition();
  const [confirmId, setConfirmId] = useState<string | null>(null);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const filtered = data.filter(
    (g) => g.user.name.toLowerCase().includes(search.toLowerCase()) ||
           g.mapel.toLowerCase().includes(search.toLowerCase()) ||
           (g.nip && g.nip.includes(search))
  );

  function handleDelete(id: string) {
    startTransition(async () => {
      const result = await deleteGuru(id);
      setMessage({ type: result.success ? "success" : "error", text: result.message });
      setConfirmId(null);
      setTimeout(() => setMessage(null), 3000);
    });
  }

  return (
    <div className="space-y-4">
      {message && (
        <div className={`px-4 py-3 rounded-lg text-sm font-medium ${message.type === "success" ? "bg-green-50 text-green-700 border border-green-200" : "bg-red-50 text-red-700 border border-red-200"}`}>
          {message.text}
        </div>
      )}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input value={search} onChange={(e) => setSearch(e.target.value)}
          placeholder="Cari nama atau mata pelajaran..."
          className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500" />
      </div>
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-200">
              <th className="text-left px-5 py-3.5 text-xs font-semibold text-gray-500 uppercase">Nama Guru</th>
              <th className="text-left px-5 py-3.5 text-xs font-semibold text-gray-500 uppercase">NIP</th>
              <th className="text-left px-5 py-3.5 text-xs font-semibold text-gray-500 uppercase">Mata Pelajaran</th>
              <th className="text-left px-5 py-3.5 text-xs font-semibold text-gray-500 uppercase">No. HP</th>
              <th className="text-left px-5 py-3.5 text-xs font-semibold text-gray-500 uppercase">Status</th>
              <th className="text-center px-5 py-3.5 text-xs font-semibold text-gray-500 uppercase">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {filtered.length === 0 && (
              <tr><td colSpan={6} className="text-center py-12 text-gray-400 text-sm">Belum ada data guru</td></tr>
            )}
            {filtered.map((guru) => (
              <tr key={guru.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-5 py-4">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <span className="text-xs font-bold text-blue-700">{guru.user.name.charAt(0)}</span>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-800">{guru.user.name}</p>
                      <p className="text-xs text-gray-400">{guru.user.username}</p>
                    </div>
                  </div>
                </td>
                <td className="px-5 py-4 text-sm font-mono text-gray-600">{guru.nip ?? "-"}</td>
                <td className="px-5 py-4">
                  <span className="text-xs font-semibold bg-purple-50 text-purple-700 px-2.5 py-1 rounded-full">{guru.mapel}</span>
                </td>
                <td className="px-5 py-4 text-sm text-gray-500">{guru.noHp ?? "-"}</td>
                <td className="px-5 py-4">
                  <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${guru.user.status ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"}`}>
                    {guru.user.status ? "Aktif" : "Nonaktif"}
                  </span>
                </td>
                <td className="px-5 py-4">
                  <div className="flex items-center justify-center gap-2">
                    <Link href={`/admin/data-guru/${guru.id}/edit`}
                      className="flex items-center gap-1 text-xs text-blue-600 border border-blue-200 px-2.5 py-1.5 rounded-lg hover:bg-blue-50 transition-colors">
                      <Edit className="w-3.5 h-3.5" /> Edit
                    </Link>
                    {confirmId === guru.id ? (
                      <div className="flex gap-1">
                        <button onClick={() => handleDelete(guru.id)} disabled={isPending}
                          className="text-xs text-white bg-red-500 hover:bg-red-600 px-2.5 py-1.5 rounded-lg">{isPending ? "..." : "Hapus"}</button>
                        <button onClick={() => setConfirmId(null)}
                          className="text-xs text-gray-500 border border-gray-200 px-2.5 py-1.5 rounded-lg">Batal</button>
                      </div>
                    ) : (
                      <button onClick={() => setConfirmId(guru.id)}
                        className="flex items-center gap-1 text-xs text-red-500 border border-red-200 px-2.5 py-1.5 rounded-lg hover:bg-red-50 transition-colors">
                        <Trash2 className="w-3.5 h-3.5" /> Hapus
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <div className="px-5 py-3 bg-gray-50 border-t border-gray-100 text-xs text-gray-400">
          Menampilkan {filtered.length} dari {data.length} guru
        </div>
      </div>
    </div>
  );
}