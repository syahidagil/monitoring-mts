-- CreateTable
CREATE TABLE `users` (
    `id` VARCHAR(191) NOT NULL,
    `username` VARCHAR(191) NOT NULL,
    `password` VARCHAR(191) NOT NULL,
    `role` ENUM('ADMIN', 'GURU', 'ORANGTUA') NOT NULL DEFAULT 'ORANGTUA',
    `name` VARCHAR(191) NOT NULL,
    `status` BOOLEAN NOT NULL DEFAULT true,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `users_username_key`(`username`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `informasi_sekolah` (
    `idInfo` INTEGER NOT NULL AUTO_INCREMENT,
    `kategori` ENUM('sejarah', 'visi', 'misi', 'tujuan', 'fasilitas', 'kurikulum', 'prestasi', 'berita', 'ekstrakurikuler', 'psb', 'statistik') NOT NULL,
    `judul` VARCHAR(100) NOT NULL,
    `isi` TEXT NOT NULL,
    `gambar` VARCHAR(255) NULL,
    `tanggalUpdate` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `idUser` VARCHAR(191) NOT NULL,

    PRIMARY KEY (`idInfo`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `tahun_ajaran` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `nama` VARCHAR(20) NOT NULL,
    `semester` ENUM('GANJIL', 'GENAP') NOT NULL,
    `aktif` BOOLEAN NOT NULL DEFAULT false,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `tahun_ajaran_nama_key`(`nama`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `kelas` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `nama` VARCHAR(20) NOT NULL,
    `tingkat` INTEGER NOT NULL,
    `tahunAjaranId` INTEGER NOT NULL,
    `waliKelasId` VARCHAR(191) NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `guru` (
    `id` VARCHAR(191) NOT NULL,
    `nip` VARCHAR(20) NULL,
    `mapel` VARCHAR(100) NOT NULL,
    `noHp` VARCHAR(20) NULL,
    `alamat` TEXT NULL,

    UNIQUE INDEX `guru_nip_key`(`nip`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `orang_tua` (
    `id` VARCHAR(191) NOT NULL,
    `noHp` VARCHAR(20) NULL,
    `alamat` TEXT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `siswa` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `nis` VARCHAR(20) NOT NULL,
    `nama` VARCHAR(100) NOT NULL,
    `jenisKelamin` ENUM('L', 'P') NOT NULL,
    `tanggalLahir` DATE NOT NULL,
    `kelasId` INTEGER NOT NULL,
    `orangTuaId` VARCHAR(191) NULL,
    `foto` VARCHAR(255) NULL,
    `status` BOOLEAN NOT NULL DEFAULT true,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `siswa_nis_key`(`nis`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `jadwal` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `kelasId` INTEGER NOT NULL,
    `guruId` VARCHAR(191) NOT NULL,
    `mapel` VARCHAR(100) NOT NULL,
    `hari` ENUM('SENIN', 'SELASA', 'RABU', 'KAMIS', 'JUMAT', 'SABTU') NOT NULL,
    `jamMulai` VARCHAR(5) NOT NULL,
    `jamSelesai` VARCHAR(5) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `absensi` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `siswaId` INTEGER NOT NULL,
    `jadwalId` INTEGER NOT NULL,
    `guruId` VARCHAR(191) NOT NULL,
    `tanggal` DATE NOT NULL,
    `status` ENUM('HADIR', 'SAKIT', 'IZIN', 'ALPHA') NOT NULL,
    `keterangan` VARCHAR(255) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `absensi_siswaId_jadwalId_tanggal_key`(`siswaId`, `jadwalId`, `tanggal`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `nilai` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `siswaId` INTEGER NOT NULL,
    `guruId` VARCHAR(191) NOT NULL,
    `mapel` VARCHAR(100) NOT NULL,
    `jenis` ENUM('HARIAN', 'UTS', 'UAS', 'TUGAS', 'PRAKTIK') NOT NULL,
    `nilai` DECIMAL(5, 2) NOT NULL,
    `semester` ENUM('GANJIL', 'GENAP') NOT NULL,
    `tahunAjar` VARCHAR(20) NOT NULL,
    `keterangan` VARCHAR(255) NULL,
    `tanggal` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `sikap` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `siswaId` INTEGER NOT NULL,
    `aspek` VARCHAR(100) NOT NULL,
    `predikat` ENUM('SB', 'B', 'C', 'K') NOT NULL,
    `deskripsi` TEXT NULL,
    `semester` ENUM('GANJIL', 'GENAP') NOT NULL,
    `tahunAjar` VARCHAR(20) NOT NULL,
    `tanggal` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `hafalan` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `siswaId` INTEGER NOT NULL,
    `surah` VARCHAR(50) NOT NULL,
    `ayatMulai` INTEGER NOT NULL,
    `ayatSelesai` INTEGER NOT NULL,
    `juz` INTEGER NULL,
    `nilai` DECIMAL(4, 1) NULL,
    `status` ENUM('BELUM', 'PROSES', 'LULUS', 'MENGULANG') NOT NULL,
    `tanggal` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `catatan` TEXT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `tahsin` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `siswaId` INTEGER NOT NULL,
    `materi` VARCHAR(100) NOT NULL,
    `nilai` DECIMAL(4, 1) NULL,
    `status` ENUM('BELUM', 'PROSES', 'LULUS', 'MENGULANG') NOT NULL,
    `tanggal` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `catatan` TEXT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `informasi_sekolah` ADD CONSTRAINT `informasi_sekolah_idUser_fkey` FOREIGN KEY (`idUser`) REFERENCES `users`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `kelas` ADD CONSTRAINT `kelas_tahunAjaranId_fkey` FOREIGN KEY (`tahunAjaranId`) REFERENCES `tahun_ajaran`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `kelas` ADD CONSTRAINT `kelas_waliKelasId_fkey` FOREIGN KEY (`waliKelasId`) REFERENCES `guru`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `guru` ADD CONSTRAINT `guru_id_fkey` FOREIGN KEY (`id`) REFERENCES `users`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `orang_tua` ADD CONSTRAINT `orang_tua_id_fkey` FOREIGN KEY (`id`) REFERENCES `users`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `siswa` ADD CONSTRAINT `siswa_kelasId_fkey` FOREIGN KEY (`kelasId`) REFERENCES `kelas`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `siswa` ADD CONSTRAINT `siswa_orangTuaId_fkey` FOREIGN KEY (`orangTuaId`) REFERENCES `orang_tua`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `jadwal` ADD CONSTRAINT `jadwal_kelasId_fkey` FOREIGN KEY (`kelasId`) REFERENCES `kelas`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `jadwal` ADD CONSTRAINT `jadwal_guruId_fkey` FOREIGN KEY (`guruId`) REFERENCES `guru`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `absensi` ADD CONSTRAINT `absensi_siswaId_fkey` FOREIGN KEY (`siswaId`) REFERENCES `siswa`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `absensi` ADD CONSTRAINT `absensi_jadwalId_fkey` FOREIGN KEY (`jadwalId`) REFERENCES `jadwal`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `absensi` ADD CONSTRAINT `absensi_guruId_fkey` FOREIGN KEY (`guruId`) REFERENCES `guru`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `nilai` ADD CONSTRAINT `nilai_siswaId_fkey` FOREIGN KEY (`siswaId`) REFERENCES `siswa`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `nilai` ADD CONSTRAINT `nilai_guruId_fkey` FOREIGN KEY (`guruId`) REFERENCES `guru`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `sikap` ADD CONSTRAINT `sikap_siswaId_fkey` FOREIGN KEY (`siswaId`) REFERENCES `siswa`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `hafalan` ADD CONSTRAINT `hafalan_siswaId_fkey` FOREIGN KEY (`siswaId`) REFERENCES `siswa`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `tahsin` ADD CONSTRAINT `tahsin_siswaId_fkey` FOREIGN KEY (`siswaId`) REFERENCES `siswa`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
