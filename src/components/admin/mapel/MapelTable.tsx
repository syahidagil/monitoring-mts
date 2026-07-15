"use client";
import { useState, useTransition } from "react";
import Link from "next/link";
import { Edit, Trash2 } from "lucide-react";
import { deleteMapel } from "@/actions/mapel.action";

export default function MapelTable({ data }: { data: any[] }) {
  const [isPending, startTransition] = useTransition();
  const [confirmKode, setConfirmKode] = useState<string | null>(null);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  function handleDelete(kode: string) {
    startTransition(async () => {
      const result = await deleteMapel(kode);
      setMessage({ type: result.success ? "success" : "error", text: result.message });
      setConfirmKode(null);
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
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-200">
              <th className="text-left px-5 py-3.5 text-xs font-semibold text-gray-500 uppercase">Kode Mapel</th>
              <th className="text-left px-5 py-3.5 text-xs font-semibold text-gray-500 uppercase">Nama Mata Pelajaran</th>
              <th className="text-left px-5 py-3.5 text-xs font-semibold text-gray-500 uppercase">Jumlah Guru</th>
              <th className="text-center px-5 py-3.5 text-xs font-semibold text-gray-500 uppercase">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {data.length === 0 && (
              <tr><td colSpan={4} className="text-center py-12 text-gray-400 text-sm">Belum ada mata pelajaran</td></tr>
            )}
            {data.map((mp) => (
              <tr key={mp.kodeMapel} className="hover:bg-gray-50 transition-colors">
                <td className="px-5 py-4">
                  <span className="font-mono font-bold text-sm bg-gray-100 text-gray-700 px-2.5 py-1 rounded">{mp.kodeMapel}</span>
                </td>
                <td className="px-5 py-4 text-sm font-medium text-gray-800">{mp.namaMapel}</td>
                <td className="px-5 py-4">
                  <span className="text-xs text-gray-500">{mp._count.guruMapel} guru</span>
                </td>
                <td className="px-5 py-4">
                  <div className="flex items-center justify-center gap-2">
                    <Link href={`/admin/mata-pelajaran/${mp.kodeMapel}/edit`}
                      className="flex items-center gap-1 text-xs text-blue-600 border border-blue-200 px-2.5 py-1.5 rounded-lg hover:bg-blue-50 transition-colors">
                      <Edit className="w-3.5 h-3.5" /> Edit
                    </Link>
                    {confirmKode === mp.kodeMapel ? (
                      <div className="flex gap-1">
                        <button onClick={() => handleDelete(mp.kodeMapel)} disabled={isPending}
                          className="text-xs text-white bg-red-500 hover:bg-red-600 px-2.5 py-1.5 rounded-lg">{isPending ? "..." : "Hapus"}</button>
                        <button onClick={() => setConfirmKode(null)}
                          className="text-xs text-gray-500 border border-gray-200 px-2.5 py-1.5 rounded-lg">Batal</button>
                      </div>
                    ) : (
                      <button onClick={() => setConfirmKode(mp.kodeMapel)}
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