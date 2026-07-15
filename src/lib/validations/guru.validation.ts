import { z } from "zod";

export const GuruSchema = z.object({
  username: z.string().min(3, "Username minimal 3 karakter"),
  name: z.string().min(2, "Nama minimal 2 karakter"),
  password: z.string().min(6, "Password minimal 6 karakter").optional(),
  nip: z.string().max(20).optional(),
  mapel: z.string().min(1, "Mata pelajaran wajib diisi").max(100),
  noHp: z.string().max(20).optional(),
  alamat: z.string().optional(),
  pendidikan: z.string().max(100).optional(),
  status: z.boolean().default(true),
});

export type GuruFormValues = z.infer<typeof GuruSchema>;