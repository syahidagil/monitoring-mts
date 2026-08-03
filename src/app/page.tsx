import { prisma } from "@/lib/prisma";
import Navbar from "@/components/public/Navbar";
import HeroSection from "@/components/public/HeroSection";
import StatistikSection from "@/components/public/StatistikSection";
import SejarahSection from "@/components/public/SejarahSection";
import VisiMisiSection from "@/components/public/VisiMisiSection";
// import FasilitasSection from "@/components/public/FasilitasSection";
import KurikulumSection from "@/components/public/KurikulumSection";
import PrestasiSection from "@/components/public/PrestasiSection";
import BeritaSection from "@/components/public/BeritaSection";
import EskulSection from "@/components/public/EskulSection";
import QuoteSection from "@/components/public/QuoteSection";
import Footer from "@/components/public/Footer";

export default async function HomePage() {
  const [data, siswaCount, guruCount, prestasiCount, eskulCount] = await Promise.all([
    prisma.informasiSekolah.findMany({ orderBy: { tanggalUpdate: "desc" } }),
    prisma.siswa.count({ where: { status: true } }),
    prisma.guru.count(),
    prisma.informasiSekolah.count({ where: { kategori: "prestasi" } }),
    prisma.informasiSekolah.count({ where: { kategori: "ekstrakurikuler" } }),
  ]);

  const get = (kategori: string) =>
    data.filter((d) => d.kategori === kategori);

  return (
    <main className="bg-white">
      <Navbar />
      <HeroSection />
      <StatistikSection
        counts={{ siswa: siswaCount, guru: guruCount, prestasi: prestasiCount, eskul: eskulCount }}
      />
      <SejarahSection sejarah={get("sejarah")[0]} />
      <VisiMisiSection
        visi={get("visi")[0]}
        misi={get("misi")[0]}
        tujuan={get("tujuan")[0]}
      />
      {/* <FasilitasSection fasilitas={get("fasilitas")} /> */}
      <KurikulumSection kurikulum={get("kurikulum")} />
      <PrestasiSection prestasi={get("prestasi")} />
      <BeritaSection berita={get("berita")} />
      <EskulSection eskul={get("ekstrakurikuler")} />
      <QuoteSection />
      <Footer />
    </main>
  );
}