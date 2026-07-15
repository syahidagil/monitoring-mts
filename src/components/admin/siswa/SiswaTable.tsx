"use client";
import { useState, useTransition } from "react";
import Link from "next/link";
import { Edit, Trash2, Search, Eye } from "lucide-react";
import { deleteSiswa } from "@/actions/siswa.action";

type Siswa = {
  id: number;
  nis: string;
  nama: string;
  jenisKelamin: string;
  status: boolean;
  kelas: { nama: string };
  orangTua: { user: { name: string } } | null;
};

export default function SiswaTable({ data }: { data: Siswa[] }) {
  const [search, setSearch] = useState("");
  const [isPending, startTransition] = useTransition();
  const [confirmId, setConfirmId] = useState<number | null>(null);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const filtered = data.filter(
    (s) =>
      s.nama.toLowerCase().includes(search.toLowerCase()) ||
      s.nis.includes(search) ||
      s.kelas.nama.toLowerCase().includes(search.toLowerCase())
  );

  function handleDelete(id: number) {
    startTransition(async () => {
      const result = await deleteSiswa(id);
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
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Cari nama, NIS, atau kelas..."
          className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
        />
      </div>

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-200">
              <th className="text-left px-5 py-3.5 text-xs font-semibold text-gray-500 uppercase">NIS</th>
              <th className="text-left px-5 py-3.5 text-xs font-semibold text-gray-500 uppercase">Nama Siswa</th>
              <th className="text-left px-5 py-3.5 text-xs font-semibold text-gray-500 uppercase">Kelas</th>
              <th className="text-left px-5 py-3.5 text-xs font-semibold text-gray-500 uppercase">L/P</th>
              <th className="text-left px-5 py-3.5 text-xs font-semibold text-gray-500 uppercase">Orang Tua</th>
              <th className="text-left px-5 py-3.5 text-xs font-semibold text-gray-500 uppercase">Status</th>
              <th className="text-center px-5 py-3.5 text-xs font-semibold text-gray-500 uppercase">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {filtered.length === 0 && (
              <tr>
                <td colSpan={7} className="text-center py-12 text-gray-400 text-sm">
                  {search ? "Tidak ada siswa yang cocok" : "Belum ada data siswa"}
                </td>
              </tr>
            )}
            {filtered.map((siswa) => (
              <tr key={siswa.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-5 py-4 text-sm font-mono text-gray-600">{siswa.nis}</td>
                <td className="px-5 py-4">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <span className="text-xs font-bold text-green-700">{siswa.nama.charAt(0)}</span>
                    </div>
                    <span className="text-sm font-medium text-gray-800">{siswa.nama}</span>
                  </div>
                </td>
                <td className="px-5 py-4">
                  <span className="text-xs font-semibold bg-blue-50 text-blue-700 px-2.5 py-1 rounded-full">
                    {siswa.kelas.nama}
                  </span>
                </td>
                <td className="px-5 py-4 text-sm text-gray-600">{siswa.jenisKelamin === "L" ? "Laki-laki" : "Perempuan"}</td>
                <td className="px-5 py-4 text-sm text-gray-500">{siswa.orangTua?.user.name ?? "-"}</td>
                <td className="px-5 py-4">
                  <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${siswa.status ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"}`}>
                    {siswa.status ? "Aktif" : "Nonaktif"}
                  </span>
                </td>
                <td className="px-5 py-4">
                  <div className="flex items-center justify-center gap-2">
                    <Link href={`/admin/data-siswa/${siswa.id}/edit`}
                      className="flex items-center gap-1 text-xs text-blue-600 border border-blue-200 px-2.5 py-1.5 rounded-lg hover:bg-blue-50 transition-colors">
                      <Edit className="w-3.5 h-3.5" /> Edit
                    </Link>
                    {confirmId === siswa.id ? (
                      <div className="flex gap-1">
                        <button onClick={() => handleDelete(siswa.id)} disabled={isPending}
                          className="text-xs text-white bg-red-500 hover:bg-red-600 px-2.5 py-1.5 rounded-lg">
                          {isPending ? "..." : "Hapus"}
                        </button>
                        <button onClick={() => setConfirmId(null)}
                          className="text-xs text-gray-500 border border-gray-200 px-2.5 py-1.5 rounded-lg">
                          Batal
                        </button>
                      </div>
                    ) : (
                      <button onClick={() => setConfirmId(siswa.id)}
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
          Menampilkan {filtered.length} dari {data.length} siswa
        </div>
      </div>
    </div>
  );
}