"use client";
import { useState, useEffect } from "react";
import { Menu, X } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

// Diawali "/" supaya tetap berfungsi saat dibuka dari halaman lain (mis. /pmbm/pengumuman)
const NAV_LINKS = [
  { label: "Sejarah", href: "/#sejarah" },
  { label: "Visi Misi", href: "/#visi-misi" },
  { label: "Kurikulum", href: "/#kurikulum" },
  { label: "Prestasi", href: "/#prestasi" },
  { label: "Ekstrakurikuler", href: "/#ekstrakurikuler" },
];

const PMBM_HREF = "/pmbm/pengumuman";

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled ? "bg-[#1B5E20] shadow-md" : "bg-[#1B5E20]"}`}>
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">

          <Link href="/" className="flex items-center gap-2.5 flex-shrink-0">
            <div className="relative w-[45px] h-[45px] flex-shrink-0">
              <Image
                src="/images/logo-mts.jpg"
                alt="Logo MTS Al-Amin Bintaro"
                fill
                className="object-contain"
                priority
              />
            </div>
            <div>
              <p className="text-white font-bold text-sm leading-tight">MTS Al-Amin Bintaro</p>
              <p className="text-green-300 text-[10px] leading-tight tracking-widest">• HARUM •</p>
            </div>
          </Link>

          <div className="hidden lg:flex items-center gap-0">
            {NAV_LINKS.map((link) => (
              <a key={link.label} href={link.href}
                className="text-white/90 hover:text-white px-4 py-2 text-sm transition-colors">
                {link.label}
              </a>
            ))}
            <Link href={PMBM_HREF}
              className="text-white/90 hover:text-white px-4 py-2 text-sm transition-colors">
              PMBM
            </Link>
          </div>

          <div className="hidden lg:flex items-center gap-3">
            <Link href="/login"
              className="border border-white text-white hover:bg-white hover:text-[#1B5E20] text-sm font-semibold px-5 py-2 rounded-md transition-colors">
              Login
            </Link>
          </div>

          <button className="lg:hidden text-white p-2" onClick={() => setOpen(!open)} aria-label="Toggle menu">
            {open ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>

        {open && (
          <div className="lg:hidden pb-4 border-t border-white/20 pt-3">
            {NAV_LINKS.map((link) => (
              <a key={link.label} href={link.href} onClick={() => setOpen(false)}
                className="block text-white/90 hover:text-white py-2.5 px-2 text-sm">
                {link.label}
              </a>
            ))}
            <Link href={PMBM_HREF} onClick={() => setOpen(false)}
              className="block text-white/90 hover:text-white py-2.5 px-2 text-sm">
              PMBM
            </Link>

            <div className="flex gap-3 mt-3">
              <Link href="/login"
                className="flex-1 border border-white text-white text-sm font-semibold py-2 rounded-md text-center">
                Login
              </Link>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}