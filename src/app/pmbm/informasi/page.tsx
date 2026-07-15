import Navbar from "@/components/public/Navbar";
import Footer from "@/components/public/Footer";
import Link from "next/link";
import { ArrowLeft, FileText, Calendar, Users, CheckCircle } from "lucide-react";

export default function InformasiPMBMPage() {
  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-[#F9FAFB] pt-20">
        <div className="bg-[#1B5E20] py-12">
          <div className="max-w-4xl mx-auto px-6 lg:px-8">
            <Link href="/" className="inline-flex items-center gap-2 text-green-300 hover:text-white text-sm mb-4">
              <ArrowLeft className="w-4 h-4" /> Kembali ke Beranda
            </Link>
            <h1 className="text-3xl font-bold text-white">Informasi PMBM 2026/2027</h1>
            <p className="text-green-200 mt-2">Penerimaan Murid Baru Madrasah MTS Al-Amin Bintaro</p>
          </div>
        </div>

        <div className="max-w-4xl mx-auto px-6 lg:px-8 py-10 space-y-6">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-green-50 rounded-xl flex items-center justify-center">
                <Calendar className="w-5 h-5 text-green-700" />
              </div>
              <h2 className="text-lg font-bold text-gray-900">Jadwal Pendaftaran</h2>
            </div>
            <div className="space-y-3">
              {[
                { fase: "Pendaftaran Online", tanggal: "1 Februari - 31 Maret 2026" },
                { fase: "Seleksi Berkas", tanggal: "1 - 15 April 2026" },
                { fase: "Pengumuman Tahap 1", tanggal: "20 April 2026" },
                { fase: "Daftar Ulang", tanggal: "21 April - 5 Mei 2026" },
                { fase: "Pengumuman Final", tanggal: "10 Mei 2026" },
              ].map((item) => (
                <div key={item.fase} className="flex items-center justify-between py-3 border-b border-gray-50 last:border-0">
                  <span className="text-sm font-medium text-gray-700">{item.fase}</span>
                  <span className="text-sm text-green-700 font-semibold bg-green-50 px-3 py-1 rounded-full">{item.tanggal}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center">
                <FileText className="w-5 h-5 text-blue-700" />
              </div>
              <h2 className="text-lg font-bold text-gray-900">Persyaratan Pendaftaran</h2>
            </div>
            <ul className="space-y-2.5">
              {[
                "Fotokopi Akta Kelahiran (2 lembar)",
                "Fotokopi Kartu Keluarga (2 lembar)",
                "Fotokopi Rapor SD/MI kelas 4, 5, dan 6",
                "Pas foto 3x4 (6 lembar, background merah)",
                "Surat Keterangan Lulus dari SD/MI",
                "Fotokopi NISN (Nomor Induk Siswa Nasional)",
              ].map((item) => (
                <li key={item} className="flex items-start gap-2.5 text-sm text-gray-600">
                  <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                  {item}
                </li>
              ))}
            </ul>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-purple-50 rounded-xl flex items-center justify-center">
                <Users className="w-5 h-5 text-purple-700" />
              </div>
              <h2 className="text-lg font-bold text-gray-900">Daya Tampung</h2>
            </div>
            <div className="grid grid-cols-3 gap-4">
              {[
                { label: "Total Kelas", value: "6 Kelas" },
                { label: "Per Kelas", value: "32 Siswa" },
                { label: "Total Kuota", value: "192 Siswa" },
              ].map((item) => (
                <div key={item.label} className="text-center bg-gray-50 rounded-xl py-4">
                  <p className="text-2xl font-bold text-[#1B5E20]">{item.value}</p>
                  <p className="text-xs text-gray-500 mt-1">{item.label}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-[#1B5E20] rounded-2xl p-6 text-center">
            <h3 className="text-white font-bold text-lg mb-2">Siap Mendaftar?</h3>
            <p className="text-green-200 text-sm mb-4">Daftarkan putra/putri Anda sekarang dan jadilah bagian dari MTS Al-Amin Bintaro</p>
            <a href="mailto:info@mtsalamin-bintaro.sch.id"
              className="inline-block bg-white text-[#1B5E20] font-semibold text-sm px-6 py-2.5 rounded-lg hover:bg-green-50 transition-colors">
              Hubungi Kami
            </a>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
