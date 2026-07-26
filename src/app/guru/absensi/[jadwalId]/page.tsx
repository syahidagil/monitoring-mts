import { auth } from "@/lib/auth";
import { redirect, notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getAbsensiByJadwalTanggal, getCatatanUmum } from "@/actions/guru/absensi.action";
import AbsensiForm from "@/components/guru/absensi/AbsensiForm";

export default async function AbsensiJadwalPage({ params }: { params: Promise<{ jadwalId: string }> }) {
  const session = await auth();
  if (!session || session.user.role !== "GURU") redirect("/login");

  const { jadwalId } = await params;

  const jadwal = await prisma.jadwal.findUnique({
    where: { id: Number(jadwalId) },
    include: {
      kelas: {
        include: {
          siswa: {
            where:   { status: true },
            orderBy: { nama: "asc" },
          },
        },
      },
      mataPelajaran: { select: { namaMapel: true } },
      guru: {
        include: { user: { select: { name: true } } },
      },
    },
  });

  if (!jadwal || jadwal.guruId !== session.user.id) notFound();

  const tanggal    = new Date().toISOString().split("T")[0];
  const existing   = await getAbsensiByJadwalTanggal(jadwal.id, tanggal);
  const catatanUmum = await getCatatanUmum(jadwal.id, tanggal);

  const jadwalInfo = {
    mapel:     jadwal.mataPelajaran?.namaMapel ?? jadwal.kodeMapel,
    kelas:     jadwal.kelas.nama,
    tingkat:   jadwal.kelas.tingkat,
    hari:      jadwal.hari,
    jamMulai:  jadwal.jamMulai,
    jamSelesai:jadwal.jamSelesai,
  };

  const guruInfo = {
    nama:  jadwal.guru.user.name,
    nip:   jadwal.guru.nip,
    mapel: jadwal.mataPelajaran?.namaMapel ?? jadwal.kodeMapel,
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-5xl mx-auto pb-10">
      <AbsensiForm
        jadwalId={jadwal.id}
        tanggal={tanggal}
        siswaList={jadwal.kelas.siswa.map((s) => ({ id: s.id, nis: s.nis, nama: s.nama }))}
        existingAbsensi={existing.map((e) => ({ siswaId: e.siswaId, status: e.status, keterangan: e.keterangan }))}
        catatanUmum={catatanUmum}
        jadwalInfo={jadwalInfo}
        guruInfo={guruInfo}
      />
      </div>
    </div>
  );
}