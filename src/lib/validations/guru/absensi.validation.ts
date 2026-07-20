import { z } from "zod";

export const absensiSiswaSchema = z.object({
  siswaId:   z.number().positive(),
  jadwalId:  z.number().positive(),
  tanggal:   z.string().min(1, "Tanggal wajib diisi"),
  status:    z.enum(["HADIR","SAKIT","IZIN","ALPHA"], {
    errorMap: () => ({ message: "Status absensi tidak valid" }),
  }),
  keterangan: z.string().max(255).optional(),
});

export const absensiKelasSchema = z.object({
  jadwalId: z.number().positive(),
  tanggal:  z.string().min(1, "Tanggal wajib diisi"),
  siswaList: z.array(z.object({
    siswaId:    z.number().positive(),
    status:     z.enum(["HADIR","SAKIT","IZIN","ALPHA"]),
    keterangan: z.string().max(255).optional(),
  })).min(1, "Minimal 1 siswa"),
});

export type AbsensiSiswa  = z.infer<typeof absensiSiswaSchema>;
export type AbsensiKelas  = z.infer<typeof absensiKelasSchema>;