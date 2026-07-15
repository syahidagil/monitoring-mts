import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import OrangtuaForm from "@/components/admin/orangtua/OrangtuaForm";

export default async function EditOrangtuaPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const ortu = await prisma.orangTua.findUnique({
    where: { id },
    include: { user: { select: { name: true, username: true, status: true } } },
  });
  if (!ortu) notFound();
  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-xl font-bold text-gray-900">Edit Data Orang Tua</h1>
        <p className="text-sm text-gray-500 mt-1">Perbarui data: {ortu.user.name}</p>
      </div>
      <OrangtuaForm defaultValues={{ ...ortu, ...ortu.user }} isEdit ortuId={ortu.id} />
    </div>
  );
}