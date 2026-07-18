import { z } from "zod";

export const TahunAjaranSchema = z.object({
  nama: z.string()
    .min(1, "Nama tahun ajaran wajib diisi")
    .regex(/^\d{4}\/\d{4}$/, "Format harus YYYY/YYYY (contoh: 2024/2025)"),
  semester: z.enum(["GANJIL","GENAP"], { required_error: "Semester wajib dipilih" }),
  aktif: z.boolean().default(false),
});

export type TahunAjaranFormValues = z.infer<typeof TahunAjaranSchema>;