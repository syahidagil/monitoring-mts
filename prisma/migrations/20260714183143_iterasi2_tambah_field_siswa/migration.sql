/*
  Warnings:

  - You are about to drop the column `foto` on the `siswa` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `guru` ADD COLUMN `pendidikan` VARCHAR(100) NULL;

-- AlterTable
ALTER TABLE `orang_tua` ADD COLUMN `pekerjaan` VARCHAR(100) NULL;

-- AlterTable
ALTER TABLE `siswa` DROP COLUMN `foto`,
    ADD COLUMN `alamat` TEXT NULL,
    ADD COLUMN `namaAyah` VARCHAR(100) NULL,
    ADD COLUMN `namaIbu` VARCHAR(100) NULL,
    ADD COLUMN `statusTahfidz` BOOLEAN NOT NULL DEFAULT false,
    ADD COLUMN `tempatLahir` VARCHAR(50) NULL;

-- AlterTable
ALTER TABLE `users` MODIFY `role` ENUM('ADMIN', 'GURU', 'ORANGTUA') NOT NULL DEFAULT 'ORANGTUA';
