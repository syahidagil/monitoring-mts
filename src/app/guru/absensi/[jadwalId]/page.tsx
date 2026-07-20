import { auth } from "@/lib/auth";
import { redirect, notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getAbsensiByJadwalTanggal } from "@/actions/guru/absensi.action";
import AbsensiForm from "@/components/guru/absensi/AbsensiForm";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default async function AbsensiJadwalPage({ params }: { params: Promise<{ jadwalId: string }> }) {
  const session = await auth();
  if (!session || session.user.role !== "GURU") redirect("/login");

  const { jadwalId } = await params;
  const jadwal = await prisma.jadwal.findUnique({
    where: { id: Number(jadwalId) },
    include: {
      kelas:         { include: { siswa: { where: { status: true }, orderBy: { nama: "asc" } } } },
      mataPelajaran: { select: { namaMapel: true } },
    },
  });
  if (!jadwal || jadwal.guruId !== session.user.id) notFound();

  const tanggal = new Date().toISOString().split("T")[0];
  const existing = await getAbsensiByJadwalTanggal(jadwal.id, tanggal);

  return (
    <main className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-3xl mx-auto space-y-5">
        <div className="flex items-center justify-between">
          <div>
            <Link href="/guru/absensi" className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 mb-2">
              <ArrowLeft className="w-4 h-4" /> Kembali
            </Link>
            <h1 className="text-xl font-bold text-gray-900">Input Absensi</h1>
            <p className="text-sm text-gray-500">
              {jadwal.mataPelajaran?.namaMapel ?? jadwal.mapel} • Kelas {jadwal.kelas.nama} • {jadwal.hari} {jadwal.jamMulai}–{jadwal.jamSelesai}
            </p>
          </div>
          <div className="text-right">
            <p className="text-xs text-gray-400">Tanggal</p>
            <p className="text-sm font-semibold text-gray-700">{new Date().toLocaleDateString("id-ID", { weekday:"long", day:"numeric", month:"long", year:"numeric" })}</p>
          </div>
        </div>
        <AbsensiForm
          jadwalId={jadwal.id}
          tanggal={tanggal}
          siswaList={jadwal.kelas.siswa.map((s) => ({ id: s.id, nis: s.nis, nama: s.nama }))}
          existingAbsensi={existing.map((e) => ({ siswaId: e.siswaId, status: e.status }))}
        />
      </div>
    </main>
  );
}