/*
  Warnings:

  - A unique constraint covering the columns `[siswaId,guruMapelId,jenis,semester,tahunAjar]` on the table `nilai` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE `nilai` MODIFY `jenis` ENUM('TUGAS', 'HARIAN', 'PR', 'UTS', 'UAS', 'PRAKTIK') NOT NULL;

-- AlterTable
ALTER TABLE `users` MODIFY `role` ENUM('ADMIN', 'GURU', 'ORANGTUA') NOT NULL DEFAULT 'ORANGTUA';

-- CreateIndex
CREATE UNIQUE INDEX `nilai_siswaId_guruMapelId_jenis_semester_tahunAjar_key` ON `nilai`(`siswaId`, `guruMapelId`, `jenis`, `semester`, `tahunAjar`);
