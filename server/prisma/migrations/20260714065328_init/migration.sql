-- CreateTable
CREATE TABLE "users" (
    "id" SERIAL NOT NULL,
    "fullName" TEXT,
    "orgName" TEXT,
    "phone" TEXT DEFAULT '+998',
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ges_list" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "power" TEXT,
    "region" TEXT,
    "status" TEXT,
    "repair" TEXT,
    "isAktive" BOOLEAN NOT NULL DEFAULT false,
    "isPublished" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ges_list_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "aggregates" (
    "id" SERIAL NOT NULL,
    "hydroTurbine" JSONB,
    "hydroGenerator" JSONB,
    "transformer" JSONB,
    "gesId" INTEGER NOT NULL,
    "state" TEXT NOT NULL DEFAULT 'running',
    "isPublished" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "aggregates_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "hydro_generators" (
    "id" SERIAL NOT NULL,
    "name" TEXT,
    "power" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "hydro_generators_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "hydro_turbines" (
    "id" SERIAL NOT NULL,
    "name" TEXT,
    "power" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "hydro_turbines_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "transformers" (
    "id" SERIAL NOT NULL,
    "name" TEXT,
    "power" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "transformers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "orders" (
    "id" SERIAL NOT NULL,
    "message" TEXT,
    "type" TEXT,
    "isOrdered" TEXT,
    "isPublished" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "orders_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_OrderAuthors" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL,

    CONSTRAINT "_OrderAuthors_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE INDEX "_OrderAuthors_B_index" ON "_OrderAuthors"("B");

-- AddForeignKey
ALTER TABLE "aggregates" ADD CONSTRAINT "aggregates_gesId_fkey" FOREIGN KEY ("gesId") REFERENCES "ges_list"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_OrderAuthors" ADD CONSTRAINT "_OrderAuthors_A_fkey" FOREIGN KEY ("A") REFERENCES "orders"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_OrderAuthors" ADD CONSTRAINT "_OrderAuthors_B_fkey" FOREIGN KEY ("B") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
