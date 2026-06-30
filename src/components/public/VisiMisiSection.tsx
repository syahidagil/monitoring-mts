import { Target, Eye, Flag } from "lucide-react";
import type { InformasiSekolah } from "@prisma/client";

export default function VisiMisiSection({
  visi, misi, tujuan,
}: {
  visi?: InformasiSekolah | null;
  misi?: InformasiSekolah | null;
  tujuan?: InformasiSekolah | null;
}) {
  const misiList = misi?.isi.split("|") ?? [];
  const tujuanList = tujuan?.isi.split("|") ?? [];

  return (
    <section id="visi-misi" className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <p className="text-green-600 text-sm font-semibold tracking-widest uppercase mb-2">
            Arah & Tujuan
          </p>
          <h2 className="text-3xl font-bold text-gray-900">
            Visi, Misi & Tujuan
          </h2>
        </div>
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Visi */}
          <div className="bg-green-900 rounded-2xl p-8 text-white">
            <div className="w-12 h-12 bg-white/10 rounded-xl flex items-center justify-center mb-6">
              <Eye className="w-6 h-6" />
            </div>
            <p className="text-green-400 text-xs font-semibold tracking-widest uppercase mb-3">
              Visi
            </p>
            <p className="text-lg font-medium leading-relaxed italic">
              &ldquo;{visi?.isi ?? "Terwujudnya peserta didik yang unggul dalam ilmu pengetahuan, Islami dalam akhlak, dan berwawasan global."}&rdquo;
            </p>
          </div>

          {/* Misi */}
          <div className="bg-green-50 border border-green-100 rounded-2xl p-8">
            <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center mb-6">
              <Target className="w-6 h-6 text-green-700" />
            </div>
            <p className="text-green-600 text-xs font-semibold tracking-widest uppercase mb-3">
              Misi
            </p>
            <ul className="space-y-3">
              {misiList.map((item, i) => (
                <li key={i} className="flex gap-3 text-sm text-gray-700">
                  <span className="w-5 h-5 bg-green-600 text-white rounded-full flex items-center justify-center text-xs flex-shrink-0 mt-0.5">
                    {i + 1}
                  </span>
                  {item}
                </li>
              ))}
            </ul>
          </div>

          {/* Tujuan */}
          <div className="bg-gray-50 border border-gray-100 rounded-2xl p-8">
            <div className="w-12 h-12 bg-gray-200 rounded-xl flex items-center justify-center mb-6">
              <Flag className="w-6 h-6 text-gray-700" />
            </div>
            <p className="text-gray-500 text-xs font-semibold tracking-widest uppercase mb-3">
              Tujuan
            </p>
            <ul className="space-y-3">
              {tujuanList.map((item, i) => (
                <li key={i} className="flex gap-3 text-sm text-gray-700">
                  <span className="text-green-600 font-bold flex-shrink-0">→</span>
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}