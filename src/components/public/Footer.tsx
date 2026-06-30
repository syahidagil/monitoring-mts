import { MapPin, Phone, Mail, Clock } from "lucide-react";
import Link from "next/link";
export default function Footer() {
  return (
    <footer className="bg-[#1a2e1a] text-white">
      <div className="max-w-7xl mx-auto px-6 lg:px-8 py-14">
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-10 mb-10">
          <div>
            <div className="flex items-center gap-2.5 mb-4">
              <div className="w-9 h-9 bg-[#2E7D32] rounded-lg flex items-center justify-center">
                <svg width="18" height="18" viewBox="0 0 20 20" fill="none">
                  <path d="M10 2L3 7v11h5v-5h4v5h5V7L10 2z" fill="white"/>
                </svg>
              </div>
              <p className="font-bold text-sm">MTS Al-Amin Bintaro</p>
            </div>
            <p className="text-gray-400 text-sm leading-relaxed mb-5">
              Lembaga pendidikan formal tingkat menengah pertama yang berorientasi pada nilai-nilai keislaman dan keunggulan akademik global.
            </p>
            <div className="flex gap-3">
              {["fb", "ig", "yt"].map((s) => (
                <a key={s} href="#" className="w-8 h-8 bg-white/10 hover:bg-[#2E7D32] rounded-full flex items-center justify-center text-xs font-bold transition-colors uppercase">
                  {s}
                </a>
              ))}
            </div>
          </div>
          <div>
            <p className="font-semibold text-sm mb-5">Tautan Cepat</p>
            {["Sejarah Madrasah","Fasilitas Kampus","Program Kurikulum","Galeri Kegiatan","Kontak Kami"].map((item) => (
              <a key={item} href="#" className="flex items-center gap-2 text-gray-400 hover:text-white text-sm py-1.5 transition-colors">
                <span className="text-[#4CAF50] text-xs">&#9654;</span> {item}
              </a>
            ))}
          </div>
          <div>
            <p className="font-semibold text-sm mb-5">Hubungi Kami</p>
            <div className="space-y-4">
              <div className="flex gap-3 text-sm text-gray-400">
                <MapPin className="w-4 h-4 text-[#4CAF50] flex-shrink-0 mt-0.5" />
                <span>Jl. Mawar Raya No. 45, Bintaro Jaya Sektor 2, Jakarta Selatan, 12330</span>
              </div>
              <div className="flex gap-3 text-sm text-gray-400">
                <Phone className="w-4 h-4 text-[#4CAF50] flex-shrink-0" />
                <span>(021) 7388 1234</span>
              </div>
              <div className="flex gap-3 text-sm text-gray-400">
                <Mail className="w-4 h-4 text-[#4CAF50] flex-shrink-0" />
                <span>info@mtsalaminbintaro.sch.id</span>
              </div>
              <div className="flex gap-3 text-sm text-gray-400">
                <Clock className="w-4 h-4 text-[#4CAF50] flex-shrink-0" />
                <span>Senin - Jumat: 07:00 - 15:30</span>
              </div>
            </div>
          </div>
          <div>
            <p className="font-semibold text-sm mb-5">Lokasi Madrasah</p>
            <div className="rounded-lg overflow-hidden h-36 bg-gray-700 mb-3">
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3965.521!2d106.77!3d-6.28!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zNsKwMTYnNDguMCJTIDEwNsKwNDYnMTIuMCJF!5e0!3m2!1sid!2sid!4v1234567890"
                width="100%"
                height="100%"
                style={{ border: 0 }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              />
            </div>
            <a href="https://maps.google.com" target="_blank" rel="noopener noreferrer"
              className="block w-full bg-[#2E7D32] hover:bg-[#1B5E20] text-white text-sm font-semibold py-2.5 rounded-lg text-center transition-colors">
              Petunjuk Arah
            </a>
          </div>
        </div>
        <div className="border-t border-white/10 pt-6 flex flex-col sm:flex-row justify-between items-center gap-3">
          <p className="text-gray-500 text-xs">2024 MTS Al-Amin Bintaro. Hak Cipta Dilindungi Undang-Undang.</p>
          <div className="flex gap-4">
            {["Kebijakan Privasi","Syarat & Ketentuan","Sitemap"].map((item) => (
              <a key={item} href="#" className="text-gray-500 hover:text-white text-xs transition-colors">{item}</a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
