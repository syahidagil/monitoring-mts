"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { updateNilai, deleteNilai } from "@/actions/guru/nilai.action";
import { JENIS_LABEL } from "@/lib/validations/guru/nilai.validation";
import { Pencil, Trash2, Check, X } from "lucide-react";

type Row = {
  id: number;
  nis: string;
  nama: string;
  jenis: string;
  nilai: number;
  tanggal: Date;
  keterangan: string;
};

const JENIS_WARNA: Record<string, string> = {
  TUGAS: "bg-blue-50 text-blue-700",
  HARIAN: "bg-violet-50 text-violet-700",
  PR: "bg-amber-50 text-amber-700",
  UTS: "bg-emerald-50 text-emerald-700",
  UAS: "bg-rose-50 text-rose-700",
};

export default function RiwayatNilai({ rows }: { rows: Row[] }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [editId, setEditId] = useState<number | null>(null);
  const [editNilai, setEditNilai] = useState("");
  const [editKet, setEditKet] = useState("");
  const [filter, setFilter] = useState<string>("SEMUA");
  const [pesan, setPesan] = useState("");

  const jenisAda = Array.from(new Set(rows.map((r) => r.jenis)));
  const tampil = filter === "SEMUA" ? rows : rows.filter((r) => r.jenis === filter);

  function mulaiEdit(r: Row) {
    setEditId(r.id);
    setEditNilai(String(r.nilai));
    setEditKet(r.keterangan);
    setPesan("");
  }

  function simpanEdit(id: number) {
    const fd = new FormData();
    fd.set("nilai", editNilai);
    fd.set("keterangan", editKet);
    startTransition(async () => {
      const res = await updateNilai(id, fd);
      setPesan(res.message);
      if (res.success) {
        setEditId(null);
        router.refresh();
      }
    });
  }

  function hapus(id: number) {
    if (!confirm("Hapus nilai ini? Tindakan tidak dapat dibatalkan.")) return;
    startTransition(async () => {
      const res = await deleteNilai(id);
      setPesan(res.message);
      if (res.success) router.refresh();
    });
  }

  return (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
      <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
        <div>
          <h3 className="text-sm font-bold text-gray-800">Riwayat Nilai</h3>
          {pesan && <p className="text-xs text-emerald-600 mt-0.5">{pesan}</p>}
        </div>
        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="border border-gray-200 rounded-lg px-3 py-2 text-xs bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
        >
          <option value="SEMUA">Semua Jenis</option>
          {jenisAda.map((j) => (
            <option key={j} value={j}>
              {JENIS_LABEL[j as keyof typeof JENIS_LABEL] ?? j}
            </option>
          ))}
        </select>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-50/70 text-[11px] text-gray-500 uppercase tracking-wide">
              <th className="text-left font-semibold px-6 py-3">Siswa</th>
              <th className="text-left font-semibold px-3 py-3">Jenis</th>
              <th className="text-center font-semibold px-3 py-3">Nilai</th>
              <th className="text-left font-semibold px-3 py-3">Tanggal</th>
              <th className="text-left font-semibold px-3 py-3">Keterangan</th>
              <th className="text-right font-semibold px-6 py-3 w-24">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {tampil.map((r) => {
              const sedangEdit = editId === r.id;
              return (
                <tr key={r.id} className="hover:bg-gray-50/60 align-middle">
                  <td className="px-6 py-3">
                    <p className="font-medium text-gray-800">{r.nama}</p>
                    <p className="text-xs text-gray-400">{r.nis}</p>
                  </td>
                  <td className="px-3 py-3">
                    <span className={`text-[10px] font-semibold px-2 py-1 rounded ${JENIS_WARNA[r.jenis] ?? "bg-gray-100 text-gray-600"}`}>
                      {JENIS_LABEL[r.jenis as keyof typeof JENIS_LABEL] ?? r.jenis}
                    </span>
                  </td>
                  <td className="px-3 py-3 text-center">
                    {sedangEdit ? (
                      <input
                        type="number"
                        min={0}
                        max={100}
                        step="0.01"
                        value={editNilai}
                        onChange={(e) => setEditNilai(e.target.value)}
                        className="w-20 text-center border border-emerald-300 rounded px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      />
                    ) : (
                      <span
                        className={
                          "font-semibold " +
                          (r.nilai < 75 ? "text-rose-600" : "text-gray-800")
                        }
                      >
                        {r.nilai}
                      </span>
                    )}
                  </td>
                  <td className="px-3 py-3 text-gray-500 whitespace-nowrap">
                    {new Date(r.tanggal).toLocaleDateString("id-ID", {
                      day: "2-digit",
                      month: "short",
                      year: "numeric",
                    })}
                  </td>
                  <td className="px-3 py-3 text-gray-500 max-w-[180px]">
                    {sedangEdit ? (
                      <input
                        type="text"
                        value={editKet}
                        onChange={(e) => setEditKet(e.target.value)}
                        className="w-full border border-emerald-300 rounded px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      />
                    ) : (
                      r.keterangan || "–"
                    )}
                  </td>
                  <td className="px-6 py-3">
                    <div className="flex items-center justify-end gap-1.5">
                      {sedangEdit ? (
                        <>
                          <button
                            onClick={() => simpanEdit(r.id)}
                            disabled={isPending}
                            className="p-1.5 rounded-md bg-emerald-50 text-emerald-600 hover:bg-emerald-100"
                            title="Simpan"
                          >
                            <Check size={15} />
                          </button>
                          <button
                            onClick={() => setEditId(null)}
                            className="p-1.5 rounded-md bg-gray-50 text-gray-500 hover:bg-gray-100"
                            title="Batal"
                          >
                            <X size={15} />
                          </button>
                        </>
                      ) : (
                        <>
                          <button
                            onClick={() => mulaiEdit(r)}
                            className="p-1.5 rounded-md text-gray-400 hover:bg-gray-100 hover:text-emerald-600"
                            title="Edit"
                          >
                            <Pencil size={15} />
                          </button>
                          <button
                            onClick={() => hapus(r.id)}
                            disabled={isPending}
                            className="p-1.5 rounded-md text-gray-400 hover:bg-rose-50 hover:text-rose-600"
                            title="Hapus"
                          >
                            <Trash2 size={15} />
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
            {tampil.length === 0 && (
              <tr>
                <td colSpan={6} className="px-6 py-12 text-center text-sm text-gray-400">
                  Belum ada nilai yang tersimpan.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}