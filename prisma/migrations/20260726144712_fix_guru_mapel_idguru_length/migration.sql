-- DropForeignKey
ALTER TABLE `guru_mapel` DROP FOREIGN KEY `guru_mapel_idGuru_fkey`;

-- AlterTable
ALTER TABLE `guru_mapel` MODIFY `idGuru` VARCHAR(30) NOT NULL;

-- AddForeignKey
ALTER TABLE `guru_mapel` ADD CONSTRAINT `guru_mapel_idGuru_fkey` FOREIGN KEY (`idGuru`) REFERENCES `guru`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
