-- CreateEnum
CREATE TYPE "Device" AS ENUM ('DESKTOP', 'TABLET', 'MOBILE');

-- CreateTable
CREATE TABLE "Impression" (
    "id" TEXT NOT NULL,
    "widgetId" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "device" "Device" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Impression_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Impression_widgetId_createdAt_idx" ON "Impression"("widgetId", "createdAt");

-- CreateIndex
CREATE INDEX "Impression_tenantId_createdAt_idx" ON "Impression"("tenantId", "createdAt");

-- AddForeignKey
ALTER TABLE "Impression" ADD CONSTRAINT "Impression_widgetId_fkey" FOREIGN KEY ("widgetId") REFERENCES "Widget"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Impression" ADD CONSTRAINT "Impression_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;
