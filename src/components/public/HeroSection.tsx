export default function HeroSection() {
  return (
    <section id="beranda" className="relative min-h-screen flex items-end pb-20 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/50 to-black/20 z-10" />
      <div className="absolute inset-0 bg-gradient-to-b from-[#1B5E20]/40 via-transparent to-transparent z-10" />
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: "url('/images/gedung-sekolah.jpg')" }}
      />
      <div className="relative z-20 max-w-7xl mx-auto px-6 lg:px-8 w-full pt-24">
        <div className="max-w-2xl">
          <div className="inline-block bg-[#2E7D32] text-white text-xs font-semibold px-4 py-1.5 rounded-sm mb-6 tracking-wider uppercase">
            Penerimaan Siswa Baru 2024/2025
          </div>
          <h1 className="text-5xl lg:text-6xl font-bold text-white leading-tight mb-6">
            Selamat Datang di<br />
            <span className="text-[#4CAF50]">MTS Al-Amin Bintaro</span>
          </h1>
          <p className="text-white/80 text-base lg:text-lg leading-relaxed max-w-lg">
            Madrasah Unggul dalam Prestasi, Berakhlak Islami, dan Berwawasan Global.
            Membentuk Generasi Qurani yang Siap Menghadapi Masa Depan.
          </p>
        </div>
      </div>
    </section>
  );
}
