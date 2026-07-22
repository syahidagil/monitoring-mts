import { getNilaiAnak, getRataRataNilaiAnak } from "@/actions/orangtua/nilai.action";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";

const JENIS_COLOR: Record<string, string> = {
  HARIAN:"bg-blue-100 text-blue-700", UTS:"bg-purple-100 text-purple-700",
  UAS:"bg-red-100 text-red-700", TUGAS:"bg-yellow-100 text-yellow-700",
  PRAKTIK:"bg-green-100 text-green-700",
};

type Props = { searchParams: Promise<{ anakId?: string; mapel?: string; semester?: string }> };

export default async function OrangtuaNilaiPage({ searchParams }: Props) {
  const session = await auth();
  if (!session || session.user.role !== "ORANGTUA") redirect("/login");

  const params  = await searchParams;
  const anakId  = params.anakId ? Number(params.anakId) : undefined;

  const ortu = await prisma.orangTua.findUnique({
    where: { id: session.user.id },
    include: { anak: { select: { id: true, nama: true } } },
  });

  const firstAnakId = anakId ?? ortu?.anak[0]?.id;
  const [nilai, rataRata] = await Promise.all([
    getNilaiAnak({ anakId, mapel: params.mapel, semester: params.semester }),
    firstAnakId ? getRataRataNilaiAnak(firstAnakId) : [],
  ]);

  return (
    <div className="p-6 space-y-5 max-w-4xl mx-auto">
      <h1 className="text-xl font-bold text-gray-900">Monitoring Nilai</h1>

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

      {rataRata.length > 0 && (
        <div>
          <h3 className="text-sm font-semibold text-gray-700 mb-3">Rata-rata per Mata Pelajaran</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {rataRata.map((r) => (
              <div key={r.mapel} className="bg-white rounded-xl border border-gray-200 p-4 text-center shadow-sm">
                <p className="text-xl font-bold text-[#1B5E20]">{r.rata}</p>
                <p className="text-xs text-gray-500 mt-0.5 font-medium">{r.mapel}</p>
                <p className="text-xs text-gray-300">{r.count} penilaian</p>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-200">
              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Siswa</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Mapel</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Jenis</th>
              <th className="text-center px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Nilai</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Tanggal</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {nilai.length === 0 && (
              <tr><td colSpan={5} className="text-center py-12 text-gray-400 text-sm">Belum ada data nilai</td></tr>
            )}
            {nilai.map((n) => (
              <tr key={n.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-4 py-3 text-sm font-medium text-gray-800">{n.siswa.nama}</td>
                <td className="px-4 py-3 text-sm text-gray-600">{n.mapel}</td>
                <td className="px-4 py-3">
                  <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${JENIS_COLOR[n.jenis]}`}>{n.jenis}</span>
                </td>
                <td className="px-4 py-3 text-center">
                  <span className={`text-sm font-bold px-3 py-1 rounded-full ${Number(n.nilai) >= 75 ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
                    {String(n.nilai)}
                  </span>
                </td>
                <td className="px-4 py-3 text-xs text-gray-500">
                  {new Date(n.tanggal).toLocaleDateString("id-ID", { day:"numeric", month:"short", year:"numeric" })}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}