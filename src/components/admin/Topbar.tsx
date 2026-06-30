"use client";
import { usePathname } from "next/navigation";
import { logoutAction } from "@/actions/auth.action";
import { LogOut, Bell, User } from "lucide-react";

const BREADCRUMBS: Record<string, string> = {
  "/admin/dashboard": "Dashboard",
  "/admin/informasi/sejarah": "Informasi Sekolah > Sejarah",
  "/admin/informasi/visi-misi": "Informasi Sekolah > Visi Misi & Tujuan",
  "/admin/informasi/fasilitas": "Informasi Sekolah > Fasilitas",
  "/admin/informasi/kurikulum": "Informasi Sekolah > Kurikulum",
  "/admin/berita": "Konten Website > Berita",
  "/admin/prestasi": "Konten Website > Prestasi",
  "/admin/ekstrakurikuler": "Konten Website > Ekstrakurikuler",
  "/admin/pengguna": "Manajemen Pengguna",
  "/admin/pengaturan": "Pengaturan",
};

export default function Topbar({ user }: { user: any }) {
  const pathname = usePathname();
  const breadcrumb = BREADCRUMBS[pathname] ?? "Admin Panel";
  return (
    <header className="bg-white border-b border-gray-200 px-6 h-14 flex items-center justify-between flex-shrink-0">
      <div>
        <p className="text-xs text-gray-400">Admin Panel</p>
        <p className="text-sm font-semibold text-gray-700">{breadcrumb}</p>
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
