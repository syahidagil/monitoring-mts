import { BookOpen } from "lucide-react";
import type { InformasiSekolah } from "@prisma/client";

export default function SejarahSection({
  sejarah,
}: {
  sejarah?: InformasiSekolah | null;
}) {
  return (
    <section id="sejarah" className="py-20 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div>
            <p className="text-green-600 text-sm font-semibold tracking-widest uppercase mb-2">
              Tentang Kami
            </p>
            <h2 className="text-3xl font-bold text-gray-900 mb-6">
              Sejarah Sekolah
            </h2>
            <p className="text-gray-600 leading-relaxed mb-4">
              {sejarah?.isi ??
                "MTS Al-Amin Bintaro didirikan pada tahun 1995 oleh Yayasan Al-Amin dengan visi membangun pendidikan Islam yang berkualitas."}
            </p>
            <p className="text-gray-600 leading-relaxed mb-6">
              Dengan komitmen kuat pada integrasi kurikulum nasional dan
              nilai-nilai keislaman, MTS Al-Amin terus berkembang menjadi
              sekolah unggulan di Tangerang Selatan.
            </p>
            <div className="flex items-center gap-3 text-green-700 bg-green-50 border border-green-100 rounded-xl p-4">
              <BookOpen className="w-5 h-5 flex-shrink-0" />
              <p className="text-sm font-medium">
                Berdiri sejak 1995 · Lebih dari 5.000 alumni
              </p>
            </div>
          </div>
          <div className="relative">
            <div className="aspect-[4/3] bg-gradient-to-br from-green-800 to-green-600 rounded-2xl flex items-center justify-center shadow-xl">
              <div className="text-center text-white/40">
                <BookOpen className="w-16 h-16 mx-auto mb-3" />
                <p className="text-sm">Foto Gedung Sekolah</p>
              </div>
            </div>
            <div className="absolute -bottom-4 -left-4 bg-green-900 text-white rounded-xl px-5 py-3 shadow-lg">
              <p className="text-2xl font-bold">29+</p>
              <p className="text-xs text-green-300">Tahun Berpengalaman</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}