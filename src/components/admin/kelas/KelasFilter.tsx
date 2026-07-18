"use client";
import { useRouter, useSearchParams } from "next/navigation";
import { useCallback } from "react";
import { Search } from "lucide-react";

export default function KelasFilter({ tahunAjaran }: { tahunAjaran: any[] }) {
  const router = useRouter();
  const sp = useSearchParams();

  const update = useCallback((key: string, value: string) => {
    const params = new URLSearchParams(sp.toString());
    if (value) params.set(key, value); else params.delete(key);
    router.push(`/admin/data-kelas?${params.toString()}`);
  }, [router, sp]);

  return (
    <div className="flex flex-wrap gap-3 bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
      <div className="relative flex-1 min-w-48">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input defaultValue={sp.get("search") ?? ""}
          onChange={(e) => update("search", e.target.value)}
          placeholder="Cari nama kelas..."
          className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500" />
      </div>
      <select defaultValue={sp.get("tahunAjaranId") ?? ""}
        onChange={(e) => update("tahunAjaranId", e.target.value)}
        className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 bg-white">
        <option value="">Semua Tahun Ajaran</option>
        {tahunAjaran.map((ta) => <option key={ta.id} value={ta.id}>{ta.nama}</option>)}
      </select>
      <select defaultValue={sp.get("tingkat") ?? ""}
        onChange={(e) => update("tingkat", e.target.value)}
        className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 bg-white">
        <option value="">Semua Tingkat</option>
        <option value="7">Kelas 7</option>
        <option value="8">Kelas 8</option>
        <option value="9">Kelas 9</option>
      </select>
    </div>
  );
}