import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { getJadwalByGuru } from "@/actions/jadwal.action";
import Link from "next/link";

const HARI_COLOR: Record<string, string> = {
  SENIN:"bg-blue-50 text-blue-700", SELASA:"bg-purple-50 text-purple-700",
  RABU:"bg-green-50 text-green-700", KAMIS:"bg-yellow-50 text-yellow-700",
  JUMAT:"bg-orange-50 text-orange-700", SABTU:"bg-pink-50 text-pink-700",
};

export default async function GuruJadwalPage() {
  const session = await auth();
  if (!session || session.user.role !== "GURU") redirect("/login");

  const jadwal = await getJadwalByGuru(session.user.id);

  return (
    <main className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto space-y-5">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Jadwal Mengajar</h1>
          <p className="text-sm text-gray-500 mt-1">{jadwal.length} jadwal aktif</p>
        </div>
        {jadwal.length === 0 ? (
          <div className="bg-white rounded-xl border border-gray-200 p-12 text-center text-gray-400 text-sm">
            Belum ada jadwal mengajar
          </div>
        ) : (
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  <th className="text-left px-5 py-3.5 text-xs font-semibold text-gray-500 uppercase">Hari</th>
                  <th className="text-left px-5 py-3.5 text-xs font-semibold text-gray-500 uppercase">Mata Pelajaran</th>
                  <th className="text-left px-5 py-3.5 text-xs font-semibold text-gray-500 uppercase">Kelas</th>
                  <th className="text-left px-5 py-3.5 text-xs font-semibold text-gray-500 uppercase">Jam</th>
                  <th className="text-center px-5 py-3.5 text-xs font-semibold text-gray-500 uppercase">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {jadwal.map((j) => (
                  <tr key={j.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-5 py-4">
                      <span className={text-xs font-semibold px-2.5 py-1 rounded-full ${HARI_COLOR[j.hari] ?? "bg-gray-100 text-gray-600"}}>{j.hari}</span>
                    </td>
                    <td className="px-5 py-4 text-sm font-medium text-gray-800">{j.mataPelajaran?.namaMapel ?? j.mapel}</td>
                    <td className="px-5 py-4 text-sm text-gray-600">Kelas {j.kelas.nama}</td>
                    <td className="px-5 py-4">
                      <span className="text-xs font-mono bg-gray-100 text-gray-700 px-2.5 py-1 rounded-lg">{j.jamMulai}–{j.jamSelesai}</span>
                    </td>
                    <td className="px-5 py-4 text-center">
                      <Link href={/guru/absensi/${j.id}}
                        className="text-xs bg-[#1B5E20] text-white px-3 py-1.5 rounded-lg hover:bg-[#2E7D32] transition-colors">
                        Input Absensi
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </main>
  );
}