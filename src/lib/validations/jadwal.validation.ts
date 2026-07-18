import { z } from "zod";

export const JadwalSchema = z.object({
  kelasId: z.coerce.number({ required_error: "Kelas wajib dipilih" }).min(1, "Kelas wajib dipilih"),
  guruId: z.string().min(1, "Guru wajib dipilih"),
  mapel: z.string().min(1, "Mata pelajaran wajib diisi").max(100),
  hari: z.enum(["SENIN","SELASA","RABU","KAMIS","JUMAT","SABTU"], { required_error: "Hari wajib dipilih" }),
  jamMulai: z.string().regex(/^\d{2}:\d{2}$/, "Format jam tidak valid (HH:MM)"),
  jamSelesai: z.string().regex(/^\d{2}:\d{2}$/, "Format jam tidak valid (HH:MM)"),
}).refine((d) => d.jamMulai < d.jamSelesai, {
  message: "Jam selesai harus lebih besar dari jam mulai",
  path: ["jamSelesai"],
});

export type JadwalFormValues = z.infer<typeof JadwalSchema>;