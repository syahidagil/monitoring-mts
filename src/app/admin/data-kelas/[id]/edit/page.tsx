import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import KelasForm from "@/components/admin/kelas/KelasForm";

export default async function EditKelasPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [kelas, tahunAjaran, guru] = await Promise.all([
    prisma.kelas.findUnique({ where: { id: Number(id) } }),
    prisma.tahunAjaran.findMany({ orderBy: { nama: "desc" } }),
    prisma.guru.findMany({ include: { user: { select: { name: true } } }, orderBy: { user: { name: "asc" } } }),
  ]);
  if (!kelas) notFound();
  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-xl font-bold text-gray-900">Edit Kelas</h1>
        <p className="text-sm text-gray-500 mt-1">Perbarui data kelas {kelas.nama}</p>
      </div>
      <KelasForm tahunAjaran={tahunAjaran} guru={guru} defaultValues={kelas} isEdit kelasId={kelas.id} />
    </div>
  );
}