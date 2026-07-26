import { z } from "zod";

// Kategori sesuai jenis (dipakai di form & validasi longgar)
export const KATEGORI_POSITIF = [
  "Kedisiplinan", "Sosial", "Kebersihan", "Prestasi",
  "Ibadah", "Kreativitas", "Kepemimpinan",
] as const;

export const KATEGORI_PELANGGARAN = [
  "Keterlambatan", "Atribut", "Gadget", "Kekerasan",
  "Ketidakjujuran", "Kebersihan", "Ketertiban",
] as const;

// Selaras model Sikap: jenisSikap, kategori, keterangan, tanggal, semester, tahunAjar
export const sikapSchema = z.object({
  siswaId:    z.coerce.number().int().positive("Siswa wajib dipilih"),
  jenisSikap: z.enum(["POSITIF", "PELANGGARAN"], { message: "Pilih kategori perilaku" }),
  kategori:   z.string().min(1, "Pilih jenis kategori").max(50),
  keterangan: z.string().min(10, "Keterangan minimal 10 karakter").max(500),
  tanggal:    z.coerce.date({ message: "Tanggal tidak valid" }),
});

export type SikapFormValues = z.infer<typeof sikapSchema>;