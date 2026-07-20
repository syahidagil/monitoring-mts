import { z } from "zod";

export const jadwalSchema = z
  .object({
    hari: z.enum(["SENIN", "SELASA", "RABU", "KAMIS", "JUMAT", "SABTU"], {
      errorMap: () => ({ message: "Pilih hari yang valid" }),
    }),
    kodeMapel: z.string().min(1, "Pilih mata pelajaran"),
    jamMulai: z
      .string()
      .regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, "Format jam tidak valid (HH:MM)"),
    jamSelesai: z
      .string()
      .regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, "Format jam tidak valid (HH:MM)"),
    guruId: z.string().min(1, "Pilih guru pengampu"),
    kelasId: z.coerce.number().positive("Pilih kelas"),
    tahunAjaranId: z.coerce.number().positive("Pilih semester/tahun ajaran"),
  })
  .refine((d) => d.jamMulai < d.jamSelesai, {
    message: "Jam mulai harus lebih awal dari jam selesai",
    path: ["jamSelesai"],
  })
  .refine((d) => d.jamMulai >= "07:00" && d.jamMulai <= "16:00", {
    message: "Jam mulai harus dalam range 07:00 - 16:00",
    path: ["jamMulai"],
  })
  .refine((d) => d.jamSelesai >= "07:00" && d.jamSelesai <= "16:00", {
    message: "Jam selesai harus dalam range 07:00 - 16:00",
    path: ["jamSelesai"],
  });

export type JadwalFormValues = z.infer<typeof jadwalSchema>;