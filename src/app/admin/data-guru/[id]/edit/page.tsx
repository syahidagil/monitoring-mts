import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import GuruForm from "@/components/admin/guru/GuruForm";

export default async function EditGuruPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const guru = await prisma.guru.findUnique({
    where: { id },
    include: { user: { select: { name: true, username: true, status: true } } },
  });
  if (!guru) notFound();
  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-xl font-bold text-gray-900">Edit Data Guru</h1>
        <p className="text-sm text-gray-500 mt-1">Perbarui data guru: {guru.user.name}</p>
      </div>
      <GuruForm defaultValues={{ ...guru, ...guru.user }} isEdit guruId={guru.id} />
    </div>
  );
}