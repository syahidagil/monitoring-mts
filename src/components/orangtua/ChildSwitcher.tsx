"use client";

import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { User } from "lucide-react";

type Anak = { id: number; nama: string; kelasNama: string };

export default function ChildSwitcher({
  anakList,
  aktifId,
}: {
  anakList: Anak[];
  aktifId: number;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const sp = useSearchParams();

  if (anakList.length <= 1) return null;

  function ganti(id: string) {
    const params = new URLSearchParams(sp.toString());
    params.set("siswaId", id);
    router.push(`${pathname}?${params.toString()}`);
  }

  return (
    <div className="flex items-center gap-2 bg-white border border-gray-200 rounded-xl px-3 py-2 shadow-sm">
      <User size={15} className="text-gray-400" />
      <select
        value={aktifId}
        onChange={(e) => ganti(e.target.value)}
        className="text-sm bg-transparent outline-none font-medium text-gray-700"
      >
        {anakList.map((a) => (
          <option key={a.id} value={a.id}>
            {a.nama} — {a.kelasNama}
          </option>
        ))}
      </select>
    </div>
  );
}