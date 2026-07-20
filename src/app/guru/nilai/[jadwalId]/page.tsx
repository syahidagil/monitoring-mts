import { auth } from "@/lib/auth";
import { redirect, notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import NilaiForm from "@/components/guru/nilai/NilaiForm";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default async function NilaiJadwalPage({ params }: { params: Promise<{ jadwalId: string }> }) {
  const session = await auth();
  if (!session || session.user.role !== "GURU") redirect("/login");

  const { jadwalId } = await params;
  const jadwal = await prisma.jadwal.findUnique({
    where: { id: Number(jadwalId) },
    include: {
      kelas:         { include: { siswa: { where: { status: true }, orderBy: { nama: "asc" } } } },
      mataPelajaran: { select: { namaMapel: true } },
      tahunAjaran:   { select: { nama: true, semester: true } },
    },
  });
  if (!jadwal || jadwal.guruId !== session.user.id) notFound();

  return (
    <main className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-3xl mx-auto space-y-5">
        <div>
          <Link href="/guru/nilai" className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 mb-2">
            <ArrowLeft className="w-4 h-4" /> Kembali
          </Link>
          <h1 className="text-xl font-bold text-gray-900">Input Nilai</h1>
          <p className="text-sm text-gray-500">
            {jadwal.mataPelajaran?.namaMapel ?? jadwal.mapel} • Kelas {jadwal.kelas.nama} • {jadwal.tahunAjaran?.nama}
          </p>
        </div>
        <NilaiForm
          siswaList={jadwal.kelas.siswa.map((s) => ({ id: s.id, nis: s.nis, nama: s.nama }))}
          mapel={jadwal.mataPelajaran?.namaMapel ?? jadwal.mapel}
          semester={jadwal.tahunAjaran?.semester ?? "GANJIL"}
          tahunAjar={jadwal.tahunAjaran?.nama ?? ""}
          guruId={session.user.id}
        />
      </div>
    </main>
  );
}