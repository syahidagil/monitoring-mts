import { z } from "zod";

export const tahsinSchema = z.object({
  siswaId:  z.number().positive(),
  materi:   z.string().min(1, "Materi wajib diisi").max(100),
  nilai:    z.coerce.number().min(0).max(100).optional(),
  status:   z.enum(["BELUM","PROSES","LULUS","MENGULANG"]),
  catatan:  z.string().max(500).optional(),
});

export type TahsinFormValues = z.infer<typeof tahsinSchema>;