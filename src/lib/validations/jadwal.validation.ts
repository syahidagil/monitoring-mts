import { z } from "zod";
import { validasiRentangJam } from "@/lib/jadwal/jamPelajaran";

export const jadwalSchema = z
  .object({
    hari: z.enum(["SENIN", "SELASA", "RABU", "KAMIS", "JUMAT", "SABTU"], {
      error: () => "Pilih hari yang valid",
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
  .superRefine((d, ctx) => {
    // Jam harus sesuai tabel jam pelajaran pada hari tersebut
    // (lihat src/lib/jadwal/jamPelajaran.ts)
    const kesalahan = validasiRentangJam(d.hari, d.jamMulai, d.jamSelesai);
    if (kesalahan) {
      ctx.addIssue({ code: "custom", message: kesalahan.message, path: [kesalahan.field] });
    }
  });

export type JadwalFormValues = z.infer<typeof jadwalSchema>;