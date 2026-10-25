-- Kunci unik tahun_ajaran semula hanya pada `nama`, sehingga satu tahun pelajaran
-- tidak bisa punya dua semester (Ganjil & Genap). Aplikasi sendiri sudah memeriksa
-- duplikat berdasarkan kombinasi (nama, semester), jadi kunci di database disamakan.

-- CreateIndex (dibuat lebih dulu; aman karena data lama sudah memenuhi aturan yang lebih ketat)
CREATE UNIQUE INDEX `tahun_ajaran_nama_semester_key` ON `tahun_ajaran`(`nama`, `semester`);

-- DropIndex
DROP INDEX `tahun_ajaran_nama_key` ON `tahun_ajaran`;
