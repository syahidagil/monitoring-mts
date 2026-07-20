import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { logoutAction } from "@/actions/auth.action";
import StatistikCard from "@/components/guru/dashboard/StatistikCard";
import JadwalHariIni from "@/components/guru/dashboard/JadwalHariIni";
import NotifikasiGuru from "@/components/guru/dashboard/NotifikasiGuru";

export default async function GuruDashboard() {
  const session = await auth();
  if (!session || session.user.role !== "GURU") redirect("/login");
  const guruId = session.user.id;

  const [jadwal, kelas, totalNilai] = await Promise.all([
    prisma.jadwal.findMany({
      where: { guruId },
      include: {
        kelas:         { select: { id: true, nama: true, _count: { select: { siswa: true } } } },
        mataPelajaran: { select: { namaMapel: true } },
      },
    }),
    prisma.kelas.findMany({
      where: { jadwal: { some: { guruId } } },
      include: { _count: { select: { siswa: true } } },
      distinct: ["id"],
    }),
    prisma.nilai.count({ where: { guruId } }),
  ]);

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const absensiHariIni = await prisma.absensi.count({
    where: { guruId, tanggal: { gte: today } },
  });

  const totalSiswa = kelas.reduce((a, k) => a + k._count.siswa, 0);

  // Jadwal hari ini yang belum ada absensinya
  const todayName = ["MINGGU","SENIN","SELASA","RABU","KAMIS","JUMAT","SABTU"][new Date().getDay()];
  const jadwalHari = jadwal.filter((j) => j.hari === todayName);
  const jadwalBelumAbsensi = await Promise.all(
    jadwalHari.map(async (j) => {
      const count = await prisma.absensi.count({ where: { jadwalId: j.id, tanggal: { gte: today } } });
      return count === 0 ? j : null;
    })
  ).then((res) => res.filter(Boolean));

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-6 py-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-gray-900">Dashboard Guru</h1>
            <p className="text-sm text-gray-500 mt-1">Selamat datang, {session.user.name}</p>
          </div>
          <form action={logoutAction}>
            <button className="text-sm text-red-500 border border-red-200 px-4 py-2 rounded-lg hover:bg-red-50 transition-colors">
              Keluar
            </button>
          </form>
        </div>

        <StatistikCard
          totalSiswa={totalSiswa}
          totalJadwal={jadwal.length}
          totalAbsensiHariIni={absensiHariIni}
          totalNilaiInput={totalNilai}
        />

        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <JadwalHariIni jadwal={jadwal} />
          </div>
          <div>
            <NotifikasiGuru jadwalBelumAbsensi={jadwalBelumAbsensi as any[]} kelasAktif={kelas} />
          </div>
        </div>
      </div>
    </main>
  );
}