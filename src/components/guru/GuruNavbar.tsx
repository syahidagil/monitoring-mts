"use client";
import { BarChart2, useState } from "react";
import Link from "next/link";
import { BarChart2, usePathname } from "next/navigation";
import { BarChart2, logoutAction } from "@/actions/auth.action";
import { BarChart2,
  LayoutDashboard, Calendar, ClipboardCheck,
  BookOpen, Heart, BookMarked, Star, LogOut, Menu, X
} from "lucide-react";

const NAV_ITEMS = [
  { label: "Dashboard",  href: "/guru/dashboard",  icon: LayoutDashboard  },
  { label: "Jadwal",     href: "/guru/jadwal",      icon: Calendar         },
  { label: "Absensi",    href: "/guru/absensi",     icon: ClipboardCheck   },
  { label: "Nilai",      href: "/guru/nilai",       icon: BookOpen         },
  { label: "Sikap",      href: "/guru/sikap",       icon: Heart            },
  { label: "Hafalan",    href: "/guru/hafalan",     icon: BookMarked       },
  { label: "Tahsin",     href: "/guru/tahsin",      icon: Star             },
  { label: "Rekap",      href: "/guru/rekap",       icon: BarChart2        },
];

export default function GuruNavbar({ user }: { user: any }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-[#1B5E20] shadow-md h-14">
      <div className="max-w-7xl mx-auto px-4 h-full flex items-center justify-between">
        <div className="flex items-center gap-6">
          <Link href="/guru/dashboard" className="text-white font-bold text-sm flex-shrink-0">
            MTS Al-Amin
          </Link>
          <div className="hidden lg:flex items-center gap-1">
            {NAV_ITEMS.map(({ label, href, icon: Icon }) => (
              <Link key={href} href={href}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                  pathname.startsWith(href)
                    ? "bg-white/20 text-white"
                    : "text-green-100 hover:bg-white/10 hover:text-white"
                }`}>
                <Icon className="w-3.5 h-3.5" />
                {label}
              </Link>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="hidden sm:block text-right">
            <p className="text-white text-xs font-semibold leading-tight">{user?.name}</p>
            <p className="text-green-300 text-[10px] leading-tight">Guru</p>
          </div>
          <form action={logoutAction}>
            <button className="flex items-center gap-1.5 text-xs text-white/80 hover:text-white border border-white/30 hover:border-white/60 px-3 py-1.5 rounded-lg transition-colors">
              <LogOut className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Keluar</span>
            </button>
          </form>
          <button className="lg:hidden text-white p-1.5" onClick={() => setOpen(!open)}>
            {open ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {open && (
        <div className="lg:hidden bg-[#1B5E20] border-t border-white/10 px-4 pb-4">
          {NAV_ITEMS.map(({ label, href, icon: Icon }) => (
            <Link key={href} href={href} onClick={() => setOpen(false)}
              className={`flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm transition-all ${
                pathname.startsWith(href)
                  ? "bg-white/20 text-white font-medium"
                  : "text-green-100 hover:bg-white/10 hover:text-white"
              }`}>
              <Icon className="w-4 h-4" />
              {label}
            </Link>
          ))}
        </div>
      )}
    </nav>
  );
}