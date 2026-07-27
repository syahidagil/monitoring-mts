import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import BeritaForm from "../../BeritaForm";

export default async function EditBeritaPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const berita = await prisma.informasiSekolah.findUnique({
    where: { idInfo: Number(id) },
  });
  if (!berita) notFound();

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-xl font-bold text-gray-900">Edit Berita</h1>
        <p className="text-sm text-gray-500 mt-1">Perbarui konten berita sekolah</p>
      </div>
      <BeritaForm data={berita} />
    </div>
  );
}
