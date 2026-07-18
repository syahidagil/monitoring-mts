"use client";
import { useState, useTransition } from "react";
import Link from "next/link";
import { Edit, Trash2 } from "lucide-react";
import { deleteKelas } from "@/actions/kelas.action";
import ConfirmDeleteDialog from "@/components/admin/shared/ConfirmDeleteDialog";

export default function KelasTable({ data }: { data: any[] }) {
  const [isPending, startTransition] = useTransition();
  const [deleteTarget, setDeleteTarget] = useState<{ id: number; nama: string } | null>(null);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  async function handleDelete() {
    if (!deleteTarget) return;
    startTransition(async () => {
      const result = await deleteKelas(deleteTarget.id);
      setMessage({ type: result.success ? "success" : "error", text: result.message });
      setDeleteTarget(null);
      setTimeout(() => setMessage(null), 4000);
    });
  }

  return (
    <>
      {message && (
        <div className={`px-4 py-3 rounded-lg text-sm font-medium ${message.type === "success" ? "bg-green-50 text-green-700 border border-green-200" : "bg-red-50 text-red-700 border border-red-200"}`}>
          {message.text}
        </div>
      )}

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-200">
              <th className="text-left px-4 py-3.5 text-xs font-semibold text-gray-500 uppercase w-12">No</th>
              <th className="text-left px-4 py-3.5 text-xs font-semibold text-gray-500 uppercase">Nama Kelas</th>
              <th className="text-left px-4 py-3.5 text-xs font-semibold text-gray-500 uppercase">Tingkat</th>
              <th className="text-left px-4 py-3.5 text-xs font-semibold text-gray-500 uppercase">Tahun Ajaran</th>
              <th className="text-left px-4 py-3.5 text-xs font-semibold text-gray-500 uppercase">Wali Kelas</th>
              <th className="text-left px-4 py-3.5 text-xs font-semibold text-gray-500 uppercase">Jml Siswa</th>
              <th className="text-center px-4 py-3.5 text-xs font-semibold text-gray-500 uppercase">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {data.length === 0 && (
              <tr><td colSpan={7} className="text-center py-16 text-gray-400 text-sm">Belum ada data kelas</td></tr>
            )}
            {data.map((kelas, i) => {
              const hasSiswa = kelas._count.siswa > 0;
              return (
                <tr key={kelas.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3.5 text-sm text-gray-400">{i + 1}</td>
                  <td className="px-4 py-3.5">
                    <span className="text-sm font-bold text-gray-800">Kelas {kelas.nama}</span>
                  </td>
                  <td className="px-4 py-3.5">
                    <span className="text-xs font-semibold bg-indigo-50 text-indigo-700 px-2.5 py-1 rounded-full">Kelas {kelas.tingkat}</span>
                  </td>
                  <td className="px-4 py-3.5 text-sm text-gray-600">
                    {kelas.tahunAjaran.nama} <span className="text-gray-400 text-xs">({kelas.tahunAjaran.semester})</span>
                  </td>
                  <td className="px-4 py-3.5 text-sm text-gray-600">{kelas.waliKelas?.user.name ?? <span className="text-gray-300 text-xs italic">Belum ditentukan</span>}</td>
                  <td className="px-4 py-3.5">
                    <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${kelas._count.siswa > 0 ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-400"}`}>
                      {kelas._count.siswa} siswa
                    </span>
                  </td>
                  <td className="px-4 py-3.5">
                    <div className="flex items-center justify-center gap-2">
                      <Link href={`/admin/data-kelas/${kelas.id}/edit`}
                        className="flex items-center gap-1 text-xs text-blue-600 border border-blue-200 px-2.5 py-1.5 rounded-lg hover:bg-blue-50 transition-colors">
                        <Edit className="w-3.5 h-3.5" /> Edit
                      </Link>
                      <button
                        onClick={() => !hasSiswa && setDeleteTarget({ id: kelas.id, nama: kelas.nama })}
                        disabled={hasSiswa}
                        title={hasSiswa ? `Tidak bisa dihapus: masih ada ${kelas._count.siswa} siswa` : "Hapus kelas"}
                        className={`flex items-center gap-1 text-xs px-2.5 py-1.5 rounded-lg border transition-colors ${hasSiswa ? "opacity-40 cursor-not-allowed border-gray-200 text-gray-400" : "text-red-500 border-red-200 hover:bg-red-50"}`}>
                        <Trash2 className="w-3.5 h-3.5" /> Hapus
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <ConfirmDeleteDialog
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        title="Hapus Data Kelas"
        description={`Apakah Anda yakin ingin menghapus kelas "${deleteTarget?.nama}"?`}
        isLoading={isPending}
      />
    </>
  );
}