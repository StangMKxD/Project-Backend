/*
  Warnings:

  - A unique constraint covering the columns `[userId,carId]` on the table `FavouriteCar` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX `FavouriteCar_userId_carId_key` ON `FavouriteCar`(`userId`, `carId`);
