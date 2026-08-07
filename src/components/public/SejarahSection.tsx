import Image from "next/image";
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
              sekolah unggulan di Mataram.
            </p>
            {/* <div className="flex items-center gap-3 text-green-700 bg-green-50 border border-green-100 rounded-xl p-4">
              <BookOpen className="w-5 h-5 flex-shrink-0" />
              <p className="text-sm font-medium">
                Berdiri sejak 2022 · Lebih dari 50+ alumni
              </p>
            </div> */}
          </div>
          <div className="relative">
            <div className="relative aspect-[4/3] rounded-2xl overflow-hidden shadow-xl">
              <Image
                src="/images/depan.jpeg"
                alt="Tampak depan sekolah"
                fill
                className="object-cover"
                sizes="(min-width: 1024px) 50vw, 100vw"
                priority
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}