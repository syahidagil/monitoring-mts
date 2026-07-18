"use client";
import { useRouter, useSearchParams } from "next/navigation";
import { useCallback } from "react";
import { Search } from "lucide-react";

export default function MapelFilter() {
  const router = useRouter();
  const sp = useSearchParams();

  const update = useCallback((key: string, value: string) => {
    const params = new URLSearchParams(sp.toString());
    if (value) params.set(key, value); else params.delete(key);
    router.push(`/admin/mata-pelajaran?${params.toString()}`);
  }, [router, sp]);

  return (
    <div className="flex gap-3 bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input defaultValue={sp.get("search") ?? ""}
          onChange={(e) => update("search", e.target.value)}
          placeholder="Cari nama atau kode mapel..."
          className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500" />
      </div>
    </div>
  );
}