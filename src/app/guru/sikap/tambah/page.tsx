import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import {
  getSiswaUntukSikap,
  getSikapById,
} from "@/actions/guru/sikap.action";
import SikapForm from "@/components/guru/sikap/SikapForm";

export default async function TambahSikapPage({
  searchParams,
}: {
  searchParams: Promise<{ id?: string }>;
}) {
  const session = await auth();
  if (!session || session.user.role !== "GURU") redirect("/login");

  const sp = await searchParams;
  const editId = sp.id ? Number(sp.id) : null;

  const [guru, tahunAktif, siswaList, existing] = await Promise.all([
    prisma.guru.findUnique({
      where: { id: session.user.id },
      include: { user: { select: { name: true } } },
    }),
    prisma.tahunAjaran.findFirst({ where: { aktif: true } }),
    getSiswaUntukSikap(),
    editId ? getSikapById(editId) : Promise.resolve(null),
  ]);

  return (
    <SikapForm
      guruNama={guru?.user.name ?? "Guru"}
      periode={
        tahunAktif
          ? `Semester ${tahunAktif.semester === "GANJIL" ? "Ganjil" : "Genap"} ${tahunAktif.nama}`
          : "Periode belum diatur"
      }
      siswaList={siswaList}
      existing={existing}
    />
  );
}