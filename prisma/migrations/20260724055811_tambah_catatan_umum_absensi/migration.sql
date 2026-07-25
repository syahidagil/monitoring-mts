-- AlterTable
ALTER TABLE `users` MODIFY `role` ENUM('ADMIN', 'GURU', 'ORANGTUA') NOT NULL DEFAULT 'ORANGTUA';

-- CreateTable
CREATE TABLE `absensi_catatan_umum` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `jadwalId` INTEGER NOT NULL,
    `tanggal` DATE NOT NULL,
    `catatan` TEXT NOT NULL,
    `guruId` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `absensi_catatan_umum_jadwalId_tanggal_key`(`jadwalId`, `tanggal`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `absensi_catatan_umum` ADD CONSTRAINT `absensi_catatan_umum_jadwalId_fkey` FOREIGN KEY (`jadwalId`) REFERENCES `jadwal`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `absensi_catatan_umum` ADD CONSTRAINT `absensi_catatan_umum_guruId_fkey` FOREIGN KEY (`guruId`) REFERENCES `guru`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
