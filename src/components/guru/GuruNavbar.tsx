"use client";
import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { logoutAction } from "@/actions/auth.action";
import {
  LayoutDashboard, Calendar, ClipboardCheck,
  Star, Heart, BookMarked, BookOpen,
  BarChart2, User, LogOut, GraduationCap, Menu, X
} from "lucide-react";

const NAV_ITEMS = [
  { label: "Dashboard",        href: "/guru/dashboard",  icon: LayoutDashboard },
  { label: "Jadwal Mengajar",  href: "/guru/jadwal",     icon: Calendar        },
  { label: "Input Absensi",    href: "/guru/absensi",    icon: ClipboardCheck  },
  { label: "Input Nilai Siswa",href: "/guru/nilai",      icon: Star            },
  { label: "Input Sikap Siswa",href: "/guru/sikap",      icon: Heart           },
  { label: "Input Hafalan",    href: "/guru/hafalan",    icon: BookMarked      },
  { label: "Input Tahsin",     href: "/guru/tahsin",     icon: BookOpen        },
  { label: "Rekap Monitoring", href: "/guru/rekap",      icon: BarChart2       },
  { label: "Profil Guru",      href: "/guru/profil",     icon: User            },
];

export default function GuruNavbar({ user }: { user: any }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  return (
    <>
      {/* Mobile overlay */}
      {open && (
        <div className="lg:hidden fixed inset-0 bg-black/40 z-30" onClick={() => setOpen(false)} />
      )}

      {/* Mobile toggle */}
      <button onClick={() => setOpen(!open)}
        className="lg:hidden fixed top-4 left-4 z-50 w-9 h-9 bg-[#1B5E20] text-white rounded-lg flex items-center justify-center shadow-lg">
        {open ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
      </button>

      {/* Sidebar */}
      <aside className={`fixed lg:static inset-y-0 left-0 z-40 w-56 bg-[#1B5E20] flex flex-col h-full transform transition-transform duration-200 ${open ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}`}>

        {/* Logo */}
        <div className="px-5 py-5 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-white rounded-lg flex items-center justify-center flex-shrink-0">
              <GraduationCap className="w-5 h-5 text-[#1B5E20]" />
            </div>
            <div>
              <p className="text-white font-bold text-sm leading-tight">MTS AL-AMIN</p>
              <p className="text-green-300 text-[10px] leading-tight tracking-widest">BINTARO</p>
            </div>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
          {NAV_ITEMS.map(({ label, href, icon: Icon }) => {
            const active = pathname.startsWith(href);
            return (
              <Link key={href} href={href} onClick={() => setOpen(false)}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all ${
                  active
                    ? "bg-white text-[#1B5E20] font-semibold shadow-sm"
                    : "text-green-100 hover:bg-white/10 hover:text-white"
                }`}>
                <Icon className="w-4 h-4 flex-shrink-0" />
                {label}
              </Link>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="px-4 py-4 border-t border-white/10 space-y-3">
          <div className="bg-white/10 rounded-xl px-3 py-3">
            <p className="text-green-300 text-[10px] font-semibold uppercase tracking-wider">Semester Aktif</p>
            <p className="text-white text-xs font-bold mt-0.5">Ganjil 2025/2026</p>
          </div>
          <form action={logoutAction}>
            <button className="w-full flex items-center gap-2.5 text-sm text-red-300 hover:text-red-200 hover:bg-red-900/20 px-3 py-2 rounded-lg transition-colors">
              <LogOut className="w-4 h-4 flex-shrink-0" />
              Logout
            </button>
          </form>
        </div>
      </aside>
    </>
  );
}