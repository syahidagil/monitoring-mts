import { redirect } from "next/navigation";
import { getAnakList } from "@/actions/orangtua/dashboard.action";
import { getNilaiAnak } from "@/actions/orangtua/nilai.action";
import MonitorHeader from "@/components/orangtua/MonitorHeader";
import NilaiChart from "@/components/guru/rekap/NilaiChart";
import type { Semester } from "@prisma/client";

function warnaNilai(n: number) {
  if (n >= 80) return "text-emerald-700";
  if (n >= 70) return "text-amber-600";
  return "text-rose-600";
}

type Props = { searchParams: Promise<{ siswaId?: string; tahunAjar?: string; semester?: string; guruMapelId?: string }> };

export default async function NilaiPage({ searchParams }: Props) {
  const sp = await searchParams;
  const anakList = await getAnakList();
  if (anakList.length === 0) redirect("/login");

  const siswaId = sp.siswaId ? Number(sp.siswaId) : anakList[0].id;
  const data = await getNilaiAnak({
    siswaId,
    tahunAjar: sp.tahunAjar,
    semester: sp.semester as Semester | undefined,
    guruMapelId: sp.guruMapelId ? Number(sp.guruMapelId) : undefined,
  });
  if (!data) redirect("/orangtua/dashboard");

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <MonitorHeader
        judul="Monitoring Nilai Akademik"
        subjudul={`${data.anak.nama} - Kelas ${data.anak.kelas.nama}`}
        anakList={anakList.map((a) => ({ id: a.id, nama: a.nama, kelasNama: a.kelas.nama }))}
        aktifId={siswaId}
      />

      {/* Filter tahun pelajaran + semester */}
      <form method="get" className="flex flex-wrap items-center gap-3 bg-white p-4 rounded-2xl border border-gray-200 shadow-sm mb-5">
        <span className="text-sm text-gray-500 font-medium">Filter:</span>
        <input type="hidden" name="siswaId" value={siswaId} />
        <select name="guruMapelId" defaultValue={data.guruMapelId?.toString() ?? ""}
          className="border border-gray-200 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500">
          <option value="">Semua Guru dan Mata Pelajaran</option>
          {data.guruMapelList.map((item) => (
            <option key={item.id} value={item.id}>{item.guruNama} - {item.namaMapel}</option>
          ))}
        </select>
        <select name="tahunAjar" defaultValue={data.tahunAjar}
          className="border border-gray-200 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500">
          {data.tahunAjarList.map((t) => (
            <option key={t} value={t}>{t}</option>
          ))}
        </select>
        <select name="semester" defaultValue={data.semester}
          className="border border-gray-200 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500">
          {data.semesterOptions.map((s) => (
            <option key={s} value={s}>Semester {s === "GANJIL" ? "Ganjil" : "Genap"}</option>
          ))}
        </select>
        <button className="ml-auto bg-[#1B5E20] text-white text-sm px-5 py-2 rounded-lg hover:bg-[#2E7D32]">Terapkan</button>
      </form>

      {/* Grafik yang sama dengan rekap nilai guru */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5 mb-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-bold text-gray-800">Grafik Nilai</h2>
        </div>
        <NilaiChart nilaiList={data.nilaiList} />
      </div>

      {/* Rincian */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="flex flex-wrap items-center justify-between gap-2 px-5 py-4 border-b border-gray-100">
          <h2 className="text-sm font-bold text-gray-800">Rincian Nilai Siswa</h2>
          <div className="flex items-center gap-3 text-[10px]">
            <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-emerald-500" /> Tinggi (&ge; 80)</span>
            <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-amber-500" /> Cukup (70-79)</span>
            <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-rose-500" /> Rendah (&lt; 70)</span>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50/70 text-[11px] text-gray-500 uppercase tracking-wide">
                <th className="text-left font-semibold px-5 py-3 w-10">No</th>
                <th className="text-left font-semibold px-3 py-3">Mata Pelajaran</th>
                {data.urutanJenis.map((j) => (
                  <th key={j.key} className="text-center font-semibold px-3 py-3">{j.label}</th>
                ))}
                <th className="text-center font-semibold px-5 py-3">Rata-rata</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {data.perMapel.map((m, i) => (
                <tr key={m.kodeMapel} className="hover:bg-gray-50/60">
                  <td className="px-5 py-3 text-gray-400">{i + 1}</td>
                  <td className="px-3 py-3 font-medium text-gray-800">{m.namaMapel}</td>
                  {data.urutanJenis.map((j) => {
                    const v = m.perJenis[j.key];
                    return (
                      <td key={j.key} className={"text-center px-3 py-3 " + (v === null ? "text-gray-300" : "text-gray-700")}>
                        {v ?? "-"}
                      </td>
                    );
                  })}
                  <td className={`text-center px-5 py-3 font-bold ${warnaNilai(m.rataRata)}`}>
                    {m.rataRata.toFixed(1)}
                    {!m.lengkap && (
                      <span className="block text-[9px] font-normal text-amber-500">sementara</span>
                    )}
                  </td>
                </tr>
              ))}
              {data.perMapel.length === 0 && (
                <tr><td colSpan={data.urutanJenis.length + 3} className="text-center py-12 text-gray-400">Belum ada data nilai</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}