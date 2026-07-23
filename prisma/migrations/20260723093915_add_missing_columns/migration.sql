-- Migration: add_missing_columns
-- Sinkronisasi schema baru ke database.
-- Tabel hafalan, jadwal, nilai, sikap, tahsin strukturnya berubah total,
-- sehingga data lama dihapus terlebih dahulu sebelum ALTER TABLE.

-- ─────────────────────────────────────────
-- Step 1: Matikan FK check sementara
-- ─────────────────────────────────────────
SET FOREIGN_KEY_CHECKS = 0;

-- ─────────────────────────────────────────
-- Step 2: Kosongkan tabel yang tidak kompatibel
-- ─────────────────────────────────────────
TRUNCATE TABLE `absensi`;
TRUNCATE TABLE `hafalan`;
TRUNCATE TABLE `jadwal`;
TRUNCATE TABLE `nilai`;
TRUNCATE TABLE `sikap`;
TRUNCATE TABLE `tahsin`;

-- ─────────────────────────────────────────
-- Step 3: Aktifkan FK check kembali
-- ─────────────────────────────────────────
SET FOREIGN_KEY_CHECKS = 1;

-- ─────────────────────────────────────────
-- HAFALAN: restructure lengkap
-- ─────────────────────────────────────────
ALTER TABLE `hafalan`
  DROP COLUMN `surah`,
  DROP COLUMN `ayatMulai`,
  DROP COLUMN `ayatSelesai`,
  DROP COLUMN `status`,
  DROP COLUMN `catatan`,
  MODIFY COLUMN `juz`     TINYINT  NOT NULL,
  MODIFY COLUMN `nilai`   ENUM('L','L-') NOT NULL,
  MODIFY COLUMN `tanggal` DATE     NOT NULL,
  ADD COLUMN `guruId`     VARCHAR(191)                                          NOT NULL,
  ADD COLUMN `hari`       ENUM('SENIN','SELASA','RABU','KAMIS','JUMAT','SABTU') NOT NULL,
  ADD COLUMN `surat`      VARCHAR(50)                                           NOT NULL,
  ADD COLUMN `halaman`    INT                                                   NOT NULL,
  ADD COLUMN `keterangan` TEXT                                                  NULL,
  ADD COLUMN `createdAt`  DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3);

-- ─────────────────────────────────────────
-- JADWAL: drop mapel lama, tambah kodeMapel + tahunAjaranId
-- ─────────────────────────────────────────
ALTER TABLE `jadwal`
  DROP COLUMN `mapel`,
  ADD COLUMN `kodeMapel`     VARCHAR(5) NOT NULL,
  ADD COLUMN `tahunAjaranId` INT        NOT NULL;

-- ─────────────────────────────────────────
-- NILAI: drop mapel lama, tambah guruMapelId, ubah tanggal
-- ─────────────────────────────────────────
ALTER TABLE `nilai`
  DROP COLUMN `mapel`,
  MODIFY COLUMN `tanggal` DATE NOT NULL,
  ADD COLUMN `guruMapelId` INT NOT NULL;

-- ─────────────────────────────────────────
-- SIKAP: restructure lengkap
-- ─────────────────────────────────────────
ALTER TABLE `sikap`
  DROP COLUMN `aspek`,
  DROP COLUMN `predikat`,
  DROP COLUMN `deskripsi`,
  MODIFY COLUMN `tanggal` DATE NOT NULL,
  ADD COLUMN `guruId`     VARCHAR(191)                   NOT NULL,
  ADD COLUMN `jenisSikap` ENUM('POSITIF','PELANGGARAN')  NOT NULL,
  ADD COLUMN `kategori`   VARCHAR(50)                    NOT NULL,
  ADD COLUMN `keterangan` TEXT                           NOT NULL,
  ADD COLUMN `createdAt`  DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3);

-- ─────────────────────────────────────────
-- TAHSIN: restructure lengkap
-- ─────────────────────────────────────────
ALTER TABLE `tahsin`
  DROP COLUMN `materi`,
  DROP COLUMN `nilai`,
  DROP COLUMN `status`,
  DROP COLUMN `catatan`,
  MODIFY COLUMN `tanggal` DATE NOT NULL,
  ADD COLUMN `guruId`     VARCHAR(191)                                          NOT NULL,
  ADD COLUMN `hari`       ENUM('SENIN','SELASA','RABU','KAMIS','JUMAT','SABTU') NOT NULL,
  ADD COLUMN `juz`        TINYINT                                               NOT NULL,
  ADD COLUMN `surat`      VARCHAR(50)                                           NOT NULL,
  ADD COLUMN `halaman`    INT                                                   NOT NULL,
  ADD COLUMN `tajwid`     ENUM('L','L-')                                        NOT NULL,
  ADD COLUMN `makhraj`    ENUM('L','L-')                                        NOT NULL,
  ADD COLUMN `sifatul`    ENUM('L','L-')                                        NOT NULL,
  ADD COLUMN `keterangan` TEXT                                                  NULL,
  ADD COLUMN `createdAt`  DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3);

-- ─────────────────────────────────────────
-- FOREIGN KEYS: hafalan.guruId
-- ─────────────────────────────────────────
ALTER TABLE `hafalan`
  ADD CONSTRAINT `hafalan_guruId_fkey`
  FOREIGN KEY (`guruId`) REFERENCES `guru`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- ─────────────────────────────────────────
-- FOREIGN KEYS: jadwal.kodeMapel + jadwal.tahunAjaranId
-- ─────────────────────────────────────────
ALTER TABLE `jadwal`
  ADD CONSTRAINT `jadwal_kodeMapel_fkey`
  FOREIGN KEY (`kodeMapel`) REFERENCES `mata_pelajaran`(`kodeMapel`) ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE `jadwal`
  ADD CONSTRAINT `jadwal_tahunAjaranId_fkey`
  FOREIGN KEY (`tahunAjaranId`) REFERENCES `tahun_ajaran`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- ─────────────────────────────────────────
-- FOREIGN KEYS: nilai.guruMapelId
-- ─────────────────────────────────────────
ALTER TABLE `nilai`
  ADD CONSTRAINT `nilai_guruMapelId_fkey`
  FOREIGN KEY (`guruMapelId`) REFERENCES `guru_mapel`(`idGuruMapel`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- ─────────────────────────────────────────
-- FOREIGN KEYS: sikap.guruId
-- ─────────────────────────────────────────
ALTER TABLE `sikap`
  ADD CONSTRAINT `sikap_guruId_fkey`
  FOREIGN KEY (`guruId`) REFERENCES `guru`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- ─────────────────────────────────────────
-- FOREIGN KEYS: tahsin.guruId
-- ─────────────────────────────────────────
ALTER TABLE `tahsin`
  ADD CONSTRAINT `tahsin_guruId_fkey`
  FOREIGN KEY (`guruId`) REFERENCES `guru`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- ─────────────────────────────────────────
-- UNIQUE INDEXES: jadwal
-- ─────────────────────────────────────────
ALTER TABLE `jadwal`
  ADD UNIQUE INDEX `jadwal_kelasId_hari_jamMulai_tahunAjaranId_key`(`kelasId`, `hari`, `jamMulai`, `tahunAjaranId`);

ALTER TABLE `jadwal`
  ADD UNIQUE INDEX `jadwal_guruId_hari_jamMulai_tahunAjaranId_key`(`guruId`, `hari`, `jamMulai`, `tahunAjaranId`);
