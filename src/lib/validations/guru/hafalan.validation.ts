import { z } from "zod";

export const hafalanSchema = z.object({
  siswaId:     z.number().positive(),
  surah:       z.string().min(1, "Nama surah wajib diisi").max(50),
  ayatMulai:   z.coerce.number().min(1),
  ayatSelesai: z.coerce.number().min(1),
  juz:         z.coerce.number().min(1).max(30).optional(),
  nilai:       z.coerce.number().min(0).max(100).optional(),
  status:      z.enum(["BELUM","PROSES","LULUS","MENGULANG"]),
  catatan:     z.string().max(500).optional(),
}).refine((d) => d.ayatSelesai >= d.ayatMulai, {
  message: "Ayat selesai harus >= ayat mulai",
  path: ["ayatSelesai"],
});

export type HafalanFormValues = z.infer<typeof hafalanSchema>;