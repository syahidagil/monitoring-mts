import { getAbsensiAnak, getRingkasanAbsensiAnak } from "@/actions/orangtua/absensi.action";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";

const STATUS_COLOR: Record<string, string> = {
  HADIR:"bg-green-100 text-green-700", SAKIT:"bg-blue-100 text-blue-700",
  IZIN:"bg-yellow-100 text-yellow-700", ALPHA:"bg-red-100 text-red-700",
};

type Props = { searchParams: Promise<{ anakId?: string; bulan?: string; tahun?: string }> };

export default async function OrangtuaAbsensiPage({ searchParams }: Props) {
  const session = await auth();
  if (!session || session.user.role !== "ORANGTUA") redirect("/login");

  const params = await searchParams;
  const anakId = params.anakId ? Number(params.anakId) : undefined;
  const bulan  = params.bulan  ? Number(params.bulan)  : new Date().getMonth() + 1;
  const tahun  = params.tahun  ? Number(params.tahun)  : new Date().getFullYear();

  const ortu = await prisma.orangTua.findUnique({
    where: { id: session.user.id },
    include: { anak: { select: { id: true, nama: true, kelas: { select: { nama: true } } } } },
  });

  const [absensi, ringkasan] = await Promise.all([
    getAbsensiAnak({ anakId, bulan, tahun }),
    anakId ? getRingkasanAbsensiAnak(anakId) : null,
  ]);

  const BULAN = ["Jan","Feb","Mar","Apr","Mei","Jun","Jul","Agu","Sep","Okt","Nov","Des"];

  return (
    <div className="p-6 space-y-5 max-w-4xl mx-auto">
      <h1 className="text-xl font-bold text-gray-900">Monitoring Absensi</h1>

      <form className="flex flex-wrap gap-3 bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
        <select name="anakId" defaultValue={params.anakId ?? ""}
          onChange={(e) => e.currentTarget.form?.requestSubmit()}
          className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 bg-white">
          <option value="">Semua Anak</option>
          {ortu?.anak.map((a) => <option key={a.id} value={a.id}>{a.nama}</option>)}
        </select>
        <select name="bulan" defaultValue={String(bulan)}
          onChange={(e) => e.currentTarget.form?.requestSubmit()}
          className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 bg-white">
          {BULAN.map((b, i) => <option key={i} value={i + 1}>{b}</option>)}
        </select>
        <input type="number" name="tahun" defaultValue={tahun} min="2020" max="2030"
          className="w-24 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500" />
        <button type="submit" className="bg-[#1B5E20] text-white text-sm px-4 py-2 rounded-lg hover:bg-[#2E7D32] transition-colors">
          Tampilkan
        </button>
      </form>

      {ringkasan && (
        <div className="grid grid-cols-4 gap-3">
          {[
            { label:"Hadir",  value:ringkasan.HADIR,  color:"bg-green-50 text-green-700 border-green-100"  },
            { label:"Sakit",  value:ringkasan.SAKIT,  color:"bg-blue-50 text-blue-700 border-blue-100"    },
            { label:"Izin",   value:ringkasan.IZIN,   color:"bg-yellow-50 text-yellow-700 border-yellow-100" },
            { label:"Alpha",  value:ringkasan.ALPHA,  color:"bg-red-50 text-red-700 border-red-100"       },
          ].map((s) => (
            <div key={s.label} className={`rounded-xl border p-4 text-center ${s.color}`}>
              <p className="text-2xl font-bold">{s.value}</p>
              <p className="text-xs mt-0.5">{s.label}</p>
            </div>
          ))}
        </div>
      )}

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-200">
              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Tanggal</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Siswa</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Mata Pelajaran</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {absensi.length === 0 && (
              <tr><td colSpan={4} className="text-center py-12 text-gray-400 text-sm">Tidak ada data absensi</td></tr>
            )}
            {absensi.map((a) => (
              <tr key={a.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-4 py-3 text-sm text-gray-600">
                  {new Date(a.tanggal).toLocaleDateString("id-ID", { day:"numeric", month:"short", year:"numeric" })}
                </td>
                <td className="px-4 py-3 text-sm font-medium text-gray-800">{a.siswa.nama}</td>
                <td className="px-4 py-3 text-sm text-gray-600">{a.jadwal.mapel}</td>
                <td className="px-4 py-3">
                  <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${STATUS_COLOR[a.status]}`}>
                    {a.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}