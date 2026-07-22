import Link from "next/link";
import { ClipboardList, BookOpen, Heart, BookMarked, Star, BarChart2 } from "lucide-react";

const REKAP_MENU = [
  { label: "Rekap Absensi",  href: "/guru/rekap/absensi",  icon: ClipboardList, color: "bg-green-50 text-green-700 border-green-100",  desc: "Rekap kehadiran siswa per periode" },
  { label: "Rekap Nilai",    href: "/guru/rekap/nilai",    icon: BookOpen,       color: "bg-blue-50 text-blue-700 border-blue-100",     desc: "Rekap dan rata-rata nilai per mapel" },
  { label: "Rekap Sikap",    href: "/guru/rekap/sikap",    icon: Heart,          color: "bg-pink-50 text-pink-700 border-pink-100",     desc: "Rekap catatan perilaku siswa" },
  { label: "Rekap Hafalan",  href: "/guru/rekap/hafalan",  icon: BookMarked,     color: "bg-purple-50 text-purple-700 border-purple-100", desc: "Progress hafalan Al-Quran siswa" },
  { label: "Rekap Tahsin",   href: "/guru/rekap/tahsin",   icon: Star,           color: "bg-yellow-50 text-yellow-700 border-yellow-100", desc: "Progress tahsin Al-Quran siswa" },
];

export default function RekapHubPage() {
  return (
    <main className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-2xl mx-auto space-y-5">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Rekap & Laporan</h1>
          <p className="text-sm text-gray-500 mt-1">Pilih jenis rekap yang ingin dilihat</p>
        </div>
        <div className="space-y-3">
          {REKAP_MENU.map(({ label, href, icon: Icon, color, desc }) => (
            <Link key={href} href={href}
              className={`flex items-center gap-4 p-4 rounded-xl border bg-white hover:shadow-md transition-all group`}>
              <div className={`w-11 h-11 rounded-xl border flex items-center justify-center flex-shrink-0 ${color}`}>
                <Icon className="w-5 h-5" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-semibold text-gray-800 group-hover:text-[#1B5E20] transition-colors">{label}</p>
                <p className="text-xs text-gray-400 mt-0.5">{desc}</p>
              </div>
              <BarChart2 className="w-4 h-4 text-gray-300 group-hover:text-green-500 transition-colors flex-shrink-0" />
            </Link>
          ))}
        </div>
      </div>
    </main>
  );
}