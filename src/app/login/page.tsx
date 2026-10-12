"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { signIn } from "next-auth/react";
import {
  Eye, EyeOff, User, Lock, ArrowRight, ArrowLeft, AlertTriangle,
} from "lucide-react";

// Foto latar halaman login (file ada di folder public/images).
// Mau ganti foto? Cukup ubah satu baris ini, mis. "/images/gedung-sekolah.jpg".
const FOTO_LATAR = "/images/depan.jpeg";

export default function LoginPage() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({ username: "", password: "", remember: false });

  const ROLE_REDIRECT: Record<string, string> = {
    ADMIN: "/admin/dashboard",
    GURU: "/guru/dashboard",
    ORANGTUA: "/orangtua/dashboard",
  };

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (!form.username || !form.password) {
      setError("Username dan password tidak boleh kosong.");
      return;
    }

    startTransition(async () => {
      const result = await signIn("credentials", {
        username: form.username,
        password: form.password,
        redirect: false,
      });

      if (result?.error) {
        setError("Username atau password salah. Silakan coba lagi.");
        return;
      }

      // Fetch session untuk tahu role
      const res = await fetch("/api/auth/session");
      const session = await res.json();
      const role = session?.user?.role;
      router.push(ROLE_REDIRECT[role] ?? "/");
      router.refresh();
    });
  }

  return (
    <main className="min-h-screen bg-green-950 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Foto sekolah sebagai latar */}
      <Image
        src={FOTO_LATAR}
        alt=""
        fill
        priority
        sizes="100vw"
        className="object-cover pointer-events-none select-none"
      />
      {/* Lapisan hijau gelap supaya kartu dan teks tetap jelas terbaca */}
      <div className="absolute inset-0 bg-gradient-to-br from-green-950/80 via-green-900/60 to-green-950/85 pointer-events-none" />

      {/* Card */}
      <div className="relative z-10 w-full max-w-[440px] bg-white/95 backdrop-blur-sm rounded-2xl shadow-2xl border border-white/30 p-8">

        {/* Kembali ke website sekolah */}
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-xs font-medium text-green-700 hover:text-green-900 mb-5 transition"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Kembali ke Beranda
        </Link>

        {/* Logo */}
        <div className="flex flex-col items-center mb-6">
          {/* <div className="w-16 h-16 bg-green-50 rounded-2xl flex items-center justify-center mb-3 border border-green-100">
            <Building2 className="w-8 h-8 text-green-800" />
          </div> */}
          <h1 className="font-serif text-xl font-semibold text-green-900 tracking-tight">
            MTS Al-Amin Bintaro
          </h1>
          <p className="text-xs text-green-700/70 text-center mt-1 max-w-[260px] leading-relaxed">
            Sistem Informasi Monitoring Proses Pembelajaran Siswa
          </p>
        </div>

        <div className="h-px bg-gray-100 mb-5" />

        {/* Error alert */}
        {error && (
          <div className="flex items-start gap-2 bg-red-50 border border-red-200 text-red-700 rounded-lg px-3 py-2.5 mb-4 text-sm">
            <AlertTriangle className="w-4 h-4 mt-0.5 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Username */}
          <div>
            <label className="block text-xs font-medium text-green-900 mb-1.5">
              Username
            </label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-green-600/60" />
              <input
                type="text"
                placeholder="Masukkan username"
                value={form.username}
                onChange={(e) => setForm({ ...form, username: e.target.value })}
                className="w-full h-11 pl-10 pr-4 border border-gray-200 rounded-lg text-sm bg-gray-50 focus:bg-white focus:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-500/20 transition"
                autoComplete="username"
                disabled={isPending}
              />
            </div>
          </div>

          {/* Password */}
          <div>
            <label className="block text-xs font-medium text-green-900 mb-1.5">
              Password
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-green-600/60" />
              <input
                type={showPw ? "text" : "password"}
                placeholder="Masukkan password"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                className="w-full h-11 pl-10 pr-10 border border-gray-200 rounded-lg text-sm bg-gray-50 focus:bg-white focus:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-500/20 transition"
                autoComplete="current-password"
                disabled={isPending}
              />
              <button
                type="button"
                onClick={() => setShowPw(!showPw)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                tabIndex={-1}
              >
                {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Remember me */}
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="remember"
              checked={form.remember}
              onChange={(e) => setForm({ ...form, remember: e.target.checked })}
              className="w-4 h-4 accent-green-700 cursor-pointer"
            />
            <label htmlFor="remember" className="text-sm text-gray-500 cursor-pointer">
              Ingat saya di perangkat ini
            </label>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={isPending}
            className="w-full h-11 bg-green-800 hover:bg-green-700 active:bg-green-900 disabled:opacity-60 text-white rounded-lg text-sm font-semibold flex items-center justify-center gap-2 transition"
          >
            {isPending ? (
              <>
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Memproses...
              </>
            ) : (
              <>
                Masuk
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        {/* Footer */}
        <p className="text-center text-xs text-gray-400 mt-6">
          &copy; 2026 MTS Al-Amin Bintaro. Hak Cipta Dilindungi.
        </p>
      </div>
    </main>
  );
}
