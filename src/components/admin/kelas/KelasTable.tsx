"use client";
import { useState, useTransition } from "react";
import Link from "next/link";
import { Edit, Trash2 } from "lucide-react";
import { deleteKelas } from "@/actions/kelas.action";

export default function KelasTable({ data }: { data: any[] }) {
  const [isPending, startTransition] = useTransition();
  const [confirmId, setConfirmId] = useState<number | null>(null);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  function handleDelete(id: number) {
    startTransition(async () => {
      const result = await deleteKelas(id);
      setMessage({ type: result.success ? "success" : "error", text: result.message });
      setConfirmId(null);
      setTimeout(() => setMessage(null), 4000);
    });
  }

  return (
    <div className="space-y-4">
      {message && (
        <div className={`px-4 py-3 rounded-lg text-sm font-medium ${message.type === "success" ? "bg-green-50 text-green-700 border border-green-200" : "bg-red-50 text-red-700 border border-red-200"}`}>
          {message.text}
        </div>
      )}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-200">
              <th className="text-left px-5 py-3.5 text-xs font-semibold text-gray-500 uppercase">Kelas</th>
              <th className="text-left px-5 py-3.5 text-xs font-semibold text-gray-500 uppercase">Tingkat</th>
              <th className="text-left px-5 py-3.5 text-xs font-semibold text-gray-500 uppercase">Tahun Ajaran</th>
              <th className="text-left px-5 py-3.5 text-xs font-semibold text-gray-500 uppercase">Wali Kelas</th>
              <th className="text-left px-5 py-3.5 text-xs font-semibold text-gray-500 uppercase">Jumlah Siswa</th>
              <th className="text-center px-5 py-3.5 text-xs font-semibold text-gray-500 uppercase">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {data.length === 0 && (
              <tr><td colSpan={6} className="text-center py-12 text-gray-400 text-sm">Belum ada data kelas</td></tr>
            )}
            {data.map((kelas) => (
              <tr key={kelas.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-5 py-4">
                  <span className="text-sm font-bold text-gray-800">Kelas {kelas.nama}</span>
                </td>
                <td className="px-5 py-4">
                  <span className="text-xs font-semibold bg-indigo-50 text-indigo-700 px-2.5 py-1 rounded-full">
                    Kelas {kelas.tingkat}
                  </span>
                </td>
                <td className="px-5 py-4 text-sm text-gray-600">
                  {kelas.tahunAjaran.nama} ({kelas.tahunAjaran.semester})
                </td>
                <td className="px-5 py-4 text-sm text-gray-600">{kelas.waliKelas?.user.name ?? "-"}</td>
                <td className="px-5 py-4">
                  <span className="text-xs font-semibold bg-green-50 text-green-700 px-2.5 py-1 rounded-full">
                    {kelas._count.siswa} siswa
                  </span>
                </td>
                <td className="px-5 py-4">
                  <div className="flex items-center justify-center gap-2">
                    <Link href={`/admin/data-kelas/${kelas.id}/edit`}
                      className="flex items-center gap-1 text-xs text-blue-600 border border-blue-200 px-2.5 py-1.5 rounded-lg hover:bg-blue-50 transition-colors">
                      <Edit className="w-3.5 h-3.5" /> Edit
                    </Link>
                    {confirmId === kelas.id ? (
                      <div className="flex gap-1">
                        <button onClick={() => handleDelete(kelas.id)} disabled={isPending}
                          className="text-xs text-white bg-red-500 hover:bg-red-600 px-2.5 py-1.5 rounded-lg">{isPending ? "..." : "Hapus"}</button>
                        <button onClick={() => setConfirmId(null)}
                          className="text-xs text-gray-500 border border-gray-200 px-2.5 py-1.5 rounded-lg">Batal</button>
                      </div>
                    ) : (
                      <button onClick={() => setConfirmId(kelas.id)}
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
      </div>
    </div>
  );
}