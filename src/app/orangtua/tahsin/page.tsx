import { redirect } from "next/navigation";
import { getAnakList } from "@/actions/orangtua/dashboard.action";
import { getTahsinAnak } from "@/actions/orangtua/tahsin.action";
import MonitorHeader from "@/components/orangtua/MonitorHeader";
import type { Semester } from "@prisma/client";

const NILAI: Record<string, { teks: string; kelas: string }> = {
  L: { teks: "L", kelas: "bg-green-100 text-green-700" },
  L_MIN: { teks: "L-", kelas: "bg-amber-100 text-amber-700" },
};

type Props = { searchParams: Promise<{ siswaId?: string; tahunAjar?: string; semester?: string }> };

export default async function TahsinPage({ searchParams }: Props) {
  const sp = await searchParams;
  const anakList = await getAnakList();
  if (anakList.length === 0) redirect("/login");

  const siswaId = sp.siswaId ? Number(sp.siswaId) : anakList[0].id;
  const data = await getTahsinAnak({
    siswaId,
    tahunAjar: sp.tahunAjar,
    semester: sp.semester as Semester | undefined,
  });
  if (!data) redirect("/orangtua/dashboard");

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <MonitorHeader
        judul="Monitoring Tahsin Al-Qur'an"
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
        <div>
          <label className="block text-[11px] font-semibold text-gray-500 uppercase tracking-wide mb-1.5">Semester</label>
          <select name="semester" defaultValue={data.semester}
            className="border border-gray-200 rounded-lg px-3 py-2.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500">
            {data.semesterOptions.map((s) => (
              <option key={s} value={s}>Semester {s === "GANJIL" ? "Ganjil" : "Genap"}</option>
            ))}
          </select>
        </div>
        <button className="ml-auto bg-[#1B5E20] text-white text-sm px-5 py-2.5 rounded-lg hover:bg-[#2E7D32]">
          Terapkan Filter
        </button>
      </form>

      {/* Kartu ringkas + persentase per aspek */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 mb-5">
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5">
          <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wide">Total Setoran</p>
          <p className="text-3xl font-bold text-gray-900 mt-1">{data.ringkasan.totalSetoran}</p>
          <p className="text-xs text-gray-400 mt-2">{data.ringkasan.juzTersentuh} juz tersentuh</p>
        </div>
        {data.aspek.map((a) => (
          <div key={a.nama} className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5">
            <div className="flex items-baseline justify-between">
              <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wide">{a.nama}</p>
              <p className={"text-xl font-bold " + (a.persen >= 70 ? "text-emerald-700" : "text-amber-600")}>{a.persen}%</p>
            </div>
            <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden mt-3">
              <div className={"h-full rounded-full " + (a.persen >= 70 ? "bg-emerald-500" : "bg-amber-400")}
                style={{ width: `${a.persen}%` }} />
            </div>
            <p className="text-[11px] text-gray-400 mt-1.5">Kelancaran aspek ini</p>
          </div>
        ))}
      </div>

      {/* Riwayat */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-100">
          <h2 className="text-sm font-bold text-gray-800">Riwayat Setoran Tahsin</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50/70 text-[11px] text-gray-500 uppercase tracking-wide">
                <th className="text-left font-semibold px-5 py-3 w-10">No</th>
                <th className="text-left font-semibold px-3 py-3">Hari/Tanggal</th>
                <th className="text-center font-semibold px-3 py-3">Juz</th>
                <th className="text-left font-semibold px-3 py-3">Surat</th>
                <th className="text-center font-semibold px-3 py-3">Tajwid</th>
                <th className="text-center font-semibold px-3 py-3">Makhraj</th>
                <th className="text-center font-semibold px-3 py-3">Sifatul</th>
                <th className="text-left font-semibold px-5 py-3">Guru</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {data.rows.map((t, i) => {
                const badge = (v: string) => {
                  const n = NILAI[v] ?? NILAI.L;
                  return <span className={`text-[10px] font-semibold px-2 py-0.5 rounded ${n.kelas}`}>{n.teks}</span>;
                };
                return (
                  <tr key={t.id} className="hover:bg-gray-50/60">
                    <td className="px-5 py-3 text-gray-400">{i + 1}</td>
                    <td className="px-3 py-3">
                      <p className="font-semibold text-gray-800">{t.hari}</p>
                      <p className="text-xs text-gray-400">
                        {new Date(t.tanggal).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" })}
                      </p>
                    </td>
                    <td className="px-3 py-3 text-center text-gray-600">{t.juz}</td>
                    <td className="px-3 py-3 text-gray-700">{t.surat} (hal. {t.halaman})</td>
                    <td className="px-3 py-3 text-center">{badge(t.tajwid)}</td>
                    <td className="px-3 py-3 text-center">{badge(t.makhraj)}</td>
                    <td className="px-3 py-3 text-center">{badge(t.sifatul)}</td>
                    <td className="px-5 py-3 text-gray-600 whitespace-nowrap">{t.guruNama}</td>
                  </tr>
                );
              })}
              {data.rows.length === 0 && (
                <tr><td colSpan={8} className="text-center py-12 text-gray-400">Belum ada riwayat setoran tahsin</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}