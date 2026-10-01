"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import {
  nilaiBatchSchema,
  nilaiRowSchema,
  isJenisSekaliSemester,
  type JenisNilaiInput,
} from "@/lib/validations/guru/nilai.validation";
import type { JenisNilai, Semester } from "@prisma/client";

async function getGuruId() {
  const session = await auth();
  if (!session || session.user.role !== "GURU") return null;
  return session.user.id;
}

/**
 * Ambil jadwal + verifikasi kepemilikan + resolve guruMapelId.
 * guruMapelId wajib karena Nilai punya FK ke GuruMapel.
 */
async function resolveJadwal(jadwalId: number, guruId: string) {
  const jadwal = await prisma.jadwal.findUnique({
    where: { id: jadwalId },
    include: {
      kelas: {
        include: { siswa: { where: { status: true }, orderBy: { nama: "asc" } } },
      },
      mataPelajaran: { select: { kodeMapel: true, namaMapel: true } },
      tahunAjaran: { select: { nama: true, semester: true } },
    },
  });
  if (!jadwal || jadwal.guruId !== guruId) return null;

  const guruMapel = await prisma.guruMapel.findUnique({
    where: { idGuru_kodeMapel: { idGuru: guruId, kodeMapel: jadwal.kodeMapel } },
  });
  if (!guruMapel) return null;

  return { jadwal, guruMapelId: guruMapel.idGuruMapel };
}

/**
 * Data halaman input untuk satu jadwal + jenis + tanggal tertentu.
 *
 * - UTS/UAS (isJenisSekaliSemester): cuma boleh 1 nilai per siswa per semester,
 *   jadi `tanggal` DIABAIKAN saat mencari data yang sudah ada -> selalu ambil
 *   satu-satunya nilai yang ada (kalau ada), apa pun tanggalnya dulu diisi.
 * - Jenis lain (TUGAS/HARIAN/PR): boleh berkali-kali, jadi data yang tampil
 *   di-scope ke `tanggal` yang dipilih -> tanggal sama = edit, tanggal baru = kosong (entri baru).
 */
export async function getNilaiInput(
  jadwalId: number,
  jenis: JenisNilaiInput,
  tanggal: string
) {
  const guruId = await getGuruId();
  if (!guruId) return null;

  const resolved = await resolveJadwal(jadwalId, guruId);
  if (!resolved) return null;
  const { jadwal, guruMapelId } = resolved;

  const semester = jadwal.tahunAjaran?.semester ?? "GANJIL";
  const tahunAjar = jadwal.tahunAjaran?.nama ?? "";
  const sekaliSemester = isJenisSekaliSemester(jenis);

  const existing = await prisma.nilai.findMany({
    where: {
      guruMapelId,
      jenis: jenis as JenisNilai,
      semester: semester as Semester,
      tahunAjar,
      siswa: { kelasId: jadwal.kelasId },
      ...(sekaliSemester ? {} : { tanggal: new Date(tanggal) }),
    },
  });
  const byS = new Map(existing.map((n) => [n.siswaId, n]));

  return {
    jadwal: {
      id: jadwal.id,
      namaMapel: jadwal.mataPelajaran?.namaMapel ?? jadwal.kodeMapel,
      kelasNama: jadwal.kelas.nama,
      tahunAjar,
      semester,
    },
    guruMapelId,
    sekaliSemester,
    siswa: jadwal.kelas.siswa.map((s) => {
      const n = byS.get(s.id);
      return {
        id: s.id,
        nis: s.nis,
        nama: s.nama,
        nilaiId: n?.id ?? null,
        nilai: n ? Number(n.nilai) : null,
        keterangan: n?.keterangan ?? "",
        tanggal: n?.tanggal ?? null,
      };
    }),
  };
}

/**
 * Simpan massal. Untuk tiap siswa yang diisi:
 *   - UTS/UAS (sekali per semester): cari baris yang SUDAH ADA untuk siswa+jenis+semester
 *     ini TANPA memandang tanggal -> kalau ada, UPDATE baris itu (termasuk tanggalnya);
 *     kalau belum ada, baru CREATE.
 *   - Jenis lain (boleh berkali-kali): upsert berdasarkan (siswa, jenis, semester, tanggal)
 *     -> tanggal yang sama menimpa baris yang sama, tanggal baru bikin baris baru.
 */
