/*
  Warnings:

  - A unique constraint covering the columns `[userId]` on the table `CompareCar` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX `CompareCar_userId_key` ON `CompareCar`(`userId`);
