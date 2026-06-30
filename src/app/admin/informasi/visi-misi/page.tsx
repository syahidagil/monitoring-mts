import { prisma } from "@/lib/prisma";
import VisiMisiForm from "./VisiMisiForm";

export default async function VisiMisiPage() {
  const [visi, misi, tujuan] = await Promise.all([
    prisma.informasiSekolah.findFirst({ where: { kategori: "visi" } }),
    prisma.informasiSekolah.findFirst({ where: { kategori: "misi" } }),
    prisma.informasiSekolah.findFirst({ where: { kategori: "tujuan" } }),
  ]);
  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-xl font-bold text-gray-900">Visi, Misi & Tujuan</h1>
        <p className="text-sm text-gray-500 mt-1">Kelola konten visi misi yang tampil di halaman publik</p>
      </div>
      <VisiMisiForm visi={visi} misi={misi} tujuan={tujuan} />
    </div>
  );
}
