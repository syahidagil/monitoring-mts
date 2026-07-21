import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { getSiswaTahfidz } from "@/actions/guru/hafalan.action";
import Link from "next/link";
import { BookOpen, ChevronRight } from "lucide-react";

export default async function GuruHafalanPage() {
  const session = await auth();
  if (!session || session.user.role !== "GURU") redirect("/login");
  const siswa = await getSiswaTahfidz(session.user.id);
  return (
    <main className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-2xl mx-auto space-y-5">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Hafalan Al-Quran</h1>
          <p className="text-sm text-gray-500 mt-1">{siswa.length} siswa program tahfidz</p>
        </div>
        {siswa.length === 0 ? (
          <div className="bg-white rounded-xl border border-gray-200 p-12 text-center text-gray-400 text-sm">
            Belum ada siswa program tahfidz di kelas Anda
          </div>
        ) : (
          <div className="space-y-3">
            {siswa.map((s) => (
              <Link key={s.id} href={`/guru/hafalan/${s.id}`}
                className="flex items-center gap-4 bg-white rounded-xl border border-gray-200 p-4 hover:shadow-md hover:border-green-200 transition-all group">
                <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-sm font-bold text-green-700">{s.nama.charAt(0)}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-gray-800">{s.nama}</p>
                  <p className="text-xs text-gray-500">{s.nis} • Kelas {s.kelas.nama} • {s._count.hafalan} catatan</p>
                </div>
                <ChevronRight className="w-4 h-4 text-gray-300 group-hover:text-green-600 transition-colors flex-shrink-0" />
              </Link>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}