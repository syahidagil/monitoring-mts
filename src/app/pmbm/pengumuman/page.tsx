
import { prisma } from "@/lib/prisma";
import Navbar from "@/components/public/Navbar";
import Footer from "@/components/public/Footer";
import Link from "next/link";
import { ArrowLeft, FileText, Download, Calendar } from "lucide-react";

export default async function PengumumanPMBMPage() {
  const pengumuman = await prisma.pengumumanPmbm.findMany({
    orderBy: { createdAt: "desc" },
    include: { admin: { select: { name: true } } },
  });

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-[#F9FAFB] pt-20">
        <div className="bg-[#1B5E20] py-12">
          <div className="max-w-4xl mx-auto px-6 lg:px-8">
            <Link href="/" className="inline-flex items-center gap-2 text-green-300 hover:text-white text-sm mb-4">
              <ArrowLeft className="w-4 h-4" /> Kembali ke Beranda
            </Link>
            <h1 className="text-3xl font-bold text-white">Pengumuman PMBM 2026/2027</h1>
            <p className="text-green-200 mt-2">Daftar pengumuman resmi penerimaan murid baru MTS Al-Amin Bintaro</p>
          </div>
        </div>

        <div className="max-w-4xl mx-auto px-6 lg:px-8 py-10">
          {pengumuman.length === 0 ? (
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-12 text-center">
              <FileText className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <h3 className="font-semibold text-gray-600 mb-2">Belum ada pengumuman</h3>
              <p className="text-sm text-gray-400">Pengumuman PMBM akan ditampilkan di sini saat tersedia</p>
            </div>
          ) : (
            <div className="space-y-4">
              {pengumuman.map((item, i) => (
                <div key={item.id}
                  className={`bg-white rounded-2xl border shadow-sm p-6 transition-all hover:shadow-md ${i === 0 ? "border-green-200 ring-1 ring-green-100" : "border-gray-100"}`}>
                  <div className="flex items-start gap-4">
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${i === 0 ? "bg-green-100" : "bg-gray-100"}`}>
                      <FileText className={`w-6 h-6 ${i === 0 ? "text-green-700" : "text-gray-500"}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-3 flex-wrap">
                        <div>
                          <h3 className="font-bold text-gray-900 text-base">{item.judul}</h3>
                          <div className="flex items-center gap-3 mt-1">
                            <span className="text-xs font-semibold bg-green-50 text-green-700 px-2 py-0.5 rounded-full">
                              {item.tahun}
                            </span>
                            <div className="flex items-center gap-1 text-xs text-gray-400">
                              <Calendar className="w-3 h-3" />
                              {new Date(item.createdAt).toLocaleDateString("id-ID", {
                                day: "numeric", month: "long", year: "numeric"
                              })}
                            </div>
                          </div>
                        </div>
                        {i === 0 && (
                          <span className="text-xs font-semibold bg-green-500 text-white px-3 py-1 rounded-full flex-shrink-0">
                            Terbaru
                          </span>
                        )}
                      </div>

                      {item.deskripsi && (
                        <p className="text-sm text-gray-500 mt-2 leading-relaxed">{item.deskripsi}</p>
                      )}

                      <div className="mt-4 flex items-center gap-3">
                        <a
                          href={item.filePath}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-2 bg-[#1B5E20] hover:bg-[#2E7D32] text-white text-sm font-semibold px-4 py-2 rounded-lg transition-colors"
                        >
                          <Download className="w-4 h-4" />
                          Unduh Pengumuman
                        </a>
                        <a
                          href={item.filePath}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-2 border border-gray-200 text-gray-600 hover:text-gray-800 hover:border-gray-300 text-sm px-4 py-2 rounded-lg transition-colors"
                        >
                          <FileText className="w-4 h-4" />
                          Lihat File
                        </a>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className="mt-8 bg-blue-50 border border-blue-100 rounded-2xl p-5">
            <p className="text-sm font-semibold text-blue-800 mb-1">Pertanyaan seputar PMBM?</p>
            <p className="text-sm text-blue-600">
              Hubungi kami di{" "}
              <a href="tel:02173881234" className="font-semibold underline">(021) 7388 1234</a>
              {" "}atau email{" "}
              <a href="mailto:info@mtsalamin-bintaro.sch.id" className="font-semibold underline">
                info@mtsalamin-bintaro.sch.id
              </a>
            </p>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}