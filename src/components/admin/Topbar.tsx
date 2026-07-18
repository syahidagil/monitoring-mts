"use client";
import { usePathname } from "next/navigation";
import { logoutAction } from "@/actions/auth.action";
import { LogOut, Bell, User } from "lucide-react";

const breadcrumbMap: Record<string, [string, string]> = {
  "/admin/dashboard": ["Dashboard", "Panel Admin"],
  "/admin/data-siswa": ["Data Siswa", "Manajemen Data Siswa"],
  "/admin/data-siswa/input": ["Input Data Siswa", "Manajemen Data Siswa"],
  "/admin/data-orangtua": ["Data Wali", "Manajemen Data Wali"],
  "/admin/data-orangtua/input": ["Input Data Wali", "Manajemen Data Wali"],
  "/admin/data-guru": ["Data Guru", "Manajemen Data Guru"],
  "/admin/data-guru/input": ["Input Data Guru", "Manajemen Data Guru"],
  "/admin/data-kelas": ["Data Kelas", "Manajemen Data Kelas"],
  "/admin/data-kelas/input": ["Input Data Kelas", "Manajemen Data Kelas"],
  "/admin/mata-pelajaran": ["Mata Pelajaran", "Manajemen Mata Pelajaran"],
  "/admin/mata-pelajaran/input": ["Input Mata Pelajaran", "Manajemen Mata Pelajaran"],
  "/admin/berita": ["Berita", "Manajemen Berita"],
  "/admin/berita/tambah": ["Tambah Berita", "Manajemen Berita"],
  "/admin/prestasi": ["Prestasi", "Manajemen Prestasi"],
  "/admin/prestasi/tambah": ["Tambah Prestasi", "Manajemen Prestasi"],
  "/admin/ekstrakurikuler": ["Ekstrakurikuler", "Manajemen Ekstrakurikuler"],
  "/admin/ekstrakurikuler/tambah": ["Tambah Ekstrakurikuler", "Manajemen Ekstrakurikuler"],
  "/admin/informasi/sejarah": ["Sejarah", "Data Informasi Sekolah"],
  "/admin/informasi/visi-misi": ["Visi Misi", "Data Informasi Sekolah"],
  "/admin/informasi/kurikulum": ["Kurikulum", "Data Informasi Sekolah"],
  "/admin/informasi/fasilitas": ["Fasilitas", "Data Informasi Sekolah"],
  "/admin/pmbm": ["PSB", "Manajemen PSB"],
  "/admin/pmbm/tambah": ["Tambah PSB", "Manajemen PSB"],
  "/admin/pengguna": ["Manajemen Pengguna", "Akun Admin"],
  "/admin/pengaturan": ["Pengaturan", "Konfigurasi Sistem"],
};

function resolveBreadcrumb(pathname: string): [string, string] {
  if (breadcrumbMap[pathname]) return breadcrumbMap[pathname];

  const dynamicGroups: Array<{ prefix: string; label: string; subtitle: string }> = [
    { prefix: "/admin/data-siswa/", label: "Data Siswa", subtitle: "Manajemen Data Siswa" },
    { prefix: "/admin/data-orangtua/", label: "Data Wali", subtitle: "Manajemen Data Wali" },
    { prefix: "/admin/data-guru/", label: "Data Guru", subtitle: "Manajemen Data Guru" },
    { prefix: "/admin/data-kelas/", label: "Data Kelas", subtitle: "Manajemen Data Kelas" },
    { prefix: "/admin/mata-pelajaran/", label: "Mata Pelajaran", subtitle: "Manajemen Mata Pelajaran" },
    { prefix: "/admin/berita/", label: "Berita", subtitle: "Manajemen Berita" },
    { prefix: "/admin/prestasi/", label: "Prestasi", subtitle: "Manajemen Prestasi" },
    { prefix: "/admin/ekstrakurikuler/", label: "Ekstrakurikuler", subtitle: "Manajemen Ekstrakurikuler" },
    { prefix: "/admin/pmbm/", label: "PSB", subtitle: "Manajemen PSB" },
    { prefix: "/admin/informasi/", label: "Data Informasi Sekolah", subtitle: "Manajemen Data Informasi Sekolah" },
  ];

  const matched = dynamicGroups.find((item) => pathname.startsWith(item.prefix));
  if (!matched) return ["Admin Panel", "Dashboard"];

  if (pathname.endsWith("/input") || pathname.endsWith("/tambah")) {
    return [`Input ${matched.label}`, matched.subtitle];
  }

  if (pathname.endsWith("/edit")) {
    return [`Edit ${matched.label}`, matched.subtitle];
  }

  if (matched.prefix === "/admin/informasi/") {
    const segment = pathname.split("/").pop() ?? matched.label;
    const readable = segment.replace(/-/g, " ").replace(/\b\w/g, (char) => char.toUpperCase());
    return [readable, matched.subtitle];
  }

  return [matched.label, matched.subtitle];
}

type TopbarUser = {
  name?: string | null;
};

export default function Topbar({ user }: { user: TopbarUser }) {
  const pathname = usePathname();
  const [title, subtitle] = resolveBreadcrumb(pathname);
  return (
    <header className="bg-white border-b border-gray-200 px-6 h-14 flex items-center justify-between flex-shrink-0">
      <div className="min-w-0">
        <p className="truncate text-sm font-semibold text-gray-800">
          {title}
          <span className="mx-2 text-gray-300">|</span>
          <span className="font-medium text-gray-500">{subtitle}</span>
        </p>
      </div>
      <div className="flex items-center gap-4">
        <button className="relative p-2 text-gray-400 hover:text-gray-600">
          <Bell className="w-5 h-5" />
          <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
        </button>
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
            <User className="w-4 h-4 text-green-700" />
          </div>
          <div className="hidden sm:block">
            <p className="text-xs font-semibold text-gray-700">{user?.name}</p>
            <p className="text-[10px] text-gray-400">Administrator</p>
          </div>
        </div>
        <form action={logoutAction}>
          <button className="flex items-center gap-1.5 text-xs text-red-500 hover:text-red-700 border border-red-200 hover:border-red-300 px-3 py-1.5 rounded-lg transition-colors">
            <LogOut className="w-3.5 h-3.5" />
            Keluar
          </button>
        </form>
      </div>
    </header>
  );
}
