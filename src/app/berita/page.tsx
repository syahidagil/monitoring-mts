import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { ArrowLeft, Calendar } from "lucide-react";
import Navbar from "@/components/public/Navbar";
import Footer from "@/components/public/Footer";

const PLACEHOLDER_IMGS = [
  "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=400&h=250&fit=crop",
  "https://images.unsplash.com/photo-1609710228159-0fa9bd7e0827?w=400&h=250&fit=crop",
  "https://images.unsplash.com/photo-1580582932707-520aed937b7b?w=400&h=250&fit=crop",
  "https://images.unsplash.com/photo-1529390079861-591de354faf5?w=400&h=250&fit=crop",
];

function formatTanggal(date: Date | string) {
  return new Date(date).toLocaleDateString("id-ID", {
    day: "numeric", month: "long", year: "numeric",
  });
}

export default async function SemuaBeritaPage() {
  const berita = await prisma.informasiSekolah.findMany({
    where: { kategori: "berita" },
    orderBy: { tanggalUpdate: "desc" },
  });

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-[#F9FAFB] pt-20">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 py-10">
          <div className="mb-8">
            <Link href="/#berita" className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 mb-4">
              <ArrowLeft className="w-4 h-4" /> Kembali ke Beranda
            </Link>
            <h1 className="text-3xl font-bold text-gray-900">Semua Berita</h1>
            <p className="text-gray-500 mt-2">Ikuti perkembangan terbaru dan kegiatan madrasah kami</p>
          </div>

          {berita.length === 0 && (
            <div className="text-center py-20 text-gray-400">
              <p className="text-lg">Belum ada berita tersedia</p>
            </div>
          )}

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {berita.map((item, i) => (
              <Link key={item.idInfo} href={`/berita/${item.idInfo}`}
                className="bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-all group block">
                <div className="relative h-48 overflow-hidden">
                  <img
                    src={item.gambar ?? PLACEHOLDER_IMGS[i % PLACEHOLDER_IMGS.length]}
                    alt={item.judul}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                </div>
                <div className="p-5">
                  <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-green-100 text-green-800">
                    BERITA
                  </span>
                  <h2 className="font-bold text-gray-900 text-base mt-2 mb-2 line-clamp-2 leading-snug group-hover:text-[#1B5E20] transition-colors">
                    {item.judul}
                  </h2>
                  <p className="text-sm text-gray-500 line-clamp-3 leading-relaxed mb-4">
                    {item.isi}
                  </p>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5 text-xs text-gray-400">
                      <Calendar className="w-3.5 h-3.5" />
                      {formatTanggal(item.tanggalUpdate)}
                    </div>
                    <span className="text-xs font-semibold text-[#2E7D32] group-hover:underline">
                      Selengkapnya
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
