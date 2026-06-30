import { prisma } from "@/lib/prisma";
import KurikulumForm from "./KurikulumForm";

export default async function KurikulumPage() {
  const kurikulum = await prisma.informasiSekolah.findMany({
    where: { kategori: "kurikulum" },
    orderBy: { idInfo: "asc" },
  });
  const nasional = kurikulum.find((k) => k.judul.toLowerCase().includes("nasional"));
  const keislaman = kurikulum.find((k) => k.judul.toLowerCase().includes("keislaman") || k.judul.toLowerCase().includes("islam"));
  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-xl font-bold text-gray-900">Kelola Kurikulum</h1>
        <p className="text-sm text-gray-500 mt-1">Edit konten kurikulum nasional dan keislaman</p>
      </div>
      <KurikulumForm nasional={nasional} keislaman={keislaman} />
    </div>
  );
}
