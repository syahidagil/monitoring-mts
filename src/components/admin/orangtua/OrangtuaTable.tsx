"use client";
import { useState, useTransition } from "react";
import Link from "next/link";
import { Edit, Trash2 } from "lucide-react";
import { deleteOrangTua } from "@/actions/orangtua.action";
import ConfirmDeleteDialog from "@/components/admin/shared/ConfirmDeleteDialog";

export default function OrangtuaTable({ data }: { data: any[] }) {
  const [isPending, startTransition] = useTransition();
  const [deleteTarget, setDeleteTarget] = useState<{ id: string; nama: string } | null>(null);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  async function handleDelete() {
    if (!deleteTarget) return;
    startTransition(async () => {
      const result = await deleteOrangTua(deleteTarget.id);
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
              <th className="text-left px-4 py-3.5 text-xs font-semibold text-gray-500 uppercase">No. HP</th>
              <th className="text-left px-4 py-3.5 text-xs font-semibold text-gray-500 uppercase">Username</th>
              <th className="text-left px-4 py-3.5 text-xs font-semibold text-gray-500 uppercase">Siswa Diasuh</th>
              <th className="text-left px-4 py-3.5 text-xs font-semibold text-gray-500 uppercase">Status</th>
              <th className="text-center px-4 py-3.5 text-xs font-semibold text-gray-500 uppercase">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {data.length === 0 && (
              <tr><td colSpan={7} className="text-center py-16 text-gray-400 text-sm">Belum ada data orang tua</td></tr>
            )}
            {data.map((ortu, i) => {
              const anak = ortu.anak ?? [];
              const shown = anak.slice(0, 2);
              const more = anak.length - 2;
              return (
                <tr key={ortu.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3.5 text-sm text-gray-400">{i + 1}</td>
                  <td className="px-4 py-3.5">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center flex-shrink-0">
                        <span className="text-xs font-bold text-orange-700">{ortu.user.name.charAt(0)}</span>
                      </div>
                      <p className="text-sm font-medium text-gray-800">{ortu.user.name}</p>
                    </div>
                  </td>
                  <td className="px-4 py-3.5 text-sm text-gray-500">{ortu.noHp ?? "-"}</td>
                  <td className="px-4 py-3.5 text-sm text-gray-500">{ortu.user.username}</td>
                  <td className="px-4 py-3.5">
                    <div className="flex flex-wrap gap-1.5">
                      {shown.map((a: any) => (
                        <span key={a.id} className="text-xs bg-blue-50 text-blue-700 border border-blue-100 px-2 py-0.5 rounded-full">
                          {a.nama} <span className="text-blue-400">({a.kelas?.nama})</span>
                        </span>
                      ))}
                      {more > 0 && (
                        <span className="text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full">+{more} lainnya</span>
                      )}
                      {anak.length === 0 && <span className="text-xs text-gray-300 italic">Belum ada</span>}
                    </div>
                  </td>
                  <td className="px-4 py-3.5">
                    <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${ortu.user.status ? "bg-green-100 text-green-700" : "bg-red-100 text-red-600"}`}>
                      {ortu.user.status ? "Aktif" : "Nonaktif"}
                    </span>
                  </td>
                  <td className="px-4 py-3.5">
                    <div className="flex items-center justify-center gap-2">
                      <Link href={`/admin/data-orangtua/${ortu.id}/edit`}
                        className="flex items-center gap-1 text-xs text-blue-600 border border-blue-200 px-2.5 py-1.5 rounded-lg hover:bg-blue-50 transition-colors">
                        <Edit className="w-3.5 h-3.5" /> Edit
                      </Link>
                      <button onClick={() => setDeleteTarget({ id: ortu.id, nama: ortu.user.name })}
                        className="flex items-center gap-1 text-xs text-red-500 border border-red-200 px-2.5 py-1.5 rounded-lg hover:bg-red-50 transition-colors">
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
        title="Hapus Data Orang Tua"
        description={`Apakah Anda yakin ingin menghapus data orang tua "${deleteTarget?.nama}"? Relasi dengan siswa akan dilepas otomatis.`}
        isLoading={isPending}
      />
    </>
  );
}