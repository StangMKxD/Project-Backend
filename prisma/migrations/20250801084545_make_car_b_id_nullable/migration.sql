-- DropForeignKey
ALTER TABLE `comparecar` DROP FOREIGN KEY `CompareCar_carBId_fkey`;

-- DropIndex
DROP INDEX `CompareCar_carBId_fkey` ON `comparecar`;

-- AlterTable
ALTER TABLE `comparecar` MODIFY `carBId` INTEGER NULL;

-- AddForeignKey
ALTER TABLE `CompareCar` ADD CONSTRAINT `CompareCar_carBId_fkey` FOREIGN KEY (`carBId`) REFERENCES `Car`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
