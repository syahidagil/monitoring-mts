import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";

function formatDate(date: Date) {
  return new Intl.DateTimeFormat("id-ID", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  }).format(date);
}

export default async function GuruProfilPage() {
  const session = await auth();
  if (!session || session.user.role !== "GURU") redirect("/login");

  const guru = await prisma.guru.findUnique({
    where: { id: session.user.id },
    include: {
      user: { select: { name: true, username: true, createdAt: true, status: true } },
      guruMapel: {
        include: {
          mataPelajaran: {
            select: { namaMapel: true, kodeMapel: true },
          },
        },
      },
      kelasWali: {
        select: { id: true, nama: true },
      },
      _count: {
        select: {
          jadwal: true,
          absensiDibuat: true,
          nilaiDibuat: true,
          sikapDibuat: true,
          hafalanDibuat: true,
          tahsinDibuat: true,
        },
      },
    },
  });

  if (!guru) {
    return (
      <main className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-xl border border-gray-200 p-8 text-center">
            <h1 className="text-lg font-bold text-gray-900">Profil guru belum tersedia</h1>
            <p className="text-sm text-gray-500 mt-2">
              Akun ini belum terhubung ke data guru. Silakan hubungi admin.
            </p>
          </div>
        </div>
      </main>
    );
  }

  const mapelAmpu = guru.guruMapel.map((item) => item.mataPelajaran);
  const waliKelasText =
    guru.kelasWali.length > 0
      ? guru.kelasWali.map((kelas) => `Kelas ${kelas.nama}`).join(", ")
      : "Belum menjadi wali kelas";

  return (
    <main className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="bg-white rounded-2xl border border-gray-200 p-6 md:p-7">
          <p className="text-xs font-semibold tracking-wider uppercase text-green-700">Profil Guru</p>
          <h1 className="text-2xl font-bold text-gray-900 mt-2">{guru.user.name}</h1>
          <div className="mt-4 flex flex-wrap items-center gap-2">
            <span className="text-xs font-medium px-3 py-1 rounded-full bg-gray-100 text-gray-700">
              Username: {guru.user.username}
            </span>
            <span
              className={`text-xs font-medium px-3 py-1 rounded-full ${
                guru.user.status ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
              }`}
            >
              {guru.user.status ? "Akun Aktif" : "Akun Nonaktif"}
            </span>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-3 lg:items-start">
          <section className="lg:col-span-2 bg-white rounded-2xl border border-gray-200 p-6">
            <h2 className="text-base font-bold text-gray-900">Informasi Pribadi</h2>
            <div className="mt-5 grid sm:grid-cols-2 gap-4">
              <div className="rounded-xl border border-gray-200 bg-gray-50 px-4 py-3">
                <p className="text-xs uppercase tracking-wide text-gray-500">NIP</p>
                <p className="mt-1 text-sm font-semibold text-gray-800">{guru.nip || "Belum diisi"}</p>
              </div>
              <div className="rounded-xl border border-gray-200 bg-gray-50 px-4 py-3">
                <p className="text-xs uppercase tracking-wide text-gray-500">No. HP</p>
                <p className="mt-1 text-sm font-semibold text-gray-800">{guru.noHp || "Belum diisi"}</p>
              </div>
              <div className="rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 sm:col-span-2">
                <p className="text-xs uppercase tracking-wide text-gray-500">Pendidikan Terakhir</p>
                <p className="mt-1 text-sm font-semibold text-gray-800">{guru.pendidikan || "Belum diisi"}</p>
              </div>
              <div className="rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 sm:col-span-2">
                <p className="text-xs uppercase tracking-wide text-gray-500">Alamat</p>
                <p className="mt-1 text-sm font-semibold text-gray-800 leading-relaxed">{guru.alamat || "Belum diisi"}</p>
              </div>
              <div className="rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 sm:col-span-2">
                <p className="text-xs uppercase tracking-wide text-gray-500">Terdaftar Sejak</p>
                <p className="mt-1 text-sm font-semibold text-gray-800">{formatDate(guru.user.createdAt)}</p>
              </div>
            </div>
          </section>

          <section className="bg-white rounded-2xl border border-gray-200 p-6 space-y-5">
            <div>
              <h2 className="text-base font-bold text-gray-900">Ringkasan Mengajar</h2>
              <p className="text-xs text-gray-500 mt-1">Rekap aktivitas akun guru</p>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-xl bg-green-50 border border-green-100 p-3">
                <p className="text-xs text-green-700">Jadwal</p>
                <p className="text-xl font-bold text-green-900 mt-1">{guru._count.jadwal}</p>
              </div>
              <div className="rounded-xl bg-blue-50 border border-blue-100 p-3">
                <p className="text-xs text-blue-700">Absensi</p>
                <p className="text-xl font-bold text-blue-900 mt-1">{guru._count.absensiDibuat}</p>
              </div>
              <div className="rounded-xl bg-amber-50 border border-amber-100 p-3">
                <p className="text-xs text-amber-700">Nilai</p>
                <p className="text-xl font-bold text-amber-900 mt-1">{guru._count.nilaiDibuat}</p>
              </div>
              <div className="rounded-xl bg-purple-50 border border-purple-100 p-3">
                <p className="text-xs text-purple-700">Sikap</p>
                <p className="text-xl font-bold text-purple-900 mt-1">{guru._count.sikapDibuat}</p>
              </div>
              <div className="rounded-xl bg-emerald-50 border border-emerald-100 p-3">
                <p className="text-xs text-emerald-700">Hafalan</p>
                <p className="text-xl font-bold text-emerald-900 mt-1">{guru._count.hafalanDibuat}</p>
              </div>
              <div className="rounded-xl bg-cyan-50 border border-cyan-100 p-3">
                <p className="text-xs text-cyan-700">Tahsin</p>
                <p className="text-xl font-bold text-cyan-900 mt-1">{guru._count.tahsinDibuat}</p>
              </div>
            </div>

            <div className="pt-1">
              <p className="text-xs uppercase tracking-wide text-gray-500 mb-2">Wali Kelas</p>
              <p className="text-sm font-semibold text-gray-800">{waliKelasText}</p>
            </div>
          </section>
        </div>

        <section className="bg-white rounded-2xl border border-gray-200 p-6">
          <h2 className="text-base font-bold text-gray-900">Mata Pelajaran Ampu</h2>
          {mapelAmpu.length === 0 ? (
            <p className="mt-3 text-sm text-gray-500">Belum ada mata pelajaran yang diampu.</p>
          ) : (
            <div className="mt-4 flex flex-wrap gap-2">
              {mapelAmpu.map((mapel) => (
                <span
                  key={mapel.kodeMapel}
                  className="inline-flex items-center rounded-lg border border-gray-200 bg-gray-50 px-3 py-1.5 text-sm text-gray-700"
                >
                  {mapel.namaMapel} ({mapel.kodeMapel})
                </span>
              ))}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
