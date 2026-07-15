"use client";
import { useState, useTransition } from "react";
import { Trash2 } from "lucide-react";
import { deletePengumuman } from "@/actions/pmbm";

export default function DeletePmbmButton({ id }: { id: number }) {
  const [isPending, startTransition] = useTransition();
  const [confirm, setConfirm] = useState(false);

  if (confirm) {
    return (
      <div className="flex items-center gap-1">
        <button onClick={() => startTransition(() => deletePengumuman(id))}
          disabled={isPending}
          className="text-xs text-white bg-red-500 hover:bg-red-600 px-2.5 py-1.5 rounded-lg transition-colors">
          {isPending ? "..." : "Hapus"}
        </button>
        <button onClick={() => setConfirm(false)}
          className="text-xs text-gray-500 border border-gray-200 px-2.5 py-1.5 rounded-lg">
          Batal
        </button>
      </div>
    );
  }

  return (
    <button onClick={() => setConfirm(true)}
      className="flex items-center gap-1 text-xs text-red-500 border border-red-200 px-2.5 py-1.5 rounded-lg hover:bg-red-50 transition-colors">
      <Trash2 className="w-3.5 h-3.5" /> Hapus
    </button>
  );
}
