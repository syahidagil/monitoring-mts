import { z } from "zod";

export const SiswaSchema = z.object({
  nis: z.string().min(1, "NIS wajib diisi").max(20),
  nama: z.string().min(2, "Nama minimal 2 karakter").max(100),
  jenisKelamin: z.enum(["L", "P"], { required_error: "Jenis kelamin wajib dipilih" }),
  tanggalLahir: z.string().min(1, "Tanggal lahir wajib diisi"),
  tempatLahir: z.string().max(50).optional(),
  alamat: z.string().optional(),
  namaAyah: z.string().max(100).optional(),
  namaIbu: z.string().max(100).optional(),
  statusTahfidz: z.boolean().default(false),
  kelasId: z.coerce.number({ required_error: "Kelas wajib dipilih" }).min(1),
  orangTuaId: z.string().optional(),
  foto: z.string().optional(),
  status: z.boolean().default(true),
});

export type SiswaFormValues = z.infer<typeof SiswaSchema>;