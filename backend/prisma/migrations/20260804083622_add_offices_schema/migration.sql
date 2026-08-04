-- CreateEnum
CREATE TYPE "Role" AS ENUM ('INFORMATION', 'ALLOCATION', 'WORKFORCE', 'ADMIN');

-- CreateEnum
CREATE TYPE "ClubType" AS ENUM ('STUDENT_BUILDER_GROUP', 'LEARNING_CLUB');

-- CreateEnum
CREATE TYPE "IslandGroup" AS ENUM ('LUZON', 'VISAYAS', 'MINDANAO');

-- CreateEnum
CREATE TYPE "RequesteeType" AS ENUM ('CLUB', 'NON_CLUB');

-- CreateEnum
CREATE TYPE "ParticipantTier" AS ENUM ('S', 'A', 'B', 'C');

-- CreateEnum
CREATE TYPE "EventType" AS ENUM ('TECHNICAL', 'LEADERSHIP', 'SUSTAINABILITY', 'CAREER_GROWTH', 'DIVERSITY');

-- CreateEnum
CREATE TYPE "Department" AS ENUM ('EXECUTIVES', 'RESOURCE', 'OPERATIONS', 'TECHNOLOGY', 'RELATIONS', 'MULTIMEDIA', 'LEARNING_CLUBS', 'SKILL_BUILDERS', 'BUILDHERS_PLUS');

-- CreateEnum
CREATE TYPE "Floor" AS ENUM ('FLOOR_15', 'FLOOR_21');

-- CreateEnum
CREATE TYPE "TaskStatus" AS ENUM ('PENDING', 'IN_PROGRESS', 'DONE');

-- CreateTable
CREATE TABLE "BudgetRequest" (
    "id" TEXT NOT NULL,
    "requesteeType" "RequesteeType" NOT NULL,
    "fullName" TEXT NOT NULL,
    "clubId" TEXT,
    "nonClubOrgName" TEXT,
    "eventId" TEXT NOT NULL,
    "participantTier" "ParticipantTier" NOT NULL,
    "requestedAmount" DECIMAL(65,30) NOT NULL,
    "budgetBreakdownUrl" TEXT NOT NULL,
    "officialRequestUrl" TEXT NOT NULL,
    "eventPrimerUrl" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "BudgetRequest_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CaptainLead" (
    "id" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "firstName" TEXT NOT NULL,
    "middleName" TEXT,
    "clubId" TEXT NOT NULL,
    "linkedinUrl" TEXT,
    "credlyUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CaptainLead_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Club" (
    "id" TEXT NOT NULL,
    "clubName" TEXT NOT NULL,
    "universityName" TEXT NOT NULL,
    "clubType" "ClubType" NOT NULL,
    "establishmentDate" TIMESTAMP(3) NOT NULL,
    "memberCount" INTEGER NOT NULL,
    "islandGroup" "IslandGroup" NOT NULL,
    "region" TEXT NOT NULL,
    "province" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Club_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DepartmentExecutive" (
    "id" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "firstName" TEXT NOT NULL,
    "middleName" TEXT,
    "clubId" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "contactNumber" TEXT NOT NULL,
    "birthdate" TIMESTAMP(3) NOT NULL,
    "department" "Department" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "DepartmentExecutive_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Event" (
    "id" TEXT NOT NULL,
    "eventName" TEXT NOT NULL,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3) NOT NULL,
    "eventType" "EventType" NOT NULL,
    "expectedParticipants" INTEGER NOT NULL,
    "location" TEXT NOT NULL,
    "eventLink" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Event_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Task" (
    "id" TEXT NOT NULL,
    "taskName" TEXT NOT NULL,
    "taskDetails" TEXT NOT NULL,
    "assignedDate" TIMESTAMP(3) NOT NULL,
    "deadline" TIMESTAMP(3) NOT NULL,
    "assignedOffice" "Role" NOT NULL,
    "status" "TaskStatus" NOT NULL DEFAULT 'PENDING',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Task_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "name" TEXT,
    "role" "Role" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "VenueRequest" (
    "id" TEXT NOT NULL,
    "clubId" TEXT NOT NULL,
    "clubHeadId" TEXT NOT NULL,
    "eventId" TEXT NOT NULL,
    "projectProfileUrl" TEXT NOT NULL,
    "reservationDate" TIMESTAMP(3) NOT NULL,
    "startTime" TIMESTAMP(3) NOT NULL,
    "endTime" TIMESTAMP(3) NOT NULL,
    "floor" "Floor" NOT NULL,
    "numberOfPax" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "VenueRequest_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- AddForeignKey
ALTER TABLE "BudgetRequest" ADD CONSTRAINT "BudgetRequest_clubId_fkey" FOREIGN KEY ("clubId") REFERENCES "Club"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BudgetRequest" ADD CONSTRAINT "BudgetRequest_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "Event"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CaptainLead" ADD CONSTRAINT "CaptainLead_clubId_fkey" FOREIGN KEY ("clubId") REFERENCES "Club"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DepartmentExecutive" ADD CONSTRAINT "DepartmentExecutive_clubId_fkey" FOREIGN KEY ("clubId") REFERENCES "Club"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VenueRequest" ADD CONSTRAINT "VenueRequest_clubId_fkey" FOREIGN KEY ("clubId") REFERENCES "Club"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VenueRequest" ADD CONSTRAINT "VenueRequest_clubHeadId_fkey" FOREIGN KEY ("clubHeadId") REFERENCES "CaptainLead"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VenueRequest" ADD CONSTRAINT "VenueRequest_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "Event"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
