import { redirect } from "next/navigation";
import { getAnakList } from "@/actions/orangtua/dashboard.action";
import { getSikapAnak } from "@/actions/orangtua/sikap.action";
import MonitorHeader from "@/components/orangtua/MonitorHeader";
import { ClipboardList, Smile, Frown } from "lucide-react";
import type { Semester } from "@prisma/client";

const BULAN = ["Januari","Februari","Maret","April","Mei","Juni","Juli","Agustus","September","Oktober","November","Desember"];

type Props = { searchParams: Promise<{ siswaId?: string; tahunAjar?: string; semester?: string; bulan?: string }> };

export default async function SikapPage({ searchParams }: Props) {
  const sp = await searchParams;
  const anakList = await getAnakList();
  if (anakList.length === 0) redirect("/login");

  const siswaId = sp.siswaId ? Number(sp.siswaId) : anakList[0].id;
  const bulan = sp.bulan ? Number(sp.bulan) : new Date().getMonth() + 1;

  const data = await getSikapAnak({
    siswaId,
    tahunAjar: sp.tahunAjar,
    semester: sp.semester as Semester | undefined,
    bulan,
  });
  if (!data) redirect("/orangtua/dashboard");

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <MonitorHeader
        judul="Monitoring Sikap Siswa"
        subjudul="Pantau perkembangan karakter dan perilaku harian putra-putri Anda."
        anakList={anakList.map((a) => ({ id: a.id, nama: a.nama, kelasNama: a.kelas.nama }))}
        aktifId={siswaId}
      />

      {/* Filter */}
      <form method="get" className="flex flex-wrap items-end gap-4 bg-white p-5 rounded-2xl border border-gray-200 shadow-sm mb-5">
        <input type="hidden" name="siswaId" value={siswaId} />
        <div>
          <label className="block text-[11px] font-semibold text-gray-500 uppercase tracking-wide mb-1.5">Tahun Pelajaran</label>
          <select name="tahunAjar" defaultValue={data.tahunAjar}
            className="border border-gray-200 rounded-lg px-3 py-2.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500">
            {data.tahunAjarList.map((t) => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-[11px] font-semibold text-gray-500 uppercase tracking-wide mb-1.5">Pilih Semester</label>
          <select name="semester" defaultValue={data.semester}
            className="border border-gray-200 rounded-lg px-3 py-2.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500">
            {data.semesterOptions.map((s) => (
              <option key={s} value={s}>Semester {s === "GANJIL" ? "Ganjil" : "Genap"}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-[11px] font-semibold text-gray-500 uppercase tracking-wide mb-1.5">Pilih Bulan</label>
          <select name="bulan" defaultValue={String(bulan)}
            className="border border-gray-200 rounded-lg px-3 py-2.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500">
            {BULAN.map((b, i) => <option key={i} value={i + 1}>{b}</option>)}
          </select>
        </div>
        <button className="ml-auto bg-[#1B5E20] text-white text-sm px-5 py-2.5 rounded-lg hover:bg-[#2E7D32]">
          Terapkan Filter
        </button>
      </form>

      {/* 3 kartu statistik */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-5">
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5 flex items-center gap-4">
          <div className="w-11 h-11 rounded-full bg-gray-100 flex items-center justify-center">
            <ClipboardList size={20} className="text-gray-500" />
          </div>
          <div>
            <p className="text-xs text-gray-500">Total Laporan Bulan Ini</p>
            <p className="text-2xl font-bold text-gray-900">{data.statistik.total}</p>
          </div>
        </div>
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5 flex items-center gap-4">
          <div className="w-11 h-11 rounded-full bg-emerald-100 flex items-center justify-center">
            <Smile size={20} className="text-emerald-600" />
          </div>
          <div>
            <p className="text-xs text-gray-500">Sikap Positif</p>
            <p className="text-2xl font-bold text-emerald-700">{data.statistik.positif}</p>
          </div>
        </div>
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5 flex items-center gap-4">
          <div className="w-11 h-11 rounded-full bg-rose-100 flex items-center justify-center">
            <Frown size={20} className="text-rose-600" />
          </div>
          <div>
            <p className="text-xs text-gray-500">Sikap Negatif</p>
            <p className="text-2xl font-bold text-rose-700">{data.statistik.pelanggaran}</p>
          </div>
        </div>
      </div>

      {/* Riwayat */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-100">
          <h2 className="text-sm font-bold text-gray-800">Riwayat Perilaku Siswa</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50/70 text-[11px] text-gray-500 uppercase tracking-wide">
                <th className="text-left font-semibold px-5 py-3 w-10">No</th>
                <th className="text-left font-semibold px-3 py-3">Tanggal</th>
                <th className="text-left font-semibold px-3 py-3">Jenis Sikap</th>
                <th className="text-left font-semibold px-3 py-3">Keterangan</th>
                <th className="text-left font-semibold px-5 py-3">Guru Pelapor</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {data.rows.map((r, i) => (
                <tr key={r.id} className="hover:bg-gray-50/60 align-top">
                  <td className="px-5 py-4 text-gray-400">{i + 1}</td>
                  <td className="px-3 py-4 text-gray-600 whitespace-nowrap">
                    {new Date(r.tanggal).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" })}
                  </td>
                  <td className="px-3 py-4">
                    <span className={
                      "text-[10px] font-bold px-2.5 py-1 rounded-full " +
                      (r.jenisSikap === "POSITIF" ? "bg-emerald-100 text-emerald-700" : "bg-rose-100 text-rose-700")
                    }>
                      {r.jenisSikap === "POSITIF" ? "POSITIF" : "NEGATIF"}
                    </span>
                    <p className="text-[11px] text-gray-400 mt-1">{r.kategori}</p>
                  </td>
                  <td className="px-3 py-4 text-gray-600 max-w-xs">{r.keterangan}</td>
                  <td className="px-5 py-4 font-medium text-gray-700 whitespace-nowrap">{r.guruNama}</td>
                </tr>
              ))}
              {data.rows.length === 0 && (
                <tr><td colSpan={5} className="text-center py-12 text-gray-400">Belum ada catatan sikap pada bulan ini</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}