"use client";
import { useTransition } from "react";
import { setTahunAjaranAktif } from "@/actions/tahunAjaran.action";

export default function AktifToggle({ id, isAktif }: { id: number; isAktif: boolean }) {
  const [isPending, startTransition] = useTransition();

  function handleToggle() {
    if (isAktif) return;
    if (!confirm("Set tahun ajaran ini sebagai aktif? Tahun ajaran lain akan dinonaktifkan.")) return;
    startTransition(async () => { await setTahunAjaranAktif(id); });
  }

  return (
    <button
      type="button"
      onClick={handleToggle}
      disabled={isAktif || isPending}
      title={isAktif ? "Sudah aktif" : "Klik untuk aktifkan"}
      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${isAktif ? "bg-green-600 cursor-default" : "bg-gray-300 hover:bg-gray-400 cursor-pointer"} ${isPending ? "opacity-50" : ""}`}>
      <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${isAktif ? "translate-x-6" : "translate-x-1"}`} />
    </button>
  );
}