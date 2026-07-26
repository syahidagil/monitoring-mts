import { auth } from "@/lib/auth";
import { redirect, notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import TahsinInputForm from "@/components/guru/tahsin/TahsinInputForm";
import TahsinRiwayatTabel from "@/components/guru/tahsin/TahsinRiwayatTabel";

export default async function InputTahsinPage({
  params,
}: {
  params: Promise<{ siswaId: string }>;
}) {
  const session = await auth();
  if (!session || session.user.role !== "GURU") redirect("/login");

  const { siswaId } = await params;

  const [siswa, guru, tahunAktif] = await Promise.all([
    prisma.siswa.findUnique({
      where: { id: Number(siswaId) },
      include: { kelas: { select: { nama: true } } },
    }),
    prisma.guru.findUnique({
      where: { id: session.user.id },
      include: { user: { select: { name: true } } },
    }),
    prisma.tahunAjaran.findFirst({ where: { aktif: true } }),
  ]);

  if (!siswa) notFound();
  const namaGuru = guru?.user.name ?? "Guru";

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <Link
              href="/guru/tahsin"
              className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 mb-2"
            >
              <ArrowLeft className="w-4 h-4" /> Kembali ke daftar
            </Link>
            <h1 className="text-2xl font-bold text-gray-900">Input Data Tahsin</h1>
          </div>
        </div>

        <TahsinInputForm
          siswaId={siswa.id}
          siswaNama={siswa.nama}
          siswaNis={siswa.nis}
          kelasNama={siswa.kelas.nama}
          namaGuru={namaGuru}
          tahunAjaran={tahunAktif?.nama ?? null}
        />

        <TahsinRiwayatTabel siswaId={siswa.id} namaGuru={namaGuru} />
      </div>
    </div>
  );
}