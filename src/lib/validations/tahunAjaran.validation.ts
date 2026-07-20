import { z } from "zod";

export const tahunAjaranSchema = z.object({
  nama: z
    .string()
    .min(1, "Nama tahun ajaran wajib diisi")
    .regex(/^\d{4}\/\d{4}$/, "Format harus YYYY/YYYY (contoh: 2025/2026)")
    .refine((val) => {
      const [t1, t2] = val.split("/").map(Number);
      return t2 === t1 + 1;
    }, "Tahun kedua harus tahun pertama + 1 (contoh: 2025/2026)"),
  semester: z.enum(["GANJIL", "GENAP"], {
    errorMap: () => ({ message: "Pilih semester Ganjil atau Genap" }),
  }),
});

export type TahunAjaranFormValues = z.infer<typeof tahunAjaranSchema>;