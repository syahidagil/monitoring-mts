import { z } from "zod";

export const nilaiSiswaSchema = z.object({
  siswaId:    z.number().positive(),
  guruId:     z.string().min(1),
  mapel:      z.string().min(1),
  jenis:      z.enum(["HARIAN","UTS","UAS","TUGAS","PRAKTIK"]),
  nilai:      z.coerce.number().min(0).max(100, "Nilai maksimal 100"),
  semester:   z.enum(["GANJIL","GENAP"]),
  tahunAjar:  z.string().min(1),
  keterangan: z.string().max(255).optional(),
});

export const nilaiKelasSchema = z.object({
  guruId:    z.string().min(1),
  mapel:     z.string().min(1),
  jenis:     z.enum(["HARIAN","UTS","UAS","TUGAS","PRAKTIK"]),
  semester:  z.enum(["GANJIL","GENAP"]),
  tahunAjar: z.string().min(1),
  nilaiList: z.array(z.object({
    siswaId:    z.number().positive(),
    nilai:      z.coerce.number().min(0).max(100),
    keterangan: z.string().max(255).optional(),
  })).min(1),
});

export type NilaiSiswa = z.infer<typeof nilaiSiswaSchema>;
export type NilaiKelas = z.infer<typeof nilaiKelasSchema>;