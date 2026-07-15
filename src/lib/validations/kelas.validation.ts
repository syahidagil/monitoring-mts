import { z } from "zod";

export const KelasSchema = z.object({
  nama: z.string().min(1, "Nama kelas wajib diisi").max(20),
  tingkat: z.coerce.number().min(7).max(9),
  tahunAjaranId: z.coerce.number({ required_error: "Tahun ajaran wajib dipilih" }).min(1),
  waliKelasId: z.string().optional(),
});

export type KelasFormValues = z.infer<typeof KelasSchema>;