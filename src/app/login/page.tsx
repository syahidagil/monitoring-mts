"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import {
  Eye, EyeOff, User, Lock, ArrowRight, AlertTriangle, Building2,
} from "lucide-react";

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
    <main className="min-h-screen bg-[#F3F4F6] flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background ilustrasi gedung */}
      <div className="absolute inset-0 flex items-end justify-center opacity-[0.04] pointer-events-none select-none">
        <svg viewBox="0 0 800 300" className="w-full max-w-3xl">
          <rect x="330" y="80" width="140" height="220" fill="#1B5E20" />
          <polygon points="400,10 290,80 510,80" fill="#1B5E20" />
          <rect x="370" y="160" width="60" height="140" fill="#0D3B12" />
          <circle cx="400" cy="45" r="14" fill="#1B5E20" />
          <rect x="80" y="130" width="100" height="170" fill="#1B5E20" />
          <polygon points="130,75 60,130 200,130" fill="#1B5E20" />
          <rect x="100" y="190" width="60" height="110" fill="#0D3B12" />
          <rect x="580" y="130" width="100" height="170" fill="#1B5E20" />
          <polygon points="630,75 560,130 700,130" fill="#1B5E20" />
          <rect x="600" y="190" width="60" height="110" fill="#0D3B12" />
        </svg>
      </div>

      {/* Card */}
      <div className="relative z-10 w-full max-w-[440px] bg-white rounded-2xl shadow-md border border-gray-100 p-8">
        
        {/* Logo */}
        <div className="flex flex-col items-center mb-6">
          <div className="w-16 h-16 bg-green-50 rounded-2xl flex items-center justify-center mb-3 border border-green-100">
            <Building2 className="w-8 h-8 text-green-800" />
          </div>
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
          © 2026 MTS Al-Amin Bintaro. Hak Cipta Dilindungi.
        </p>
      </div>
    </main>
  );
}