import { redirect } from "next/navigation";
import { getAnakList } from "@/actions/orangtua/dashboard.action";
import { getAbsensiAnak } from "@/actions/orangtua/absensi.action";
import MonitorHeader from "@/components/orangtua/MonitorHeader";

const STATUS_COLOR: Record<string, string> = {
  HADIR: "bg-green-100 text-green-700", SAKIT: "bg-blue-100 text-blue-700",
  IZIN: "bg-yellow-100 text-yellow-700", ALPHA: "bg-red-100 text-red-700",
};
const BULAN = ["Jan","Feb","Mar","Apr","Mei","Jun","Jul","Agu","Sep","Okt","Nov","Des"];

type Props = { searchParams: Promise<{ siswaId?: string; bulan?: string; tahun?: string }> };

export default async function AbsensiPage({ searchParams }: Props) {
  const sp = await searchParams;
  const anakList = await getAnakList();
  if (anakList.length === 0) redirect("/login");

  const siswaId = sp.siswaId ? Number(sp.siswaId) : anakList[0].id;
  const bulan = sp.bulan ? Number(sp.bulan) : new Date().getMonth() + 1;
  const tahun = sp.tahun ? Number(sp.tahun) : new Date().getFullYear();

  const data = await getAbsensiAnak({ siswaId, bulan, tahun });
  if (!data) redirect("/orangtua/dashboard");

  const kartu = [
    { label: "Hadir", value: data.rekap.HADIR, color: "bg-green-50 text-green-700 border-green-100" },
    { label: "Sakit", value: data.rekap.SAKIT, color: "bg-blue-50 text-blue-700 border-blue-100" },
    { label: "Izin", value: data.rekap.IZIN, color: "bg-yellow-50 text-yellow-700 border-yellow-100" },
    { label: "Alpha", value: data.rekap.ALPHA, color: "bg-red-50 text-red-700 border-red-100" },
  ];

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <MonitorHeader
        judul="Monitoring Kehadiran"
        subjudul={`${data.anak.nama} — Kelas ${data.anak.kelas.nama}`}
        anakList={anakList.map((a) => ({ id: a.id, nama: a.nama, kelasNama: a.kelas.nama }))}
        aktifId={siswaId}
      />

      <form method="get" className="flex flex-wrap gap-3 bg-white p-4 rounded-2xl border border-gray-200 shadow-sm mb-5">
        <input type="hidden" name="siswaId" value={siswaId} />
        <select name="bulan" defaultValue={String(bulan)}
          className="border border-gray-200 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500">
          {BULAN.map((b, i) => <option key={i} value={i + 1}>{b}</option>)}
        </select>
        <input type="number" name="tahun" defaultValue={tahun} min={2020} max={2030}
          className="w-24 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500" />
        <button className="bg-[#1B5E20] text-white text-sm px-4 py-2 rounded-lg hover:bg-[#2E7D32]">Tampilkan</button>
        <div className="ml-auto flex items-center gap-2 text-sm text-gray-500">
          Kehadiran: <span className="font-bold text-emerald-700">{data.persentase}%</span>
        </div>
      </form>

      <div className="grid grid-cols-4 gap-3 mb-5">
        {kartu.map((s) => (
          <div key={s.label} className={`rounded-2xl border p-4 text-center ${s.color}`}>
            <p className="text-2xl font-bold">{s.value}</p>
            <p className="text-xs mt-0.5">{s.label}</p>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-50/70 text-[11px] text-gray-500 uppercase tracking-wide">
              <th className="text-left font-semibold px-5 py-3">Tanggal</th>
              <th className="text-left font-semibold px-4 py-3">Mata Pelajaran</th>
              <th className="text-left font-semibold px-4 py-3">Status</th>
              <th className="text-left font-semibold px-4 py-3">Keterangan</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {data.rows.length === 0 && (
              <tr><td colSpan={4} className="text-center py-12 text-gray-400">Tidak ada data absensi bulan ini</td></tr>
            )}
            {data.rows.map((a) => (
              <tr key={a.id} className="hover:bg-gray-50/60">
                <td className="px-5 py-3 text-gray-600">
                  {new Date(a.tanggal).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" })}
                </td>
                <td className="px-4 py-3 text-gray-700">{a.mapel}</td>
                <td className="px-4 py-3">
                  <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${STATUS_COLOR[a.status]}`}>{a.status}</span>
                </td>
                <td className="px-4 py-3 text-gray-500">{a.keterangan || "–"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}