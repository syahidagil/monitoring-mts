import { z } from "zod";

// Selaras dengan model Tahsin skema terbaru:
//   juz, surat, halaman, tajwid, makhraj, sifatul (enum L | L_MIN), keterangan, tanggal
const nilaiAspek = z.enum(["L", "L_MIN"], { message: "Nilai aspek wajib dipilih" });

export const tahsinSchema = z.object({
  siswaId:    z.coerce.number().int().positive(),
  nomorSurat: z.coerce.number().int().min(1).max(114),
  surat:      z.string().min(1, "Nama surat wajib diisi").max(100),
  juz:        z.coerce.number().int().min(1, "Juz tidak valid").max(30),
  halaman:    z.coerce.number().int().min(1, "Halaman minimal 1").max(604, "Halaman maksimal 604"),
  tajwid:     nilaiAspek,
  makhraj:    nilaiAspek,
  sifatul:    nilaiAspek,
  tanggal:    z.coerce.date({ message: "Tanggal tidak valid" }),
  keterangan: z.string().max(500).optional().or(z.literal("")),
});

export type TahsinFormValues = z.infer<typeof tahsinSchema>;