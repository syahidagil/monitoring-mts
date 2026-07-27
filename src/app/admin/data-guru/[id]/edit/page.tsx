import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import GuruForm from "@/components/admin/guru/GuruForm";
import GuruMapelManager from "@/components/admin/guru/GuruMapelManager";

export default async function EditGuruPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [guru, allMapel] = await Promise.all([
    prisma.guru.findUnique({
      where: { id },
      include: {
        user: { select: { name: true, username: true, status: true } },
        guruMapel: { include: { mataPelajaran: true }, orderBy: { mataPelajaran: { namaMapel: "asc" } } },
      },
    }),
    prisma.mataPelajaran.findMany({ orderBy: { namaMapel: "asc" } }),
  ]);

  if (!guru) notFound();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-gray-900">Edit Data Guru</h1>
        <p className="text-sm text-gray-500 mt-1">Perbarui data guru: {guru.user.name}</p>
      </div>

      {/* Form data utama guru */}
      <GuruForm defaultValues={{ ...guru, ...guru.user }} isEdit guruId={guru.id} allMapel={allMapel} />

      {/* Kelola Mata Pelajaran Ampu */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="bg-gradient-to-r from-[#1B5E20] to-[#2E7D32] px-6 py-4 flex items-center justify-between">
          <div>
            <h2 className="text-white font-semibold text-sm">Mata Pelajaran yang Diampu</h2>
            <p className="text-green-300 text-xs mt-0.5">
              Assign mata pelajaran yang diajarkan oleh guru ini agar tidak muncul peringatan saat input jadwal
            </p>
          </div>
          <div className="bg-white/15 text-white text-xs font-bold px-3 py-1.5 rounded-full">
            {guru.guruMapel.length} Mapel
          </div>
        </div>

        <div className="p-6">
          {/* Preview daftar singkat */}
          {guru.guruMapel.length > 0 ? (
            <div className="flex flex-wrap gap-2 mb-5">
              {guru.guruMapel.map((gm) => (
                <span
                  key={gm.idGuruMapel}
                  className="inline-flex items-center gap-1.5 bg-green-50 text-green-700 border border-green-200 text-xs font-semibold px-3 py-1.5 rounded-full"
                >
                  <span className="w-1.5 h-1.5 bg-green-500 rounded-full" />
                  {gm.mataPelajaran.namaMapel}
                </span>
              ))}
            </div>
          ) : (
            <div className="flex items-center gap-3 bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 mb-5">
              <span className="text-amber-500 text-lg">⚠️</span>
              <p className="text-sm text-amber-700">
                Guru ini belum memiliki mata pelajaran ampu. Assign mata pelajaran agar tidak muncul peringatan saat input jadwal.
              </p>
            </div>
          )}

          <GuruMapelManager
            guruId={guru.id}
            guruNama={guru.user.name}
            guruMapel={guru.guruMapel}
            allMapel={allMapel}
          />
        </div>
      </div>
    </div>
  );
}