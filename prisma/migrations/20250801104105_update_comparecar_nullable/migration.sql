-- DropForeignKey
ALTER TABLE `comparecar` DROP FOREIGN KEY `CompareCar_carAId_fkey`;

-- DropIndex
DROP INDEX `CompareCar_carAId_fkey` ON `comparecar`;

-- AlterTable
ALTER TABLE `comparecar` MODIFY `carAId` INTEGER NULL;

-- AddForeignKey
ALTER TABLE `CompareCar` ADD CONSTRAINT `CompareCar_carAId_fkey` FOREIGN KEY (`carAId`) REFERENCES `Car`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
