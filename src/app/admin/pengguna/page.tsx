import { prisma } from "@/lib/prisma";
import PenggunaClient from "./PenggunaClient";

export default async function PenggunaPage() {
  const users = await prisma.user.findMany({
    orderBy: { createdAt: "desc" },
    select: { id: true, username: true, name: true, role: true, status: true, createdAt: true },
  });
  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-xl font-bold text-gray-900">Manajemen Pengguna</h1>
        <p className="text-sm text-gray-500 mt-1">Kelola akun Admin, Guru, dan Orang Tua</p>
      </div>
      <PenggunaClient users={users} />
    </div>
  );
}
