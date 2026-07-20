import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { getJadwalByGuru } from "@/actions/jadwal.action";
import Link from "next/link";
import { ChevronRight, BookOpen } from "lucide-react";

export default async function GuruNilaiPage() {
  const session = await auth();
  if (!session || session.user.role !== "GURU") redirect("/login");
  const jadwal = await getJadwalByGuru(session.user.id);
  const unique = jadwal.filter((j, i, arr) =>
    i === arr.findIndex((x) => x.kelasId === j.kelasId && x.mapel === j.mapel)
  );
  return (
    <main className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-2xl mx-auto space-y-5">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Input Nilai</h1>
          <p className="text-sm text-gray-500 mt-1">Pilih kelas & mata pelajaran</p>
        </div>
        <div className="space-y-3">
          {unique.map((j) => (
            <Link key={j.id} href={`/guru/nilai/${j.id}`}
              className="flex items-center gap-4 bg-white rounded-xl border border-gray-200 p-4 hover:shadow-md hover:border-green-200 transition-all group">
              <div className="w-10 h-10 bg-green-50 rounded-lg flex items-center justify-center flex-shrink-0">
                <BookOpen className="w-4 h-4 text-green-700" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-semibold text-gray-800">{j.mataPelajaran?.namaMapel ?? j.mapel}</p>
                <p className="text-xs text-gray-500">Kelas {j.kelas.nama}</p>
              </div>
              <ChevronRight className="w-4 h-4 text-gray-300 group-hover:text-green-600 transition-colors" />
            </Link>
          ))}
        </div>
      </div>
    </main>
  );
}