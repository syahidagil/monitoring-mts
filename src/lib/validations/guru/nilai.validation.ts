import { z } from "zod";

// 5 jenis penilaian yang dikelola guru (UH = HARIAN)
export const JENIS_NILAI = ["TUGAS", "HARIAN", "PR", "UTS", "UAS"] as const;
export type JenisNilaiInput = (typeof JENIS_NILAI)[number];

export const JENIS_LABEL: Record<JenisNilaiInput, string> = {
  TUGAS: "Tugas",
  HARIAN: "Ulangan Harian",
  PR: "PR",
  UTS: "UTS",
  UAS: "UAS",
};

// Satu baris nilai (dipakai saat edit tunggal)
export const nilaiRowSchema = z.object({
  nilai: z.coerce
    .number({ message: "Nilai harus angka" })
    .min(0, "Nilai minimal 0")
    .max(100, "Nilai maksimal 100"),
  keterangan: z.string().max(255).optional().or(z.literal("")),
});

// Batch (input massal per jenis)
export const nilaiBatchSchema = z.object({
  jadwalId: z.coerce.number().int().positive(),
  jenis: z.enum(JENIS_NILAI, { message: "Jenis penilaian tidak valid" }),
  tanggal: z.coerce.date({ message: "Tanggal tidak valid" }),
  keterangan: z.string().max(255).optional().or(z.literal("")),
});