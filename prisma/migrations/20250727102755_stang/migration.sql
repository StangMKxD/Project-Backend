-- DropForeignKey
ALTER TABLE `image` DROP FOREIGN KEY `Image_carId_fkey`;

-- DropIndex
DROP INDEX `Image_carId_fkey` ON `image`;

-- AddForeignKey
ALTER TABLE `Image` ADD CONSTRAINT `Image_carId_fkey` FOREIGN KEY (`carId`) REFERENCES `Car`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