export async function saveNilaiBatch(formData: FormData) {
  const guruId = await getGuruId();
  if (!guruId) return { success: false, message: "Tidak diizinkan" };

  const meta = nilaiBatchSchema.safeParse({
    jadwalId: formData.get("jadwalId"),
    jenis: formData.get("jenis"),
    tanggal: formData.get("tanggal"),
    keterangan: formData.get("keterangan") ?? "",
  });
  if (!meta.success) {
    return { success: false, message: meta.error.issues[0].message };
  }

  const resolved = await resolveJadwal(meta.data.jadwalId, guruId);
  if (!resolved) return { success: false, message: "Jadwal tidak valid" };
  const { jadwal, guruMapelId } = resolved;

  const semester = (jadwal.tahunAjaran?.semester ?? "GANJIL") as Semester;
  const tahunAjar = jadwal.tahunAjaran?.nama ?? "";
  const jenis = meta.data.jenis as JenisNilai;
  const tanggal = meta.data.tanggal;
  const ketBatch = meta.data.keterangan || null;
  const sekaliSemester = isJenisSekaliSemester(meta.data.jenis);

  // Kumpulkan input nilai_<siswaId>
  const rows: { siswaId: number; nilai: number }[] = [];
  for (const [key, val] of formData.entries()) {
    if (!key.startsWith("nilai_")) continue;
    const raw = String(val).trim();
    if (raw === "") continue; // kolom kosong dilewati
    const nilaiNum = Number(raw);
    if (Number.isNaN(nilaiNum) || nilaiNum < 0 || nilaiNum > 100) {
      return {
        success: false,
        message: `Nilai tidak valid (harus 0-100) pada salah satu siswa`,
      };
    }
    rows.push({ siswaId: Number(key.replace("nilai_", "")), nilai: nilaiNum });
  }

  if (rows.length === 0) {
    return { success: false, message: "Belum ada nilai yang diisi" };
  }

  // Pastikan semua siswa memang di kelas ini
  const validIds = new Set(jadwal.kelas.siswa.map((s) => s.id));
  const validRows = rows.filter((r) => validIds.has(r.siswaId));

  if (sekaliSemester) {
    // Cari baris yang sudah ada (tanpa memandang tanggal) untuk siswa-siswa ini.
    const existing = await prisma.nilai.findMany({
      where: {
        guruMapelId,
        jenis,
        semester,
        tahunAjar,
        siswaId: { in: validRows.map((r) => r.siswaId) },
      },
      select: { id: true, siswaId: true },
    });
    const existingBySiswa = new Map(existing.map((e) => [e.siswaId, e.id]));

    await prisma.$transaction(
      validRows.map((r) => {
        const existingId = existingBySiswa.get(r.siswaId);
        return existingId
          ? prisma.nilai.update({
              where: { id: existingId },
              data: { nilai: r.nilai, tanggal, keterangan: ketBatch },
            })
          : prisma.nilai.create({
              data: {
                siswaId: r.siswaId,
                guruId,
                guruMapelId,
                jenis,
                nilai: r.nilai,
                tanggal,
                semester,
                tahunAjar,
                keterangan: ketBatch,
              },
            });
      })
    );

    revalidatePath(`/guru/nilai/${meta.data.jadwalId}`);
    return {
      success: true,
      message: `${validRows.length} nilai ${jenis} berhasil disimpan (menimpa nilai lama jika ada)`,
    };
  }

  await prisma.$transaction(
    validRows.map((r) =>
        prisma.nilai.upsert({
          where: {
            siswaId_guruMapelId_jenis_semester_tahunAjar_tanggal: {
              siswaId: r.siswaId,
              guruMapelId,
              jenis,
              semester,
              tahunAjar,
              tanggal,
            },
          },
          create: {
            siswaId: r.siswaId,
            guruId,
            guruMapelId,
            jenis,
            nilai: r.nilai,
            tanggal,
            semester,
            tahunAjar,
            keterangan: ketBatch,
          },
          update: {
            nilai: r.nilai,
            keterangan: ketBatch,
          },
        })
      )
  );

  revalidatePath(`/guru/nilai/${meta.data.jadwalId}`);
  return {
    success: true,
    message: `${validRows.length} nilai ${jenis} berhasil disimpan untuk tanggal ini`,
  };
}

/** Riwayat seluruh nilai untuk jadwal ini (untuk tabel CRUD). */
export async function getRiwayatNilai(jadwalId: number) {
  const guruId = await getGuruId();
  if (!guruId) return null;

  const resolved = await resolveJadwal(jadwalId, guruId);
  if (!resolved) return null;
  const { jadwal, guruMapelId } = resolved;

  const rows = await prisma.nilai.findMany({
    where: { guruMapelId, siswa: { kelasId: jadwal.kelasId } },
    include: { siswa: { select: { nis: true, nama: true } } },
    orderBy: [{ jenis: "asc" }, { siswa: { nama: "asc" } }],
  });

  return rows.map((n) => ({
    id: n.id,
    nis: n.siswa.nis,
    nama: n.siswa.nama,
    jenis: n.jenis,
    nilai: Number(n.nilai),
    tanggal: n.tanggal,
    keterangan: n.keterangan ?? "",
  }));
}

/** Edit satu nilai. */
export async function updateNilai(id: number, formData: FormData) {
  const guruId = await getGuruId();
  if (!guruId) return { success: false, message: "Tidak diizinkan" };

  const parsed = nilaiRowSchema.safeParse({
    nilai: formData.get("nilai"),
    keterangan: formData.get("keterangan") ?? "",
  });
  if (!parsed.success) {
    return { success: false, message: parsed.error.issues[0].message };
  }

  const data = await prisma.nilai.findUnique({
    where: { id },
    select: { guruId: true },
  });
  if (!data) return { success: false, message: "Data tidak ditemukan" };
  if (data.guruId !== guruId) {
    return { success: false, message: "Bukan data Anda" };
  }

  await prisma.nilai.update({
    where: { id },
    data: {
      nilai: parsed.data.nilai,
      keterangan: parsed.data.keterangan || null,
    },
  });

  revalidatePath("/guru/nilai", "layout");
  return { success: true, message: "Nilai diperbarui" };
}

/** Hapus satu nilai. */
export async function deleteNilai(id: number) {
  const guruId = await getGuruId();
  if (!guruId) return { success: false, message: "Tidak diizinkan" };

  const data = await prisma.nilai.findUnique({
    where: { id },
    select: { guruId: true },
  });
  if (!data) return { success: false, message: "Data tidak ditemukan" };
  if (data.guruId !== guruId) {
    return { success: false, message: "Bukan data Anda" };
  }

  await prisma.nilai.delete({ where: { id } });
  revalidatePath("/guru/nilai", "layout");
  return { success: true, message: "Nilai dihapus" };
}