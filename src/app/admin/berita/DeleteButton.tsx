"use client";
import { useState, useTransition } from "react";
import { Trash2 } from "lucide-react";
import { deleteSchoolInfo } from "@/actions/schoolInfo";

export default function DeleteButton({ idInfo }: { idInfo: number }) {
  const [isPending, startTransition] = useTransition();
  const [confirm, setConfirm] = useState(false);

  if (confirm) {
    return (
      <div className="flex items-center gap-1">
        <button onClick={() => startTransition(() => deleteSchoolInfo(idInfo))}
          className="text-xs text-white bg-red-500 hover:bg-red-600 px-2.5 py-1.5 rounded-lg transition-colors" disabled={isPending}>
          {isPending ? "..." : "Hapus"}
        </button>
        <button onClick={() => setConfirm(false)} className="text-xs text-gray-500 hover:text-gray-700 px-2.5 py-1.5 rounded-lg border border-gray-200">
          Batal
        </button>
      </div>
    );
  }

  return (
    <button onClick={() => setConfirm(true)}
      className="flex items-center gap-1 text-xs text-red-500 hover:text-red-600 border border-red-200 hover:border-red-300 px-2.5 py-1.5 rounded-lg transition-colors">
      <Trash2 className="w-3.5 h-3.5" /> Hapus
    </button>
  );
}
