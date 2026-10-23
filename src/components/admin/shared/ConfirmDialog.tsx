"use client";
import { useEffect } from "react";
import { AlertTriangle, HelpCircle, X } from "lucide-react";

type Props = {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void | Promise<void>;
  title: string;
  description: string;
  isLoading?: boolean;
  confirmLabel?: string;
  loadingLabel?: string;
  /** "danger" = merah (hapus), "primary" = hijau (aksi biasa) */
  variant?: "danger" | "primary";
};

export default function ConfirmDialog({
  isOpen,
  onClose,
  onConfirm,
  title,
  description,
  isLoading = false,
  confirmLabel = "Ya, Lanjutkan",
  loadingLabel = "Memproses...",
  variant = "primary",
}: Props) {
  // Escape menutup dialog (kecuali sedang memproses)
  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !isLoading) onClose();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [isOpen, isLoading, onClose]);

  if (!isOpen) return null;

  const danger = variant === "danger";
  const Icon = danger ? AlertTriangle : HelpCircle;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4" role="dialog" aria-modal="true">
      <div className="absolute inset-0 bg-black/50" onClick={() => { if (!isLoading) onClose(); }} />
      <div className="relative bg-white rounded-xl shadow-xl p-6 w-full max-w-md">
        <button type="button" onClick={onClose} disabled={isLoading} aria-label="Tutup"
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 disabled:opacity-50">
          <X className="w-5 h-5" />
        </button>
        <div className="flex items-center gap-3 mb-4">
          <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${danger ? "bg-red-100" : "bg-green-100"}`}>
            <Icon className={`w-5 h-5 ${danger ? "text-red-600" : "text-[#1B5E20]"}`} />
          </div>
          <h3 className={`text-base font-bold ${danger ? "text-red-700" : "text-gray-900"}`}>{title}</h3>
        </div>
        <p className="text-sm text-gray-600 mb-6 leading-relaxed">{description}</p>
        <div className="flex gap-3 justify-end">
          <button type="button" onClick={onClose} disabled={isLoading}
            className="px-5 py-2 text-sm text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50">
            Batal
          </button>
          <button type="button" onClick={() => { void onConfirm(); }} disabled={isLoading}
            className={`flex items-center gap-2 px-5 py-2 text-sm font-semibold text-white rounded-lg transition-colors disabled:opacity-60 ${
              danger ? "bg-red-600 hover:bg-red-700" : "bg-[#1B5E20] hover:bg-[#2E7D32]"
            }`}>
            {isLoading ? (
              <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />{loadingLabel}</>
            ) : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
