import { getTahsinAnak, getProgressTahsinAnak } from "@/actions/orangtua/tahsin.action";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";

const S_COLOR: Record<string, string> = {
  BELUM:"bg-gray-100 text-gray-600", PROSES:"bg-blue-100 text-blue-700",
  LULUS:"bg-green-100 text-green-700", MENGULANG:"bg-red-100 text-red-700",
};

type Props = { searchParams: Promise<{ anakId?: string }> };

export default async function OrangtuaTahsinPage({ searchParams }: Props) {
  const session = await auth();
  if (!session || session.user.role !== "ORANGTUA") redirect("/login");

  const params = await searchParams;
  const anakId = params.anakId ? Number(params.anakId) : undefined;

  const ortu = await prisma.orangTua.findUnique({
    where: { id: session.user.id },
    include: { anak: { select: { id: true, nama: true } } },
  });

  const firstAnakId = anakId ?? ortu?.anak[0]?.id;
  const [tahsin, progress] = await Promise.all([
    getTahsinAnak({ anakId }),
    firstAnakId ? getProgressTahsinAnak(firstAnakId) : null,
  ]);

  return (
    <div className="p-6 space-y-5 max-w-4xl mx-auto">
      <h1 className="text-xl font-bold text-gray-900">Monitoring Tahsin</h1>

      <form className="flex flex-wrap gap-3 bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
        <select name="anakId" defaultValue={params.anakId ?? ""}
          onChange={(e) => e.currentTarget.form?.requestSubmit()}
          className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 bg-white">
          <option value="">Semua Anak</option>
          {ortu?.anak.map((a) => <option key={a.id} value={a.id}>{a.nama}</option>)}
        </select>
        <button type="submit" className="bg-[#1B5E20] text-white text-sm px-4 py-2 rounded-lg hover:bg-[#2E7D32] transition-colors">
          Tampilkan
        </button>
      </form>

      {progress && (
        <div className="grid grid-cols-3 gap-3">
          {[
            { label:"Lulus",     value:progress.lulus,     color:"bg-green-50 text-green-700 border-green-100" },
            { label:"Proses",    value:progress.proses,    color:"bg-blue-50 text-blue-700 border-blue-100"   },
            { label:"Mengulang", value:progress.mengulang, color:"bg-red-50 text-red-700 border-red-100"     },
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
              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Siswa</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Materi</th>
              <th className="text-center px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Nilai</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Status</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Tanggal</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {tahsin.length === 0 && (
              <tr><td colSpan={5} className="text-center py-12 text-gray-400 text-sm">Belum ada data tahsin</td></tr>
            )}
            {tahsin.map((t) => (
              <tr key={t.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-4 py-3 text-sm font-medium text-gray-800">{t.siswa.nama}</td>
                <td className="px-4 py-3 text-sm text-gray-600">{t.materi}</td>
                <td className="px-4 py-3 text-center">
                  {t.nilai ? <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${Number(t.nilai) >= 80 ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"}`}>{String(t.nilai)}</span>
                  : <span className="text-gray-300 text-xs">—</span>}
                </td>
                <td className="px-4 py-3">
                  <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${S_COLOR[t.status]}`}>{t.status}</span>
                </td>
                <td className="px-4 py-3 text-xs text-gray-500">
                  {new Date(t.tanggal).toLocaleDateString("id-ID", { day:"numeric", month:"short", year:"numeric" })}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}