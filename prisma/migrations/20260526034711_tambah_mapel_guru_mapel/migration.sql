-- AlterTable
ALTER TABLE `users` MODIFY `role` ENUM('ADMIN', 'GURU', 'ORANGTUA') NOT NULL DEFAULT 'ORANGTUA';

-- CreateTable
CREATE TABLE `mata_pelajaran` (
    `kodeMapel` VARCHAR(5) NOT NULL,
    `namaMapel` VARCHAR(20) NOT NULL,

    PRIMARY KEY (`kodeMapel`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `guru_mapel` (
    `idGuruMapel` INTEGER NOT NULL AUTO_INCREMENT,
    `idGuru` VARCHAR(16) NOT NULL,
    `kodeMapel` VARCHAR(5) NOT NULL,

    UNIQUE INDEX `guru_mapel_idGuru_kodeMapel_key`(`idGuru`, `kodeMapel`),
    PRIMARY KEY (`idGuruMapel`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `guru_mapel` ADD CONSTRAINT `guru_mapel_idGuru_fkey` FOREIGN KEY (`idGuru`) REFERENCES `guru`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `guru_mapel` ADD CONSTRAINT `guru_mapel_kodeMapel_fkey` FOREIGN KEY (`kodeMapel`) REFERENCES `mata_pelajaran`(`kodeMapel`) ON DELETE RESTRICT ON UPDATE CASCADE;
