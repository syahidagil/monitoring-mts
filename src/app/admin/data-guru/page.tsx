import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { Plus, Edit, Trash2 } from "lucide-react";
import GuruTable from "@/components/admin/guru/GuruTable";

export default async function DataGuruPage() {
  const guru = await prisma.guru.findMany({
    include: { user: { select: { name: true, username: true, status: true } } },
    orderBy: { user: { name: "asc" } },
  });
  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Data Guru</h1>
          <p className="text-sm text-gray-500 mt-1">{guru.length} guru terdaftar</p>
        </div>
        <Link href="/admin/data-guru/input"
          className="flex items-center gap-2 bg-[#1B5E20] hover:bg-[#2E7D32] text-white text-sm font-semibold px-4 py-2.5 rounded-lg transition-colors">
          <Plus className="w-4 h-4" /> Tambah Guru
        </Link>
      </div>
      <GuruTable data={guru} />
    </div>
  );
}