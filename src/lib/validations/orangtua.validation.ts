import { z } from "zod";

export const OrangtuaSchema = z.object({
  username: z.string().min(3, "Username minimal 3 karakter"),
  name: z.string().min(2, "Nama minimal 2 karakter"),
  password: z.string().min(6, "Password minimal 6 karakter").optional(),
  noHp: z.string().max(20).optional(),
  alamat: z.string().optional(),
  pekerjaan: z.string().max(100).optional(),
  status: z.boolean().default(true),
});

export type OrangtuaFormValues = z.infer<typeof OrangtuaSchema>;