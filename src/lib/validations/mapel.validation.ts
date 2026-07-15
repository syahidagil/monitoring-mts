import { z } from "zod";

export const MapelSchema = z.object({
  kodeMapel: z.string().min(1, "Kode mapel wajib diisi").max(5, "Kode mapel maksimal 5 karakter").toUpperCase(),
  namaMapel: z.string().min(1, "Nama mapel wajib diisi").max(20),
});

export type MapelFormValues = z.infer<typeof MapelSchema>;