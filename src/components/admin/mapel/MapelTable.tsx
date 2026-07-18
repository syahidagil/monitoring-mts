"use client";
import { useState, useTransition } from "react";
import Link from "next/link";
import { Edit, Trash2 } from "lucide-react";
import { deleteMapel } from "@/actions/mapel.action";
import ConfirmDeleteDialog from "@/components/admin/shared/ConfirmDeleteDialog";

export default function MapelTable({ data }: { data: any[] }) {
  const [isPending, startTransition] = useTransition();
  const [deleteTarget, setDeleteTarget] = useState<{ kode: string; nama: string } | null>(null);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  async function handleDelete() {
    if (!deleteTarget) return;
    startTransition(async () => {
      const result = await deleteMapel(deleteTarget.kode);
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
              <th className="text-left px-4 py-3.5 text-xs font-semibold text-gray-500 uppercase">Kode Mapel</th>
              <th className="text-left px-4 py-3.5 text-xs font-semibold text-gray-500 uppercase">Nama Mata Pelajaran</th>
              <th className="text-left px-4 py-3.5 text-xs font-semibold text-gray-500 uppercase">Jumlah Guru</th>
              <th className="text-center px-4 py-3.5 text-xs font-semibold text-gray-500 uppercase">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {data.length === 0 && (
              <tr><td colSpan={5} className="text-center py-16 text-gray-400 text-sm">Belum ada mata pelajaran</td></tr>
            )}
            {data.map((mp, i) => (
              <tr key={mp.kodeMapel} className="hover:bg-gray-50 transition-colors">
                <td className="px-4 py-3.5 text-sm text-gray-400">{i + 1}</td>
                <td className="px-4 py-3.5">
                  <span className="font-mono font-bold text-sm bg-gray-100 text-gray-700 px-3 py-1 rounded-lg">{mp.kodeMapel}</span>
                </td>
                <td className="px-4 py-3.5 text-sm font-medium text-gray-800">{mp.namaMapel}</td>
                <td className="px-4 py-3.5">
                  <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${mp._count.guruMapel > 0 ? "bg-blue-50 text-blue-700" : "bg-gray-100 text-gray-400"}`}>
                    {mp._count.guruMapel} guru
                  </span>
                </td>
                <td className="px-4 py-3.5">
                  <div className="flex items-center justify-center gap-2">
                    <Link href={`/admin/mata-pelajaran/${mp.kodeMapel}/edit`}
                      className="flex items-center gap-1 text-xs text-blue-600 border border-blue-200 px-2.5 py-1.5 rounded-lg hover:bg-blue-50 transition-colors">
                      <Edit className="w-3.5 h-3.5" /> Edit
                    </Link>
                    <button onClick={() => setDeleteTarget({ kode: mp.kodeMapel, nama: mp.namaMapel })}
                      className="flex items-center gap-1 text-xs text-red-500 border border-red-200 px-2.5 py-1.5 rounded-lg hover:bg-red-50 transition-colors">
                      <Trash2 className="w-3.5 h-3.5" /> Hapus
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <div className="px-5 py-3 bg-gray-50 border-t border-gray-100 text-xs text-gray-400">
          Menampilkan {data.length} mata pelajaran
        </div>
      </div>

      <ConfirmDeleteDialog
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        title="Hapus Mata Pelajaran"
        description={`Apakah Anda yakin ingin menghapus mata pelajaran "${deleteTarget?.nama}" (${deleteTarget?.kode})?`}
        isLoading={isPending}
      />
    </>
  );
}