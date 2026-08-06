import { redirect } from "next/navigation";
import { getAnakList } from "@/actions/orangtua/dashboard.action";
import { getHafalanAnak } from "@/actions/orangtua/hafalan.action";
import MonitorHeader from "@/components/orangtua/MonitorHeader";
import LineChartMini from "@/components/orangtua/LineChartMini";
import { TrendingUp, PlusCircle } from "lucide-react";

const NILAI: Record<string, { teks: string; kelas: string }> = {
  L: { teks: "L", kelas: "bg-green-100 text-green-700" },
  L_MIN: { teks: "L-", kelas: "bg-amber-100 text-amber-700" },
};

type Props = { searchParams: Promise<{ siswaId?: string; tahunAjar?: string }> };

export default async function HafalanPage({ searchParams }: Props) {
  const sp = await searchParams;
  const anakList = await getAnakList();
  if (anakList.length === 0) redirect("/login");

  const siswaId = sp.siswaId ? Number(sp.siswaId) : anakList[0].id;
  const data = await getHafalanAnak({
    siswaId,
    tahunAjar: sp.tahunAjar,
  });
  if (!data) redirect("/orangtua/dashboard");

  if (!data.anak.statusTahfidz) {
    return (
      <div className="p-6 max-w-5xl mx-auto">
        <MonitorHeader judul="Monitoring Hafalan Al-Qur'an" subjudul={`${data.anak.nama} — Kelas ${data.anak.kelas.nama}`}
          anakList={anakList.map((a) => ({ id: a.id, nama: a.nama, kelasNama: a.kelas.nama }))} aktifId={siswaId} />
        <div className="bg-white rounded-2xl border border-gray-200 p-12 text-center text-gray-500">
          {data.anak.nama} tidak terdaftar dalam program tahfidz.
        </div>
      </div>
    );
  }

  const r = data.ringkasan;

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <MonitorHeader
        judul="Monitoring Hafalan Al-Qur'an"
        subjudul={`${data.anak.nama} — Kelas ${data.anak.kelas.nama}`}
        anakList={anakList.map((a) => ({ id: a.id, nama: a.nama, kelasNama: a.kelas.nama }))}
        aktifId={siswaId}
      />

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
        <button className="ml-auto bg-[#1B5E20] text-white text-sm px-5 py-2.5 rounded-lg hover:bg-[#2E7D32]">
          Terapkan Filter
        </button>
      </form>

      {/* 3 kartu */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-5">
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5">
          <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wide">Total Juz Terhafal</p>
          <p className="text-3xl font-bold text-gray-900 mt-1">Juz {r.juzTertinggi}</p>
          <p className="flex items-center gap-1 text-xs text-emerald-600 mt-2">
            <TrendingUp size={13} /> {r.jumlahJuz} juz tersentuh
          </p>
        </div>
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5">
          <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wide">Total Halaman</p>
          <p className="text-3xl font-bold text-gray-900 mt-1">{r.totalHalaman} <span className="text-base font-medium text-gray-400">Halaman</span></p>
          <p className="flex items-center gap-1 text-xs text-emerald-600 mt-2">
            <PlusCircle size={13} /> {r.totalSetoran} total setoran
          </p>
        </div>
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5">
          <div className="flex items-baseline justify-between">
            <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wide">Persentase Progres</p>
            <p className="text-2xl font-bold text-emerald-700">{r.persentaseProgres}%</p>
          </div>
          <div className="h-2.5 w-full bg-gray-100 rounded-full overflow-hidden mt-3">
            <div className="h-full bg-[#1B5E20] rounded-full" style={{ width: `${r.persentaseProgres}%` }} />
          </div>
          <p className="text-xs text-gray-400 mt-2">Kelancaran dari {r.totalSetoran} setoran</p>
        </div>
      </div>

      {/* Chart per minggu */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5 mb-5">
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-sm font-bold text-gray-800">Hafalan Per Minggu</h2>
          <span className="text-xs text-gray-500 bg-gray-50 border border-gray-200 rounded-lg px-3 py-1">4 Minggu Terakhir</span>
        </div>
        <LineChartMini data={data.perMinggu} />
      </div>

      {/* Riwayat */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-100">
          <h2 className="text-sm font-bold text-gray-800">Riwayat Setoran Hafalan</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50/70 text-[11px] text-gray-500 uppercase tracking-wide">
                <th className="text-left font-semibold px-5 py-3 w-10">No</th>
                <th className="text-left font-semibold px-3 py-3">Hari/Tanggal</th>
                <th className="text-center font-semibold px-3 py-3">Juz</th>
                <th className="text-left font-semibold px-3 py-3">Halaman</th>
                <th className="text-center font-semibold px-3 py-3">Nilai</th>
                <th className="text-left font-semibold px-3 py-3">Keterangan</th>
                <th className="text-left font-semibold px-5 py-3">Guru Penguji</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {data.rows.map((h, i) => {
                const n = NILAI[h.nilai] ?? NILAI.L;
                return (
                  <tr key={h.id} className="hover:bg-gray-50/60">
                    <td className="px-5 py-3 text-gray-400">{i + 1}</td>
                    <td className="px-3 py-3">
                      <p className="font-semibold text-gray-800">{h.hari}</p>
                      <p className="text-xs text-gray-400">
                        {new Date(h.tanggal).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" })}
                      </p>
                    </td>
                    <td className="px-3 py-3 text-center text-gray-600">{h.juz}</td>
                    <td className="px-3 py-3 text-gray-700">{h.surat} (hal. {h.halaman})</td>
                    <td className="px-3 py-3 text-center">
                      <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${n.kelas}`}>{n.teks}</span>
                    </td>
                    <td className="px-3 py-3 text-gray-500">{h.keterangan || "–"}</td>
                    <td className="px-5 py-3 text-gray-600 whitespace-nowrap">{h.guruNama}</td>
                  </tr>
                );
              })}
              {data.rows.length === 0 && (
                <tr><td colSpan={7} className="text-center py-12 text-gray-400">Belum ada riwayat setoran</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}