"use client";
import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  UserCheck,
  GraduationCap,
  Grid2x2,
  Calendar,
  BookOpen,
  Settings2,
  Info,
  ChevronDown,
  ChevronRight,
} from "lucide-react";

type MenuItem = {
  type: "single" | "accordion";
  label: string;
  href?: string;
  icon: any;
  children?: { label: string; href: string; disabled?: boolean; badge?: string }[];
};

const MENUS: MenuItem[] = [
  { type: "single", label: "Dashboard", href: "/admin/dashboard", icon: LayoutDashboard },
  {
    type: "accordion",
    label: "Data Siswa",
    icon: Users,
    children: [
      { label: "Input Data Siswa", href: "/admin/data-siswa/input" },
      { label: "View Data Siswa", href: "/admin/data-siswa" },
    ],
  },
  {
    type: "accordion",
    label: "Data Wali",
    icon: UserCheck,
    children: [
      { label: "Input Wali", href: "/admin/data-orangtua/input" },
      { label: "View Wali", href: "/admin/data-orangtua" },
    ],
  },
  {
    type: "accordion",
    label: "Data Guru",
    icon: GraduationCap,
    children: [
      { label: "Input Data Guru", href: "/admin/data-guru/input" },
      { label: "View Data Guru", href: "/admin/data-guru" },
    ],
  },
  {
    type: "accordion",
    label: "Data Kelas",
    icon: Grid2x2,
    children: [
      { label: "Input Data Kelas", href: "/admin/data-kelas/input" },
      { label: "View Data Kelas", href: "/admin/data-kelas" },
    ],
  },
  {
    type: "accordion",
    label: "Jadwal",
    icon: Calendar,
    children: [
      { label: "Input Jadwal", href: "#", disabled: true, badge: "Soon" },
      { label: "View Jadwal", href: "#", disabled: true, badge: "Soon" },
    ],
  },
  {
    type: "accordion",
    label: "Mata Pelajaran",
    icon: BookOpen,
    children: [
      { label: "Input Mata Pelajaran", href: "/admin/mata-pelajaran/input" },
      { label: "View Mata Pelajaran", href: "/admin/mata-pelajaran" },
    ],
  },
  {
    type: "accordion",
    label: "Kelola Semester",
    icon: Settings2,
    children: [
      { label: "Kelola Semester", href: "#", disabled: true, badge: "Soon" },
    ],
  },
  {
    type: "accordion",
    label: "Data Informasi Sekolah",
    icon: Info,
    children: [
      { label: "Sejarah", href: "/admin/informasi/sejarah" },
      { label: "Visi Misi", href: "/admin/informasi/visi-misi" },
      { label: "Berita", href: "/admin/berita" },
      { label: "Prestasi", href: "/admin/prestasi" },
      { label: "Fasilitas", href: "/admin/informasi/fasilitas" },
      { label: "Ekstrakurikuler", href: "/admin/ekstrakurikuler" },
      { label: "PSB", href: "/admin/pmbm" },
    ],
  },
];

export default function Sidebar() {
  const pathname = usePathname();
  const [openMenus, setOpenMenus] = useState<string[]>(
    MENUS.filter((menu) => menu.type === "accordion").map((menu) => menu.label)
  );

  const toggleMenu = (label: string) => {
    setOpenMenus((prev) =>
      prev.includes(label) ? prev.filter((m) => m !== label) : [...prev, label]
    );
  };

  const isActive = (href: string) => pathname === href;
  const isParentActive = (children: { href: string }[]) =>
    children.some((c) => c.href !== "#" && pathname.startsWith(c.href));

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
          if (menu.type === "single" && menu.href) {
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
                {isOpen
                  ? <ChevronDown className="w-3.5 h-3.5" />
                  : <ChevronRight className="w-3.5 h-3.5" />
                }
              </button>
              {isOpen && (
                <div className="ml-4 mt-0.5 space-y-0.5 border-l border-white/10 pl-3">
                  {menu.children?.map((child) => (
                    child.disabled ? (
                      <div
                        key={child.label}
                        className="flex items-center justify-between px-3 py-2 rounded-lg text-xs text-green-200/70 cursor-not-allowed"
                      >
                        <span>{child.label}</span>
                        {child.badge && (
                          <span className="rounded-full bg-white/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-green-100">
                            {child.badge}
                          </span>
                        )}
                      </div>
                    ) : (
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
                    )
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
