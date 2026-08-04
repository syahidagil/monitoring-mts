"use client";
import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard, Building2, Newspaper, Users,
  Settings, ChevronDown, ChevronRight, GraduationCap,
  School, FileUp, Calendar, CalendarDays, BookOpen, Menu, X
} from "lucide-react";

type Child = { label: string; href: string };
type MenuItem = {
  label: string;
  href?: string;
  icon: any;
  children?: Child[];
};

const MENUS: MenuItem[] = [
  { label: "Dashboard", href: "/admin/dashboard", icon: LayoutDashboard },
  {
    label: "Data Akademik", icon: School,
    children: [
      { label: "Data Siswa",  href: "/admin/data-siswa" },
      { label: "Data Wali",   href: "/admin/data-orangtua" },
      { label: "Data Guru",   href: "/admin/data-guru" },
      { label: "Data Kelas",  href: "/admin/data-kelas" },
    ],
  },
  {
    label: "Jadwal", icon: Calendar,
    children: [
      { label: "Kelola Jadwal",  href: "/admin/jadwal" },
    ],
  },
  {
    label: "Mata Pelajaran", icon: BookOpen,
    children: [
      { label: "Daftar Mata Pelajaran", href: "/admin/mata-pelajaran" },
    ],
  },
  {
    label: "Tahun Pelajaran", icon: CalendarDays,
    children: [
      { label: "Kelola Tahun Pelajaran", href: "/admin/tahun-pelajaran" },
    ],
  },
  {
    label: "Informasi Sekolah", icon: Building2,
    children: [
      { label: "Sejarah",            href: "/admin/informasi/sejarah" },
      { label: "Visi Misi & Tujuan", href: "/admin/informasi/visi-misi" },
      { label: "Fasilitas",          href: "/admin/informasi/fasilitas" },
      { label: "Kurikulum",          href: "/admin/informasi/kurikulum" },
    ],
  },
  {
    label: "Konten Website", icon: Newspaper,
    children: [
      { label: "Berita",          href: "/admin/berita" },
      { label: "Prestasi",        href: "/admin/prestasi" },
      { label: "Ekstrakurikuler", href: "/admin/ekstrakurikuler" },
    ],
  },
  { label: "Pengumuman PMBM",    href: "/admin/pmbm",      icon: FileUp },
  { label: "Manajemen Pengguna", href: "/admin/pengguna",  icon: Users },
  { label: "Pengaturan",         href: "/admin/pengaturan", icon: Settings },
];

export default function Sidebar() {
  const pathname = usePathname();

  const isChildActive = (href: string) => {
    if (pathname === href) return true;
    if (!href.endsWith("/input") && pathname.startsWith(href + "/")) return true;
    return false;
  };

  const defaultOpen = MENUS
    .filter((m) => m.children?.some((c) => isChildActive(c.href)))
    .map((m) => m.label);

  const [openMenus, setOpenMenus] = useState<string[]>(
    defaultOpen.length > 0 ? defaultOpen : ["Data Akademik"]
  );

  const toggle = (label: string) =>
    setOpenMenus((prev) =>
      prev.includes(label) ? prev.filter((m) => m !== label) : [...prev, label]
    );

  const isActive = (href: string) => pathname === href;
  const isParentActive = (children: Child[]) =>
    children.some((c) => isChildActive(c.href));

  const [open, setOpen] = useState(false);

  return (
    <>
      {/* Mobile overlay */}
      {open && (
        <div className="lg:hidden fixed inset-0 bg-black/40 z-30" onClick={() => setOpen(false)} />
      )}

      {/* Mobile toggle */}
      <button
        onClick={() => setOpen(!open)}
        className="lg:hidden fixed top-4 left-4 z-50 w-9 h-9 bg-[#1B5E20] text-white rounded-lg flex items-center justify-center shadow-lg"
      >
        {open ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
      </button>

      <aside
        className={`fixed lg:static inset-y-0 left-0 z-40 w-64 bg-[#1B5E20] flex flex-col h-full flex-shrink-0 transform transition-transform duration-200 ${
          open ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        }`}
      >
      {/* Logo */}
      <div className="px-5 py-5 border-b border-white/10">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-white rounded-lg flex items-center justify-center flex-shrink-0">
            <GraduationCap className="w-5 h-5 text-[#1B5E20]" />
          </div>
          <div>
            <p className="text-white font-bold text-sm leading-tight">MTS Al-Amin</p>
            <p className="text-green-300 text-[10px] leading-tight">Panel Admin</p>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 overflow-y-auto space-y-0.5 scrollbar-thin scrollbar-thumb-white/10">
        {MENUS.map((menu) => {
          /* ── Item tanpa children ── */
          if (menu.href) {
            return (
              <Link
                key={menu.label}
                href={menu.href}
                onClick={() => setOpen(false)}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all ${
                  isActive(menu.href)
                    ? "bg-white/20 text-white font-semibold"
                    : "text-green-100 hover:bg-white/10 hover:text-white"
                }`}
              >
                <menu.icon className="w-4 h-4 flex-shrink-0" />
                {menu.label}
              </Link>
            );
          }

          /* ── Item dengan children ── */
          const isOpen   = openMenus.includes(menu.label);
          const parentOk = isParentActive(menu.children ?? []);

          return (
            <div key={menu.label}>
              <button
                onClick={() => toggle(menu.label)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all ${
                  parentOk
                    ? "bg-white/10 text-white font-semibold"
                    : "text-green-100 hover:bg-white/10 hover:text-white"
                }`}
              >
                <menu.icon className="w-4 h-4 flex-shrink-0" />
                <span className="flex-1 text-left">{menu.label}</span>
                {isOpen
                  ? <ChevronDown  className="w-3.5 h-3.5 opacity-70" />
                  : <ChevronRight className="w-3.5 h-3.5 opacity-70" />}
              </button>

              {isOpen && (
                <div className="ml-4 mt-0.5 space-y-0.5 border-l border-white/10 pl-3">
                  {menu.children?.map((child) => (
                    <Link
                      key={child.href}
                      href={child.href}
                      onClick={() => setOpen(false)}
                      className={`block px-3 py-2 rounded-lg text-xs transition-all ${
                        isChildActive(child.href)
                          ? "bg-white/20 text-white font-semibold"
                          : "text-green-200 hover:bg-white/10 hover:text-white"
                      }`}
                    >
                      {child.label}
                    </Link>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="px-5 py-4 border-t border-white/10">
        <p className="text-green-400 text-xs text-center">v1.0.0 • 2026</p>
      </div>
      </aside>
    </>
  );
}
