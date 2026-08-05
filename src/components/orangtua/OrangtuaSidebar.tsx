"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { logoutAction } from "@/actions/auth.action";
import {
  LayoutDashboard, ClipboardCheck, BookOpen, Heart, BookMarked, Star,
  LogOut, Menu, X,
} from "lucide-react";

const NAV = [
  { label: "Dashboard", href: "/orangtua/dashboard", icon: LayoutDashboard },
  { label: "Absensi", href: "/orangtua/absensi", icon: ClipboardCheck },
  { label: "Nilai", href: "/orangtua/nilai", icon: BookOpen },
  { label: "Sikap", href: "/orangtua/sikap", icon: Heart },
  { label: "Hafalan", href: "/orangtua/hafalan", icon: BookMarked },
  { label: "Tahsin", href: "/orangtua/tahsin", icon: Star },
];

export default function OrangtuaSidebar({ user }: { user: { name?: string | null } }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setOpen(!open)}
        className="lg:hidden fixed top-4 left-4 z-50 w-9 h-9 bg-[#1B5E20] text-white rounded-lg flex items-center justify-center shadow-lg"
      >
        {open ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
      </button>

      {open && <div className="lg:hidden fixed inset-0 bg-black/40 z-30" onClick={() => setOpen(false)} />}

      <aside
        className={
          "fixed lg:static inset-y-0 left-0 z-40 w-60 bg-[#1B5E20] flex flex-col h-full transform transition-transform duration-200 " +
          (open ? "translate-x-0" : "-translate-x-full lg:translate-x-0")
        }
      >
        <div className="px-5 py-5 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="relative w-9 h-9 bg-white rounded-lg overflow-hidden flex-shrink-0">
              <Image
                src="/images/logo-mts.jpg"
                alt="Logo MTS Al-Amin"
                fill
                className="object-contain"
                priority
              />
            </div>
            <div>
              <p className="text-white font-bold text-sm leading-tight">MTS Al-Amin</p>
              <p className="text-green-300 text-[10px] leading-tight tracking-wide">PARENT PORTAL</p>
            </div>
          </div>
        </div>

        <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
          <p className="px-3 text-[10px] font-semibold text-green-300/70 uppercase tracking-wider mb-1">
            Menu Utama
          </p>
          {NAV.map(({ label, href, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              onClick={() => setOpen(false)}
              className={
                "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all " +
                (pathname.startsWith(href)
                  ? "bg-white/20 text-white font-semibold"
                  : "text-green-100 hover:bg-white/10 hover:text-white")
              }
            >
              <Icon className="w-4 h-4 flex-shrink-0" />
              {label}
            </Link>
          ))}
        </nav>

        <div className="px-4 py-4 border-t border-white/10">
          <div className="mb-3">
            <p className="text-white text-xs font-semibold truncate">{user?.name}</p>
            <p className="text-green-300 text-[10px]">Orang Tua / Wali</p>
          </div>
          <form action={logoutAction}>
            <button className="w-full flex items-center gap-2 text-xs text-white/70 hover:text-white border border-white/20 hover:border-white/40 px-3 py-2 rounded-lg transition-colors">
              <LogOut className="w-3.5 h-3.5" /> Keluar
            </button>
          </form>
        </div>
      </aside>
    </>
  );
}