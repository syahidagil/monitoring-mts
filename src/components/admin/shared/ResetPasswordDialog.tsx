"use client";
import { useEffect, useRef, useState } from "react";
import { Eye, EyeOff, KeyRound, X } from "lucide-react";

type Props = {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (password: string) => Promise<void>;
  namaUser: string;
  isLoading: boolean;
};

const MIN_LENGTH = 6;

export default function ResetPasswordDialog({ isOpen, onClose, onSubmit, namaUser, isLoading }: Props) {
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  // Kosongkan isian setiap kali dialog dibuka
  useEffect(() => {
    if (!isOpen) return;
    setPassword("");
    setShowPw(false);
    setError("");
    const t = setTimeout(() => inputRef.current?.focus(), 0);
    return () => clearTimeout(t);
  }, [isOpen]);

  // Tombol Escape menutup dialog (kecuali sedang menyimpan)
  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !isLoading) onClose();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [isOpen, isLoading, onClose]);

  if (!isOpen) return null;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (password.length < MIN_LENGTH) {
      setError(`Password minimal ${MIN_LENGTH} karakter`);
      return;
    }
    setError("");
    await onSubmit(password);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50" onClick={() => { if (!isLoading) onClose(); }} />
      <form onSubmit={handleSubmit} className="relative bg-white rounded-xl shadow-xl p-6 w-full max-w-md">
        <button type="button" onClick={onClose} disabled={isLoading}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 disabled:opacity-50">
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
            <KeyRound className="w-5 h-5 text-[#1B5E20]" />
          </div>
          <h3 className="text-base font-bold text-gray-900">Reset Password</h3>
        </div>

        <p className="text-sm text-gray-600 mb-4 leading-relaxed">
          Masukkan password baru untuk <span className="font-semibold text-gray-800">{namaUser}</span>.
        </p>

        <label className="block text-sm font-medium text-gray-700 mb-1.5">
          Password Baru <span className="text-gray-400 font-normal">(min. {MIN_LENGTH} karakter)</span>
        </label>
        <div className="relative">
          <input
            ref={inputRef}
            type={showPw ? "text" : "password"}
            value={password}
            onChange={(e) => { setPassword(e.target.value); if (error) setError(""); }}
            disabled={isLoading}
            autoComplete="new-password"
            placeholder="Ketik password baru"
            className={`w-full border rounded-lg px-3 py-2.5 pr-10 text-sm focus:outline-none focus:ring-2 disabled:bg-gray-50 ${
              error ? "border-red-400 focus:ring-red-400" : "border-gray-300 focus:ring-green-500"
            }`}
          />
          <button type="button" onClick={() => setShowPw((v) => !v)} tabIndex={-1}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
            {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
        </div>
        {error && <p className="text-xs text-red-500 mt-1.5">{error}</p>}

        <div className="flex gap-3 justify-end mt-6">
          <button type="button" onClick={onClose} disabled={isLoading}
            className="px-5 py-2 text-sm text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50">
            Batal
          </button>
          <button type="submit" disabled={isLoading}
            className="flex items-center gap-2 px-5 py-2 text-sm font-semibold text-white bg-[#1B5E20] hover:bg-[#2E7D32] rounded-lg transition-colors disabled:opacity-60">
            {isLoading ? (
              <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />Menyimpan...</>
            ) : "Simpan Password"}
          </button>
        </div>
      </form>
    </div>
  );
}
