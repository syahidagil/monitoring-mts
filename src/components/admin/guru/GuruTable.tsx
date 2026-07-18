"use client";
import { useState, useTransition } from "react";
import Link from "next/link";
import { Edit, Trash2, KeyRound } from "lucide-react";
import { deleteGuru, resetPasswordGuru } from "@/actions/guru.action";
import ConfirmDeleteDialog from "@/components/admin/shared/ConfirmDeleteDialog";

export default function GuruTable({ data }: { data: any[] }) {
  const [isPending, startTransition] = useTransition();
  const [deleteTarget, setDeleteTarget] = useState<{ id: string; nama: string } | null>(null);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  function handleReset(id: string, nama: string) {
    if (!confirm(`Reset password ${nama} ke "password123"?`)) return;
    startTransition(async () => {
      const result = await resetPasswordGuru(id);
      setMessage({ type: result.success ? "success" : "error", text: result.message });
      setTimeout(() => setMessage(null), 4000);
    });
  }

  async function handleDelete() {
    if (!deleteTarget) return;
    startTransition(async () => {
      const result = await deleteGuru(deleteTarget.id);
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
              <th className="text-left px-4 py-3.5 text-xs font-semibold text-gray-500 uppercase">Nama</th>
              <th className="text-left px-4 py-3.5 text-xs font-semibold text-gray-500 uppercase">NIP</th>
              <th className="text-left px-4 py-3.5 text-xs font-semibold text-gray-500 uppercase">No. HP</th>
              <th className="text-left px-4 py-3.5 text-xs font-semibold text-gray-500 uppercase">Username</th>
              <th className="text-left px-4 py-3.5 text-xs font-semibold text-gray-500 uppercase">Status</th>
              <th className="text-center px-4 py-3.5 text-xs font-semibold text-gray-500 uppercase">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {data.length === 0 && (
              <tr><td colSpan={7} className="text-center py-16 text-gray-400 text-sm">Belum ada data guru</td></tr>
            )}
            {data.map((guru, i) => (
              <tr key={guru.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-4 py-3.5 text-sm text-gray-400">{i + 1}</td>
                <td className="px-4 py-3.5">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <span className="text-xs font-bold text-blue-700">{guru.user.name.charAt(0)}</span>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-800">{guru.user.name}</p>
                      <p className="text-xs text-gray-400">{guru.mapel}</p>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3.5 text-sm font-mono text-gray-600">{guru.nip ?? "-"}</td>
                <td className="px-4 py-3.5 text-sm text-gray-600">{guru.noHp ?? "-"}</td>
                <td className="px-4 py-3.5 text-sm text-gray-500">{guru.user.username}</td>
                <td className="px-4 py-3.5">
                  <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${guru.user.status ? "bg-green-100 text-green-700" : "bg-red-100 text-red-600"}`}>
                    {guru.user.status ? "Aktif" : "Nonaktif"}
                  </span>
                </td>
                <td className="px-4 py-3.5">
                  <div className="flex items-center justify-center gap-1.5">
                    <Link href={`/admin/data-guru/${guru.id}/edit`}
                      className="flex items-center gap-1 text-xs text-blue-600 border border-blue-200 px-2 py-1.5 rounded-lg hover:bg-blue-50 transition-colors">
                      <Edit className="w-3.5 h-3.5" /> Edit
                    </Link>
                    <button onClick={() => handleReset(guru.id, guru.user.name)}
                      className="flex items-center gap-1 text-xs text-yellow-600 border border-yellow-200 px-2 py-1.5 rounded-lg hover:bg-yellow-50 transition-colors">
                      <KeyRound className="w-3.5 h-3.5" /> Reset PW
                    </button>
                    <button onClick={() => setDeleteTarget({ id: guru.id, nama: guru.user.name })}
                      className="flex items-center gap-1 text-xs text-red-500 border border-red-200 px-2 py-1.5 rounded-lg hover:bg-red-50 transition-colors">
                      <Trash2 className="w-3.5 h-3.5" /> Hapus
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <div className="px-5 py-3 bg-gray-50 border-t border-gray-100 text-xs text-gray-400">
          Menampilkan {data.length} guru
        </div>
      </div>

      <ConfirmDeleteDialog
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        title="Hapus Data Guru"
        description={`Apakah Anda yakin ingin menghapus data guru "${deleteTarget?.nama}"? Semua data terkait akan ikut terhapus.`}
        isLoading={isPending}
      />
    </>
  );
}