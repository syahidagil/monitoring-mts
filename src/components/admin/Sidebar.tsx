"use client";
import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard, BookOpen, Building2, Target, Wrench,
  BookMarked, Newspaper, Trophy, Users, Settings,
  ChevronDown, ChevronRight, GraduationCap
} from "lucide-react";

type MenuItem = {
  label: string;
  href?: string;
  icon: any;
  children?: { label: string; href: string }[];
};

const MENUS: MenuItem[] = [
  { label: "Dashboard", href: "/admin/dashboard", icon: LayoutDashboard },
  {
    label: "Informasi Sekolah", icon: Building2,
    children: [
      { label: "Sejarah", href: "/admin/informasi/sejarah" },
      { label: "Visi Misi & Tujuan", href: "/admin/informasi/visi-misi" },
      { label: "Fasilitas", href: "/admin/informasi/fasilitas" },
      { label: "Kurikulum", href: "/admin/informasi/kurikulum" },
    ],
  },
  {
    label: "Konten Website", icon: Newspaper,
    children: [
      { label: "Berita", href: "/admin/berita" },
      { label: "Prestasi", href: "/admin/prestasi" },
      { label: "Ekstrakurikuler", href: "/admin/ekstrakurikuler" },
    ],
  },
  { label: "Manajemen Pengguna", href: "/admin/pengguna", icon: Users },
  { label: "Pengaturan", href: "/admin/pengaturan", icon: Settings },
];

export default function Sidebar() {
  const pathname = usePathname();
  const [openMenus, setOpenMenus] = useState<string[]>(["Informasi Sekolah", "Konten Website"]);

  const toggleMenu = (label: string) => {
    setOpenMenus((prev) =>
      prev.includes(label) ? prev.filter((m) => m !== label) : [...prev, label]
    );
  };

  const isActive = (href: string) => pathname === href;
  const isParentActive = (children: { href: string }[]) =>
    children.some((c) => pathname.startsWith(c.href));

  return (
    <aside className="w-64 bg-[#1B5E20] flex flex-col h-full flex-shrink-0">
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
      <nav className="flex-1 px-3 py-4 overflow-y-auto space-y-0.5">
        {MENUS.map((menu) => {
          if (menu.href) {
            return (
              <Link
                key={menu.label}
                href={menu.href}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all ${
                  isActive(menu.href)
                    ? "bg-white/20 text-white font-medium"
                    : "text-green-100 hover:bg-white/10 hover:text-white"
                }`}
              >
                <menu.icon className="w-4 h-4 flex-shrink-0" />
                {menu.label}
              </Link>
            );
          }
          const isOpen = openMenus.includes(menu.label);
          const parentActive = isParentActive(menu.children ?? []);
          return (
            <div key={menu.label}>
              <button
                onClick={() => toggleMenu(menu.label)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all ${
                  parentActive
                    ? "bg-white/10 text-white font-medium"
                    : "text-green-100 hover:bg-white/10 hover:text-white"
                }`}
              >
                <menu.icon className="w-4 h-4 flex-shrink-0" />
                <span className="flex-1 text-left">{menu.label}</span>
                {isOpen ? (
                  <ChevronDown className="w-3.5 h-3.5" />
                ) : (
                  <ChevronRight className="w-3.5 h-3.5" />
                )}
              </button>
              {isOpen && (
                <div className="ml-4 mt-0.5 space-y-0.5 border-l border-white/10 pl-3">
                  {menu.children?.map((child) => (
                    <Link
                      key={child.href}
                      href={child.href}
                      className={`block px-3 py-2 rounded-lg text-xs transition-all ${
                        isActive(child.href)
                          ? "bg-white/20 text-white font-medium"
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
      <div className="px-5 py-4 border-t border-white/10">
        <p className="text-green-400 text-xs text-center">v1.0.0 • 2026</p>
      </div>
    </aside>
  );
}
