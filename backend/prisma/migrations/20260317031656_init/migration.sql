-- CreateTable
CREATE TABLE "leads" (
    "id" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "telefone" TEXT NOT NULL,
    "telefone_raw" TEXT NOT NULL,
    "confirmado" BOOLEAN NOT NULL DEFAULT false,
    "ip" TEXT,
    "user_agent" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "leads_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "lead_numbers" (
    "id" TEXT NOT NULL,
    "lead_id" TEXT NOT NULL,
    "numero" INTEGER NOT NULL,

    CONSTRAINT "lead_numbers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "lead_accesses" (
    "id" TEXT NOT NULL,
    "lead_id" TEXT NOT NULL,
    "token" TEXT NOT NULL,

    CONSTRAINT "lead_accesses_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "utm_trackings" (
    "id" TEXT NOT NULL,
    "lead_id" TEXT NOT NULL,
    "utm_source" TEXT,
    "utm_medium" TEXT,
    "utm_campaign" TEXT,
    "utm_content" TEXT,
    "utm_term" TEXT,

    CONSTRAINT "utm_trackings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "whatsapp_logs" (
    "id" TEXT NOT NULL,
    "lead_id" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "payload" JSONB NOT NULL,
    "response" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "whatsapp_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "meta_pixels" (
    "id" TEXT NOT NULL,
    "pixel_id" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "ativo" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "meta_pixels_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "confirmations" (
    "id" TEXT NOT NULL,
    "lead_id" TEXT NOT NULL,
    "confirmed_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "confirmations_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "lead_numbers_lead_id_idx" ON "lead_numbers"("lead_id");

-- CreateIndex
CREATE UNIQUE INDEX "lead_accesses_lead_id_key" ON "lead_accesses"("lead_id");

-- CreateIndex
CREATE UNIQUE INDEX "lead_accesses_token_key" ON "lead_accesses"("token");

-- CreateIndex
CREATE UNIQUE INDEX "utm_trackings_lead_id_key" ON "utm_trackings"("lead_id");

-- CreateIndex
CREATE INDEX "whatsapp_logs_lead_id_idx" ON "whatsapp_logs"("lead_id");

-- CreateIndex
CREATE UNIQUE INDEX "meta_pixels_pixel_id_key" ON "meta_pixels"("pixel_id");

-- CreateIndex
CREATE INDEX "confirmations_lead_id_idx" ON "confirmations"("lead_id");

-- AddForeignKey
ALTER TABLE "lead_numbers" ADD CONSTRAINT "lead_numbers_lead_id_fkey" FOREIGN KEY ("lead_id") REFERENCES "leads"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "lead_accesses" ADD CONSTRAINT "lead_accesses_lead_id_fkey" FOREIGN KEY ("lead_id") REFERENCES "leads"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "utm_trackings" ADD CONSTRAINT "utm_trackings_lead_id_fkey" FOREIGN KEY ("lead_id") REFERENCES "leads"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "whatsapp_logs" ADD CONSTRAINT "whatsapp_logs_lead_id_fkey" FOREIGN KEY ("lead_id") REFERENCES "leads"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "confirmations" ADD CONSTRAINT "confirmations_lead_id_fkey" FOREIGN KEY ("lead_id") REFERENCES "leads"("id") ON DELETE CASCADE ON UPDATE CASCADE;
