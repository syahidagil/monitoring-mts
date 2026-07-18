"use client";
import { useState, useTransition } from "react";
import Link from "next/link";
import { Edit, Trash2 } from "lucide-react";
import { deleteTahunAjaran } from "@/actions/tahunAjaran.action";
import AktifToggle from "./AktifToggle";
import ConfirmDeleteDialog from "@/components/admin/shared/ConfirmDeleteDialog";

export default function TahunPelajaranTable({ data }: { data: any[] }) {
  const [isPending, startTransition] = useTransition();
  const [deleteTarget, setDeleteTarget] = useState<{ id: number; nama: string } | null>(null);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  async function handleDelete() {
    if (!deleteTarget) return;
    startTransition(async () => {
      const result = await deleteTahunAjaran(deleteTarget.id);
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
              <th className="text-left px-4 py-3.5 text-xs font-semibold text-gray-500 uppercase">Tahun Ajaran</th>
              <th className="text-left px-4 py-3.5 text-xs font-semibold text-gray-500 uppercase">Semester</th>
              <th className="text-left px-4 py-3.5 text-xs font-semibold text-gray-500 uppercase">Jumlah Kelas</th>
              <th className="text-left px-4 py-3.5 text-xs font-semibold text-gray-500 uppercase">Status</th>
              <th className="text-center px-4 py-3.5 text-xs font-semibold text-gray-500 uppercase">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {data.length === 0 && (
              <tr><td colSpan={6} className="text-center py-16 text-gray-400 text-sm">Belum ada data tahun ajaran</td></tr>
            )}
            {data.map((ta, i) => (
              <tr key={ta.id} className={`hover:bg-gray-50 transition-colors ${ta.aktif ? "bg-green-50/30" : ""}`}>
                <td className="px-4 py-3.5 text-sm text-gray-400">{i + 1}</td>
                <td className="px-4 py-3.5">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-gray-800">{ta.nama}</span>
                    {ta.aktif && (
                      <span className="text-[10px] font-bold bg-green-500 text-white px-2 py-0.5 rounded-full">AKTIF</span>
                    )}
                  </div>
                </td>
                <td className="px-4 py-3.5">
                  <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${ta.semester === "GANJIL" ? "bg-blue-50 text-blue-700" : "bg-orange-50 text-orange-700"}`}>
                    {ta.semester}
                  </span>
                </td>
                <td className="px-4 py-3.5">
                  <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${ta._count.kelas > 0 ? "bg-indigo-50 text-indigo-700" : "bg-gray-100 text-gray-400"}`}>
                    {ta._count.kelas} kelas
                  </span>
                </td>
                <td className="px-4 py-3.5">
                  <AktifToggle id={ta.id} isAktif={ta.aktif} />
                </td>
                <td className="px-4 py-3.5">
                  <div className="flex items-center justify-center gap-2">
                    <Link href={`/admin/tahun-pelajaran/${ta.id}/edit`}
                      className="flex items-center gap-1 text-xs text-blue-600 border border-blue-200 px-2.5 py-1.5 rounded-lg hover:bg-blue-50 transition-colors">
                      <Edit className="w-3.5 h-3.5" /> Edit
                    </Link>
                    <button
                      onClick={() => !ta.aktif && setDeleteTarget({ id: ta.id, nama: ta.nama })}
                      disabled={ta.aktif || ta._count.kelas > 0}
                      title={ta.aktif ? "Tidak bisa menghapus tahun ajaran aktif" : ta._count.kelas > 0 ? `Masih ada ${ta._count.kelas} kelas` : "Hapus"}
                      className={`flex items-center gap-1 text-xs px-2.5 py-1.5 rounded-lg border transition-colors ${ta.aktif || ta._count.kelas > 0 ? "opacity-40 cursor-not-allowed border-gray-200 text-gray-400" : "text-red-500 border-red-200 hover:bg-red-50"}`}>
                      <Trash2 className="w-3.5 h-3.5" /> Hapus
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <ConfirmDeleteDialog
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        title="Hapus Tahun Ajaran"
        description={`Hapus tahun ajaran "${deleteTarget?.nama}"? Tindakan ini tidak dapat dibatalkan.`}
        isLoading={isPending}
      />
    </>
  );
}