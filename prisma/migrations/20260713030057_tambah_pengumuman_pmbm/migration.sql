-- AlterTable
ALTER TABLE `users` MODIFY `role` ENUM('ADMIN', 'GURU', 'ORANGTUA') NOT NULL DEFAULT 'ORANGTUA';

-- CreateTable
CREATE TABLE `pengumuman_pmbm` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `judul` VARCHAR(200) NOT NULL,
    `deskripsi` TEXT NULL,
    `filePath` VARCHAR(255) NOT NULL,
    `fileName` VARCHAR(255) NOT NULL,
    `tahun` VARCHAR(20) NOT NULL,
    `idUser` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `pengumuman_pmbm` ADD CONSTRAINT `pengumuman_pmbm_idUser_fkey` FOREIGN KEY (`idUser`) REFERENCES `users`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
