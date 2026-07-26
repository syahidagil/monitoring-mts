"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Filter, Pencil, Trash2 } from "lucide-react";
import { deleteSikap, type SikapRow } from "@/actions/guru/sikap.action";

type Kelas = { id: number; nama: string };

export default function SikapRiwayat({
  rows,
  kelasList,
}: {
  rows: SikapRow[];
  kelasList: Kelas[];
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [pesan, setPesan] = useState("");

  const [kelasId, setKelasId] = useState<number | "semua">("semua");
  const [jenis, setJenis] = useState<"SEMUA" | "POSITIF" | "PELANGGARAN">("SEMUA");
  const [dari, setDari] = useState("");
  const [sampai, setSampai] = useState("");

  const terfilter = useMemo(() => {
    return rows.filter((r) => {
      if (kelasId !== "semua" && r.kelasId !== kelasId) return false;
      if (jenis !== "SEMUA" && r.jenisSikap !== jenis) return false;
      const t = new Date(r.tanggal).getTime();
      if (dari && t < new Date(dari).getTime()) return false;
      if (sampai && t > new Date(sampai).getTime()) return false;
      return true;
    });
  }, [rows, kelasId, jenis, dari, sampai]);

  function hapus(id: number) {
    if (!confirm("Hapus catatan sikap ini?")) return;
    startTransition(async () => {
      const res = await deleteSikap(id);
      setPesan(res.message);
      if (res.success) router.refresh();
      setTimeout(() => setPesan(""), 3000);
    });
  }

  const inputCls =
    "w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500";

  return (
    <div className="space-y-5">
      {/* Filter */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
          <div>
            <label className="block text-[11px] font-semibold text-gray-500 uppercase tracking-wide mb-1.5">
              Pilih Kelas
            </label>
            <select
              value={kelasId}
              onChange={(e) => setKelasId(e.target.value === "semua" ? "semua" : Number(e.target.value))}
              className={inputCls}
            >
              <option value="semua">Semua Kelas</option>
              {kelasList.map((k) => (
                <option key={k.id} value={k.id}>{k.nama}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-[11px] font-semibold text-gray-500 uppercase tracking-wide mb-1.5">
              Dari Tanggal
            </label>
            <input type="date" value={dari} onChange={(e) => setDari(e.target.value)} className={inputCls} />
          </div>
          <div>
            <label className="block text-[11px] font-semibold text-gray-500 uppercase tracking-wide mb-1.5">
              Sampai Tanggal
            </label>
            <input type="date" value={sampai} onChange={(e) => setSampai(e.target.value)} className={inputCls} />
          </div>
          <div>
            <label className="block text-[11px] font-semibold text-gray-500 uppercase tracking-wide mb-1.5">
              Jenis Sikap
            </label>
            <select value={jenis} onChange={(e) => setJenis(e.target.value as any)} className={inputCls}>
              <option value="SEMUA">Semua Jenis</option>
              <option value="POSITIF">Positif</option>
              <option value="PELANGGARAN">Pelanggaran</option>
            </select>
          </div>
        </div>
      </div>

      {/* Riwayat */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <div>
            <h3 className="text-sm font-bold text-gray-800">Riwayat Catatan Sikap</h3>
            {pesan && <p className="text-xs text-emerald-600 mt-0.5">{pesan}</p>}
          </div>
          <span className="text-xs text-gray-400">
            Menampilkan {terfilter.length} dari {rows.length} data
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50/70 text-[11px] text-gray-500 uppercase tracking-wide">
                <th className="text-left font-semibold px-6 py-3 w-12">No</th>
                <th className="text-left font-semibold px-3 py-3">Tanggal</th>
                <th className="text-left font-semibold px-3 py-3">Siswa</th>
                <th className="text-left font-semibold px-3 py-3">Kelas</th>
                <th className="text-left font-semibold px-3 py-3">Jenis</th>
                <th className="text-left font-semibold px-3 py-3">Keterangan</th>
                <th className="text-right font-semibold px-6 py-3 w-20">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {terfilter.map((r, i) => (
                <tr key={r.id} className="hover:bg-gray-50/60 align-top">
                  <td className="px-6 py-4 text-gray-400 tabular-nums">
                    {String(i + 1).padStart(2, "0")}
                  </td>
                  <td className="px-3 py-4 text-gray-600 whitespace-nowrap">
                    {new Date(r.tanggal).toLocaleDateString("id-ID", {
                      day: "numeric", month: "short", year: "numeric",
                    })}
                  </td>
                  <td className="px-3 py-4">
                    <div className="flex items-center gap-2.5">
                      <span className="w-7 h-7 rounded-full bg-emerald-100 text-emerald-700 text-[10px] font-bold flex items-center justify-center flex-shrink-0">
                        {r.siswaNama.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase()}
                      </span>
                      <div className="min-w-0">
                        <p className="font-medium text-gray-800 truncate">{r.siswaNama}</p>
                        <p className="text-xs text-gray-400">{r.siswaNis}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-3 py-4 text-gray-600">{r.kelasNama}</td>
                  <td className="px-3 py-4">
                    <span
                      className={
                        "inline-flex items-center gap-1.5 text-[10px] font-semibold px-2.5 py-1 rounded-full " +
                        (r.jenisSikap === "POSITIF"
                          ? "bg-emerald-50 text-emerald-700"
                          : "bg-rose-50 text-rose-700")
                      }
                    >
                      <span className={"w-1.5 h-1.5 rounded-full " + (r.jenisSikap === "POSITIF" ? "bg-emerald-500" : "bg-rose-500")} />
                      {r.jenisSikap}
                    </span>
                    <p className="text-[11px] text-gray-400 mt-1">{r.kategori}</p>
                  </td>
                  <td className="px-3 py-4 text-gray-600 max-w-[220px]">
                    <p className="line-clamp-2">{r.keterangan}</p>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-end gap-1">
                      <Link
                        href={`/guru/sikap/tambah?id=${r.id}`}
                        className="p-1.5 rounded-md text-gray-400 hover:bg-gray-100 hover:text-emerald-600"
                        title="Edit"
                      >
                        <Pencil size={15} />
                      </Link>
                      <button
                        onClick={() => hapus(r.id)}
                        disabled={isPending}
                        className="p-1.5 rounded-md text-gray-400 hover:bg-rose-50 hover:text-rose-600"
                        title="Hapus"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {terfilter.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-6 py-14 text-center text-sm text-gray-400">
                    {rows.length === 0
                      ? "Belum ada catatan sikap."
                      : "Tidak ada data yang cocok dengan filter."}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}