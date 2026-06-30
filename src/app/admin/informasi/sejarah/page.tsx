import { prisma } from "@/lib/prisma";
import SejarahForm from "./SejarahForm";

export default async function SejarahPage() {
  const sejarah = await prisma.informasiSekolah.findFirst({
    where: { kategori: "sejarah" },
  });
  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-xl font-bold text-gray-900">Edit Sejarah Sekolah</h1>
        <p className="text-sm text-gray-500 mt-1">Kelola konten sejarah yang tampil di halaman publik</p>
      </div>
      <SejarahForm data={sejarah} />
    </div>
  );
}
