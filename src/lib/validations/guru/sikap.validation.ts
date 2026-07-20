import { z } from "zod";

export const sikapSchema = z.object({
  siswaId:   z.number().positive("Siswa wajib dipilih"),
  aspek:     z.string().min(1, "Aspek wajib diisi").max(100),
  predikat:  z.enum(["SB","B","C","K"], {
    errorMap: () => ({ message: "Pilih predikat yang valid" }),
  }),
  deskripsi: z.string().max(500).optional(),
  semester:  z.enum(["GANJIL","GENAP"]),
  tahunAjar: z.string().min(1),
});

export type SikapFormValues = z.infer<typeof sikapSchema>;