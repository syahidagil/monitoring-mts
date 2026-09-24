-- Migration ini mendokumentasikan penambahan kolom kodeGuru yang sudah
-- diterapkan secara manual langsung ke database production (via HeidiSQL),
-- untuk menyinkronkan dengan schema.prisma (field kodeGuru pada model Guru).

ALTER TABLE `guru` ADD COLUMN `kodeGuru` VARCHAR(10) NULL;
ALTER TABLE `guru` ADD UNIQUE INDEX `guru_kodeGuru_key`(`kodeGuru`);