import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { getAllSikapByGuru } from "@/actions/guru/sikap.action";
import Link from "next/link";
import { Plus } from "lucide-react";

const PREDIKAT_COLOR: Record<string, string> = {
  SB:"bg-green-100 text-green-700", B:"bg-blue-100 text-blue-700",
  C:"bg-yellow-100 text-yellow-700", K:"bg-red-100 text-red-700",
};
const PREDIKAT_LABEL: Record<string, string> = { SB:"Sangat Baik", B:"Baik", C:"Cukup", K:"Kurang" };

export default async function GuruSikapPage() {
  const session = await auth();
  if (!session || session.user.role !== "GURU") redirect("/login");
  const sikap = await getAllSikapByGuru();
  return (
    <main className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto space-y-5">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-gray-900">Penilaian Sikap</h1>
            <p className="text-sm text-gray-500 mt-1">{sikap.length} catatan sikap</p>
          </div>
          <Link href="/guru/sikap/tambah"
            className="flex items-center gap-2 bg-[#1B5E20] hover:bg-[#2E7D32] text-white text-sm font-semibold px-4 py-2.5 rounded-lg transition-colors">
            <Plus className="w-4 h-4" /> Tambah Catatan
          </Link>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="text-left px-4 py-3.5 text-xs font-semibold text-gray-500 uppercase">Siswa</th>
                <th className="text-left px-4 py-3.5 text-xs font-semibold text-gray-500 uppercase">Aspek</th>
                <th className="text-left px-4 py-3.5 text-xs font-semibold text-gray-500 uppercase">Predikat</th>
                <th className="text-left px-4 py-3.5 text-xs font-semibold text-gray-500 uppercase">Tanggal</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {sikap.length === 0 && (
                <tr><td colSpan={4} className="text-center py-12 text-gray-400 text-sm">Belum ada catatan sikap</td></tr>
              )}
              {sikap.map((s) => (
                <tr key={s.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3.5">
                    <p className="text-sm font-medium text-gray-800">{s.siswa.nama}</p>
                    <p className="text-xs text-gray-400">Kelas {s.siswa.kelas.nama} • {s.siswa.nis}</p>
                  </td>
                  <td className="px-4 py-3.5 text-sm text-gray-700">{s.aspek}</td>
                  <td className="px-4 py-3.5">
                    <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${PREDIKAT_COLOR[s.predikat]}`}>
                      {PREDIKAT_LABEL[s.predikat]}
                    </span>
                  </td>
                  <td className="px-4 py-3.5 text-xs text-gray-500">
                    {new Date(s.tanggal).toLocaleDateString("id-ID", { day:"numeric", month:"short", year:"numeric" })}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </main>
  );
}