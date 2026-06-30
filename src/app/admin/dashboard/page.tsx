import { prisma } from "@/lib/prisma";
import { Users, Newspaper, Trophy, BookOpen, TrendingUp } from "lucide-react";
import Link from "next/link";

export default async function AdminDashboard() {
  const [totalSiswa, totalGuru, totalBerita, totalPrestasi] = await Promise.all([
    prisma.siswa.count(),
    prisma.guru.count(),
    prisma.informasiSekolah.count({ where: { kategori: "berita" } }),
    prisma.informasiSekolah.count({ where: { kategori: "prestasi" } }),
  ]);
  const beritaTerbaru = await prisma.informasiSekolah.findMany({
    where: { kategori: "berita" },
    orderBy: { tanggalUpdate: "desc" },
    take: 5,
    include: { admin: { select: { name: true } } },
  });

  const STATS = [
    { label: "Total Siswa", value: totalSiswa, icon: Users, color: "bg-blue-50 text-blue-600", border: "border-blue-100" },
    { label: "Total Guru", value: totalGuru, icon: BookOpen, color: "bg-green-50 text-green-600", border: "border-green-100" },
    { label: "Total Berita", value: totalBerita, icon: Newspaper, color: "bg-yellow-50 text-yellow-600", border: "border-yellow-100" },
    { label: "Total Prestasi", value: totalPrestasi, icon: Trophy, color: "bg-purple-50 text-purple-600", border: "border-purple-100" },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-gray-900">Selamat Datang di Panel Admin</h1>
        <p className="text-sm text-gray-500 mt-1">Kelola konten dan data MTS Al-Amin Bintaro</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {STATS.map(({ label, value, icon: Icon, color, border }) => (
          <div key={label} className={`bg-white rounded-xl border ${border} p-5 shadow-sm`}>
            <div className={`w-10 h-10 ${color} rounded-lg flex items-center justify-center mb-3`}>
              <Icon className="w-5 h-5" />
            </div>
            <p className="text-2xl font-bold text-gray-900">{value}</p>
            <p className="text-xs text-gray-500 mt-1">{label}</p>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white rounded-xl border border-gray-100 shadow-sm">
          <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
            <h2 className="font-semibold text-gray-800 text-sm">Berita Terbaru</h2>
            <Link href="/admin/berita" className="text-xs text-green-600 hover:text-green-700 font-medium">
              Lihat Semua
            </Link>
          </div>
          <div className="divide-y divide-gray-50">
            {beritaTerbaru.length === 0 && (
              <p className="text-sm text-gray-400 text-center py-8">Belum ada berita</p>
            )}
            {beritaTerbaru.map((item) => (
              <div key={item.idInfo} className="flex items-center gap-3 px-5 py-3.5 hover:bg-gray-50 transition-colors">
                <div className="w-9 h-9 bg-green-50 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Newspaper className="w-4 h-4 text-green-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-800 truncate">{item.judul}</p>
                  <p className="text-xs text-gray-400 mt-0.5">
                    {new Date(item.tanggalUpdate).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })}
                    {" · "}{item.admin.name}
                  </p>
                </div>
                <Link href={`/admin/berita`} className="text-xs text-green-600 hover:underline flex-shrink-0">
                  Edit
                </Link>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-100 shadow-sm">
          <div className="px-5 py-4 border-b border-gray-100">
            <h2 className="font-semibold text-gray-800 text-sm">Menu Cepat</h2>
          </div>
          <div className="p-4 grid grid-cols-2 gap-3">
            {[
              { label: "Tambah Berita", href: "/admin/berita/tambah", color: "bg-blue-50 text-blue-700 hover:bg-blue-100" },
              { label: "Edit Sejarah", href: "/admin/informasi/sejarah", color: "bg-green-50 text-green-700 hover:bg-green-100" },
              { label: "Kelola Prestasi", href: "/admin/prestasi", color: "bg-yellow-50 text-yellow-700 hover:bg-yellow-100" },
              { label: "Kelola User", href: "/admin/pengguna", color: "bg-purple-50 text-purple-700 hover:bg-purple-100" },
            ].map((item) => (
              <Link key={item.label} href={item.href}
                className={`${item.color} rounded-lg p-3 text-xs font-medium text-center transition-colors`}>
                {item.label}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
