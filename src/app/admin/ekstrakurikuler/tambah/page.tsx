import { prisma } from "@/lib/prisma";
import TambahEskulForm from "./TambahEskulForm";

// Daftar guru harus selalu terbaru (guru baru langsung muncul di dropdown)
export const dynamic = "force-dynamic";

export default async function TambahEskulPage() {
  const guru = await prisma.guru.findMany({
    where: { user: { status: true } },
    select: { id: true, user: { select: { name: true } } },
    orderBy: { user: { name: "asc" } },
  });

  return <TambahEskulForm guruList={guru.map((g) => ({ id: g.id, nama: g.user.name }))} />;
}