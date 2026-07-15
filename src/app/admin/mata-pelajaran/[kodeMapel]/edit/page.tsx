import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import MapelForm from "@/components/admin/mapel/MapelForm";

export default async function EditMapelPage({ params }: { params: Promise<{ kodeMapel: string }> }) {
  const { kodeMapel } = await params;
  const mapel = await prisma.mataPelajaran.findUnique({ where: { kodeMapel } });
  if (!mapel) notFound();
  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-xl font-bold text-gray-900">Edit Mata Pelajaran</h1>
        <p className="text-sm text-gray-500 mt-1">Perbarui data: {mapel.namaMapel}</p>
      </div>
      <MapelForm defaultValues={mapel} isEdit />
    </div>
  );
}