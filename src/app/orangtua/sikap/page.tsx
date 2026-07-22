import { getSikapAnak, getStatistikSikapAnak } from "@/actions/orangtua/sikap.action";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";

const P_COLOR: Record<string, string> = {
  SB:"bg-green-100 text-green-700", B:"bg-blue-100 text-blue-700",
  C:"bg-yellow-100 text-yellow-700", K:"bg-red-100 text-red-700",
};
const P_LABEL: Record<string, string> = { SB:"Sangat Baik", B:"Baik", C:"Cukup", K:"Kurang" };

type Props = { searchParams: Promise<{ anakId?: string; semester?: string }> };

export default async function OrangtuaSikapPage({ searchParams }: Props) {
  const session = await auth();
  if (!session || session.user.role !== "ORANGTUA") redirect("/login");

  const params = await searchParams;
  const anakId = params.anakId ? Number(params.anakId) : undefined;

  const ortu = await prisma.orangTua.findUnique({
    where: { id: session.user.id },
    include: { anak: { select: { id: true, nama: true } } },
  });

  const firstAnakId = anakId ?? ortu?.anak[0]?.id;
  const [sikap, statistik] = await Promise.all([
    getSikapAnak({ anakId, semester: params.semester }),
    firstAnakId ? getStatistikSikapAnak(firstAnakId) : null,
  ]);

  return (
    <div className="p-6 space-y-5 max-w-4xl mx-auto">
      <h1 className="text-xl font-bold text-gray-900">Monitoring Sikap</h1>

      <form className="flex flex-wrap gap-3 bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
        <select name="anakId" defaultValue={params.anakId ?? ""}
          onChange={(e) => e.currentTarget.form?.requestSubmit()}
          className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 bg-white">
          <option value="">Semua Anak</option>
          {ortu?.anak.map((a) => <option key={a.id} value={a.id}>{a.nama}</option>)}
        </select>
        <select name="semester" defaultValue={params.semester ?? ""}
          onChange={(e) => e.currentTarget.form?.requestSubmit()}
          className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 bg-white">
          <option value="">Semua Semester</option>
          <option value="GANJIL">Ganjil</option>
          <option value="GENAP">Genap</option>
        </select>
        <button type="submit" className="bg-[#1B5E20] text-white text-sm px-4 py-2 rounded-lg hover:bg-[#2E7D32] transition-colors">
          Tampilkan
        </button>
      </form>

      {statistik && (
        <div className="grid grid-cols-4 gap-3">
          {Object.entries(statistik).map(([p, n]) => (
            <div key={p} className={`rounded-xl border p-4 text-center ${P_COLOR[p]}`}>
              <p className="text-2xl font-bold">{n}</p>
              <p className="text-xs mt-0.5">{P_LABEL[p]}</p>
            </div>
          ))}
        </div>
      )}

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-200">
              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Siswa</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Aspek</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Predikat</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Tanggal</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {sikap.length === 0 && (
              <tr><td colSpan={4} className="text-center py-12 text-gray-400 text-sm">Belum ada catatan sikap</td></tr>
            )}
            {sikap.map((s) => (
              <tr key={s.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-4 py-3 text-sm font-medium text-gray-800">{s.siswa.nama}</td>
                <td className="px-4 py-3 text-sm text-gray-600">{s.aspek}</td>
                <td className="px-4 py-3">
                  <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${P_COLOR[s.predikat]}`}>
                    {P_LABEL[s.predikat]}
                  </span>
                </td>
                <td className="px-4 py-3 text-xs text-gray-500">
                  {new Date(s.tanggal).toLocaleDateString("id-ID", { day:"numeric", month:"short", year:"numeric" })}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}