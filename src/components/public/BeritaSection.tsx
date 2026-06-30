import { ArrowRight } from "lucide-react";

const BADGE_COLORS: Record<string, string> = {
  berita: "bg-green-100 text-green-800",
  akademik: "bg-blue-100 text-blue-800",
  religi: "bg-yellow-100 text-yellow-800",
  fasilitas: "bg-purple-100 text-purple-800",
  eskul: "bg-orange-100 text-orange-800",
};

function formatTanggal(date: Date | string) {
  return new Date(date).toLocaleDateString("id-ID", { day: "2-digit", month: "short", year: "numeric" });
}

export default function BeritaSection({ berita }: { berita: any[] }) {
  const PLACEHOLDER_IMGS = [
    "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=400&h=250&fit=crop",
    "https://images.unsplash.com/photo-1609710228159-0fa9bd7e0827?w=400&h=250&fit=crop",
    "https://images.unsplash.com/photo-1580582932707-520aed937b7b?w=400&h=250&fit=crop",
    "https://images.unsplash.com/photo-1529390079861-591de354faf5?w=400&h=250&fit=crop",
  ];
  return (
    <section id="berita" className="py-16 bg-[#F9FAFB]">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="flex items-end justify-between mb-3">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Berita Terkini</h2>
            <p className="text-gray-500 text-sm mt-1">Ikuti perkembangan terbaru dan kegiatan madrasah kami.</p>
          </div>
          <a href="#" className="hidden sm:flex items-center gap-1 text-[#2E7D32] hover:text-[#1B5E20] text-sm font-semibold transition-colors">
            Lihat Semua <ArrowRight className="w-4 h-4" />
          </a>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 mt-8">
          {berita.slice(0, 4).map((item, i) => (
            <div key={item.idInfo} className="bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-all group">
              <div className="relative h-44 overflow-hidden">
                <img
                  src={item.gambar ?? PLACEHOLDER_IMGS[i % PLACEHOLDER_IMGS.length]}
                  alt={item.judul}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
              </div>
              <div className="p-4">
                <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded ${BADGE_COLORS["berita"]}`}>
                  BERITA
                </span>
                <h3 className="font-bold text-gray-900 text-sm mt-2 mb-1 line-clamp-2 leading-snug">
                  {item.judul}
                </h3>
                <p className="text-xs text-gray-500 line-clamp-3 leading-relaxed mb-3">
                  {item.isi}
                </p>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-400">{formatTanggal(item.tanggalUpdate)}</span>
                  <a href="#" className="text-xs font-semibold text-[#2E7D32] hover:underline">Selengkapnya</a>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
