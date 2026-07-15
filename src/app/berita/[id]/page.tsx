import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Calendar, User } from "lucide-react";
import Navbar from "@/components/public/Navbar";
import Footer from "@/components/public/Footer";

function formatTanggal(date: Date | string) {
  return new Date(date).toLocaleDateString("id-ID", {
    weekday: "long", day: "numeric", month: "long", year: "numeric",
  });
}

export default async function DetailBeritaPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const berita = await prisma.informasiSekolah.findFirst({
    where: { idInfo: Number(id) },
    include: { admin: { select: { name: true } } },
  });

  if (!berita) notFound();

  const beritaLain = await prisma.informasiSekolah.findMany({
    where: { kategori: "berita", NOT: { idInfo: berita.idInfo } },
    orderBy: { tanggalUpdate: "desc" },
    take: 3,
  });

  const IMGS = [
    "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=800&h=400&fit=crop",
    "https://images.unsplash.com/photo-1609710228159-0fa9bd7e0827?w=800&h=400&fit=crop",
    "https://images.unsplash.com/photo-1580582932707-520aed937b7b?w=800&h=400&fit=crop",
  ];

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-[#F9FAFB] pt-20">
        <div className="max-w-4xl mx-auto px-6 lg:px-8 py-10">
          <Link href="/berita" className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 mb-6">
            <ArrowLeft className="w-4 h-4" /> Kembali ke Semua Berita
          </Link>
          <article className="bg-white rounded-2xl shadow-sm overflow-hidden">
            <div className="relative h-64 sm:h-80 overflow-hidden">
              <img
                src={berita.gambar ?? IMGS[berita.idInfo % IMGS.length]}
                alt={berita.judul}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
              <div className="absolute bottom-0 left-0 p-6">
                <span className="text-xs font-bold uppercase tracking-wider px-2.5 py-1 rounded bg-green-500 text-white">
                  BERITA
                </span>
              </div>
            </div>
            <div className="p-6 sm:p-8">
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 leading-tight mb-4">
                {berita.judul}
              </h1>
              <div className="flex flex-wrap items-center gap-4 text-sm text-gray-400 mb-6 pb-6 border-b border-gray-100">
                <div className="flex items-center gap-1.5">
                  <Calendar className="w-4 h-4" />
                  {formatTanggal(berita.tanggalUpdate)}
                </div>
                <div className="flex items-center gap-1.5">
                  <User className="w-4 h-4" />
                  {berita.admin.name}
                </div>
              </div>
              <div className="text-gray-700 leading-relaxed whitespace-pre-wrap text-sm sm:text-base">
                {berita.isi}
              </div>
            </div>
          </article>
          {beritaLain.length > 0 && (
            <div className="mt-10">
              <h2 className="text-xl font-bold text-gray-900 mb-5">Berita Lainnya</h2>
              <div className="grid sm:grid-cols-3 gap-5">
                {beritaLain.map((item, i) => (
                  <Link key={item.idInfo} href={`/berita/${item.idInfo}`}
                    className="bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-all group block">
                    <div className="relative h-36 overflow-hidden">
                      <img src={item.gambar ?? IMGS[i % IMGS.length]} alt={item.judul}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                    </div>
                    <div className="p-4">
                      <h3 className="font-semibold text-sm text-gray-800 line-clamp-2 group-hover:text-[#1B5E20] transition-colors">
                        {item.judul}
                      </h3>
                      <p className="text-xs text-gray-400 mt-1">
                        {new Date(item.tanggalUpdate).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" })}
                      </p>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </>
  );
}