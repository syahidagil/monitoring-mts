import { prisma } from "@/lib/prisma";
import FasilitasClient from "./FasilitasClient";

export default async function FasilitasPage() {
  const fasilitas = await prisma.informasiSekolah.findMany({
    where: { kategori: "fasilitas" },
    orderBy: { tanggalUpdate: "desc" },
  });
  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-xl font-bold text-gray-900">Kelola Fasilitas</h1>
        <p className="text-sm text-gray-500 mt-1">Tambah, edit, dan hapus data fasilitas sekolah</p>
      </div>
      <FasilitasClient fasilitas={fasilitas} />
    </div>
  );
}
