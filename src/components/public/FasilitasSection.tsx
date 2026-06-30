import { Building2, Monitor, BookOpen, Dumbbell, FlaskConical, Wifi } from "lucide-react";
import type { InformasiSekolah } from "@prisma/client";

const ICONS = [Building2, Monitor, BookOpen, Dumbbell, FlaskConical, Wifi];

export default function FasilitasSection({
  fasilitas,
}: {
  fasilitas: InformasiSekolah[];
}) {
  return (
    <section id="fasilitas" className="py-20 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <p className="text-green-600 text-sm font-semibold tracking-widest uppercase mb-2">
            Sarana & Prasarana
          </p>
          <h2 className="text-3xl font-bold text-gray-900">
            Fasilitas Unggulan
          </h2>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {fasilitas.map((item, i) => {
            const Icon = ICONS[i % ICONS.length];
            return (
              <div
                key={item.idInfo}
                className="bg-white rounded-2xl p-6 shadow-sm hover:shadow-md transition-all hover:-translate-y-1 border border-gray-100"
              >
                <div className="w-12 h-12 bg-green-50 rounded-xl flex items-center justify-center mb-4">
                  <Icon className="w-6 h-6 text-green-700" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">{item.judul}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">{item.isi}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}