import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { getJadwalByGuru } from "@/actions/jadwal.action";
import JadwalList from "@/components/guru/absensi/JadwalList";

export default async function GuruAbsensiPage() {
  const session = await auth();
  if (!session || session.user.role !== "GURU") redirect("/login");
  const jadwal = await getJadwalByGuru(session.user.id);
  return (
    <main className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-2xl mx-auto space-y-5">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Absensi Siswa</h1>
          <p className="text-sm text-gray-500 mt-1">Pilih jadwal untuk mengisi absensi</p>
        </div>
        <JadwalList jadwal={jadwal} />
      </div>
    </main>
  );
}