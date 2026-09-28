import { z } from "zod";

// Selaras dengan model Hafalan pada skema terbaru:
//   juz, surat, nomorSurat, ayatMulai, ayatSelesai, halaman, nilai (enum L | L_MIN), keterangan
export const hafalanSchema = z
  .object({
    siswaId:     z.coerce.number().int().positive(),
    nomorSurat:  z.coerce.number().int().min(1).max(114), // untuk validasi & isi nama surat
    surat:       z.string().min(1, "Nama surat wajib diisi").max(100),
    juz:         z.coerce.number().int().min(1, "Juz tidak valid").max(30),
    ayatMulai:   z.coerce.number().int().min(1, "Ayat mulai tidak valid"),
    ayatSelesai: z.coerce.number().int().min(1, "Ayat selesai tidak valid"),
    halaman:     z.coerce.number().int().min(1, "Halaman minimal 1").max(604, "Halaman maksimal 604"),
    nilai:       z.enum(["L", "L_MIN"], { message: "Nilai wajib dipilih (L atau L-)" }),
    keterangan:  z.string().max(500).optional().or(z.literal("")),
  })
  .refine((d) => d.ayatSelesai >= d.ayatMulai, {
    message: "Ayat selesai tidak boleh lebih kecil dari ayat mulai",
    path: ["ayatSelesai"],
  });

export type HafalanFormValues = z.infer<typeof hafalanSchema>;