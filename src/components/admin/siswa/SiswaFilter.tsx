"use client";
import { useRouter, useSearchParams } from "next/navigation";
import { useCallback } from "react";
import { Search } from "lucide-react";

export default function SiswaFilter({ kelas }: { kelas: any[] }) {
  const router = useRouter();
  const sp = useSearchParams();

  const update = useCallback((key: string, value: string) => {
    const params = new URLSearchParams(sp.toString());
    if (value) params.set(key, value);
    else params.delete(key);
    params.delete("page");
    router.push(`/admin/data-siswa?${params.toString()}`);
  }, [router, sp]);

  return (
    <div className="flex flex-wrap gap-3 bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
      <div className="relative flex-1 min-w-48">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input defaultValue={sp.get("search") ?? ""}
          onChange={(e) => update("search", e.target.value)}
          placeholder="Cari nama atau NIS..."
          className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500" />
      </div>
      <select defaultValue={sp.get("kelasId") ?? ""}
        onChange={(e) => update("kelasId", e.target.value)}
        className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 bg-white">
        <option value="">Semua Kelas</option>
        {kelas.map((k) => <option key={k.id} value={k.id}>Kelas {k.nama}</option>)}
      </select>
      <select defaultValue={sp.get("statusTahfidz") ?? ""}
        onChange={(e) => update("statusTahfidz", e.target.value)}
        className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 bg-white">
        <option value="">Semua Status Tahfidz</option>
        <option value="true">Aktif Tahfidz</option>
        <option value="false">Tidak Tahfidz</option>
      </select>
    </div>
  );
}