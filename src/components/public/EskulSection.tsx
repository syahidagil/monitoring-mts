import { BookOpen, Dumbbell, Cpu, Music, Shield, Palette } from "lucide-react";
import type { InformasiSekolah } from "@prisma/client";

const ICONS = [BookOpen, Dumbbell, Cpu, Music, Shield, Palette];

export default function EskulSection({
  eskul,
}: {
  eskul: InformasiSekolah[];
}) {
  return (
    <section id="ekstrakurikuler" className="py-20 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <p className="text-green-600 text-sm font-semibold tracking-widest uppercase mb-2">
            Pengembangan Diri
          </p>
          <h2 className="text-3xl font-bold text-gray-900">
            Ekstrakurikuler
          </h2>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {eskul.map((item, i) => {
            const Icon = ICONS[i % ICONS.length];
            const [jadwal, pembina, deskripsi] = item.isi.split("|");
            return (
              <div
                key={item.idInfo}
                className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm hover:shadow-md transition-all"
              >
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-12 h-12 bg-green-50 rounded-xl flex items-center justify-center">
                    <Icon className="w-6 h-6 text-green-700" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">{item.judul}</h3>
                    <p className="text-xs text-green-600">{jadwal}</p>
                  </div>
                </div>
                <p className="text-xs text-gray-500 mb-1">
                  <span className="font-medium text-gray-700">Pembina:</span> {pembina}
                </p>
                <p className="text-xs text-gray-500 leading-relaxed">{deskripsi}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}