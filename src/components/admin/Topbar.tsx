"use client";
import { usePathname } from "next/navigation";
import { logoutAction } from "@/actions/auth.action";
import { LogOut, Bell, User, ChevronRight } from "lucide-react";

type Crumb = { label: string; href?: string };

const BREADCRUMBS: Record<string, Crumb[]> = {
  "/admin/dashboard":                    [{ label: "Dashboard" }],
  "/admin/data-siswa":                   [{ label: "Data Akademik" }, { label: "Data Siswa" }],
  "/admin/data-guru":                    [{ label: "Data Akademik" }, { label: "Data Guru" }],
  "/admin/data-orangtua":               [{ label: "Data Akademik" }, { label: "Data Orang Tua" }],
  "/admin/data-kelas":                   [{ label: "Data Akademik" }, { label: "Data Kelas" }],
  "/admin/jadwal":                       [{ label: "Jadwal" }, { label: "Manajemen Jadwal" }],
  "/admin/mata-pelajaran":              [{ label: "Mata Pelajaran" }, { label: "Daftar Mata Pelajaran" }],
  "/admin/tahun-pelajaran":             [{ label: "Tahun Pelajaran" }, { label: "Kelola Tahun Pelajaran" }],
  "/admin/informasi/sejarah":           [{ label: "Informasi Sekolah" }, { label: "Sejarah" }],
  "/admin/informasi/visi-misi":         [{ label: "Informasi Sekolah" }, { label: "Visi Misi & Tujuan" }],
  "/admin/informasi/fasilitas":         [{ label: "Informasi Sekolah" }, { label: "Fasilitas" }],
  "/admin/informasi/kurikulum":         [{ label: "Informasi Sekolah" }, { label: "Kurikulum" }],
  "/admin/berita":                       [{ label: "Konten Website" }, { label: "Berita" }],
  "/admin/berita/tambah":               [{ label: "Konten Website" }, { label: "Berita", href: "/admin/berita" }, { label: "Tambah Berita" }],
  "/admin/prestasi":                     [{ label: "Konten Website" }, { label: "Prestasi" }],
  "/admin/ekstrakurikuler":             [{ label: "Konten Website" }, { label: "Ekstrakurikuler" }],
  "/admin/pmbm":                         [{ label: "Pengumuman PMBM" }],
  "/admin/pmbm/tambah":                 [{ label: "Pengumuman PMBM", href: "/admin/pmbm" }, { label: "Upload Pengumuman" }],
  "/admin/pengguna":                     [{ label: "Manajemen Pengguna" }],
  "/admin/pengaturan":                   [{ label: "Pengaturan" }],
};

function resolveCrumbs(pathname: string): Crumb[] {
  if (BREADCRUMBS[pathname]) return BREADCRUMBS[pathname];
  // Dynamic routes: edit
  if (pathname.includes("/edit")) {
    if (pathname.startsWith("/admin/berita"))          return [{ label: "Konten Website" }, { label: "Berita", href: "/admin/berita" }, { label: "Edit Berita" }];
  }
  return [{ label: "Admin Panel" }];
}

export default function Topbar({ user }: { user: any }) {
  const pathname = usePathname();
  const crumbs = resolveCrumbs(pathname);
  const pageTitle = crumbs[crumbs.length - 1].label;

  return (
    <header className="bg-white border-b border-gray-200 px-4 lg:px-6 h-14 flex items-center justify-between flex-shrink-0 pl-16 lg:pl-6">
      {/* Breadcrumb */}
      <div className="min-w-0">
        <div className="hidden sm:flex items-center gap-1.5 text-xs text-gray-400">
          <span>Admin</span>
          {crumbs.map((c, i) => (
            <span key={i} className="flex items-center gap-1.5">
              <ChevronRight className="w-3 h-3" />
              {c.href ? (
                <a href={c.href} className="hover:text-green-600 transition-colors">{c.label}</a>
              ) : (
                <span className={i === crumbs.length - 1 ? "text-gray-600 font-medium" : ""}>{c.label}</span>
              )}
            </span>
          ))}
        </div>
        <p className="text-sm font-bold text-gray-800 mt-0.5 truncate">{pageTitle}</p>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2 sm:gap-4 flex-shrink-0">
        <button className="relative p-2 text-gray-400 hover:text-gray-600 transition-colors">
          <Bell className="w-5 h-5" />
          <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
        </button>

        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
            <User className="w-4 h-4 text-green-700" />
          </div>
          <div className="hidden sm:block">
            <p className="text-xs font-semibold text-gray-700 leading-tight">{user?.name}</p>
            <p className="text-[10px] text-gray-400 leading-tight">Administrator</p>
          </div>
        </div>

        <form action={logoutAction}>
          <button className="flex items-center gap-1.5 text-xs text-red-500 hover:text-red-700 border border-red-200 hover:border-red-300 px-2.5 sm:px-3 py-1.5 rounded-lg transition-colors">
            <LogOut className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Keluar</span>
          </button>
        </form>
      </div>
    </header>
  );
}
