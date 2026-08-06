import 'dotenv/config';
import { PrismaClient } from '../generated/prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import * as bcrypt from 'bcrypt';

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

/*
 * DOCU: Seeds the database with one test user per role, two sample clubs,
 * captain leads, department executives, events, a budget request, a venue
 * request, and a task — enough related data to test every module without
 * manually creating records through Postman first.
 *
 * Uses upsert() for users (safe to re-run) and create() for everything else
 * (so re-running will add duplicates of non-user records — see the note at
 * the bottom on resetting if you want a clean slate).
 *
 * Last Updated: 2026-08-06
 * Author: Alfred
 * Last Updated By: Alfred
 */
async function main() {
    console.log('Seeding...');

    const password = await bcrypt.hash('password123', 10);

    // ── 1. One user per role (upsert = safe to re-run) ──────────────
    const [infoUser, allocUser, workUser, adminUser] = await Promise.all([
        prisma.user.upsert({
            where: { email: 'info@test.com' },
            update: {},
            create: { email: 'info@test.com', password, name: 'Info Officer', role: 'INFORMATION' },
        }),
        prisma.user.upsert({
            where: { email: 'alloc@test.com' },
            update: {},
            create: { email: 'alloc@test.com', password, name: 'Allocation Officer', role: 'ALLOCATION' },
        }),
        prisma.user.upsert({
            where: { email: 'work@test.com' },
            update: {},
            create: { email: 'work@test.com', password, name: 'Workforce Officer', role: 'WORKFORCE' },
        }),
        prisma.user.upsert({
            where: { email: 'admin@test.com' },
            update: {},
            create: { email: 'admin@test.com', password, name: 'Admin', role: 'ADMIN' },
        }),
    ]);

    // ── 2. Clubs ──────────────────────────────────────────────────
    const club1 = await prisma.club.create({
        data: {
            clubName: 'AWS Student Builders - Test University',
            universityName: 'Test University',
            clubType: 'STUDENT_BUILDER_GROUP',
            establishmentDate: new Date('2023-06-01'),
            memberCount: 40,
            islandGroup: 'LUZON',
            region: 'Region IV-A',
            province: 'Laguna',
        },
    });

    const club2 = await prisma.club.create({
        data: {
            clubName: 'Learning Club - Cebu Tech',
            universityName: 'Cebu Institute of Technology',
            clubType: 'LEARNING_CLUB',
            establishmentDate: new Date('2022-09-15'),
            memberCount: 18,
            islandGroup: 'VISAYAS',
            region: 'Region VII',
            province: 'Cebu',
        },
    });

    // ── 3. Captain & Leads ────────────────────────────────────────
    const captain1 = await prisma.captainLead.create({
        data: {
            lastName: 'Dela Cruz',
            firstName: 'Juan',
            middleName: 'Santos',
            clubId: club1.id,
            linkedinUrl: 'https://linkedin.com/in/juandelacruz',
            credlyUrl: 'https://credly.com/users/juandelacruz',
        },
    });

    await prisma.captainLead.create({
        data: {
            lastName: 'Reyes',
            firstName: 'Maria',
            clubId: club2.id,
        },
    });

    // ── 4. Events ─────────────────────────────────────────────────
    const event1 = await prisma.event.create({
        data: {
            eventName: 'AWS Community Day 2026',
            startDate: new Date('2026-09-10'),
            endDate: new Date('2026-09-10'),
            eventType: 'TECHNICAL',
            expectedParticipants: 200,
            location: 'SMX Convention Center',
            eventLink: 'https://example.com/community-day',
        },
    });

    const event2 = await prisma.event.create({
        data: {
            eventName: 'Leadership Bootcamp',
            startDate: new Date('2026-10-01'),
            endDate: new Date('2026-10-03'),
            eventType: 'LEADERSHIP',
            expectedParticipants: 60,
            location: 'Online',
        },
    });

    // ── 5. Department Executives ─────────────────────────────────
    await prisma.departmentExecutive.create({
        data: {
            lastName: 'Garcia',
            firstName: 'Ana',
            clubId: club1.id,
            email: 'ana.garcia@example.com',
            contactNumber: '09171234567',
            birthdate: new Date('2001-03-12'),
            department: 'OPERATIONS',
        },
    });

    // ── 6. Budget Request (placeholder file URLs — no real file storage in seed) ──
    await prisma.budgetRequest.create({
        data: {
            requesteeType: 'CLUB',
            fullName: 'Juan Dela Cruz',
            clubId: club1.id,
            eventId: event1.id,
            participantTier: 'A',
            requestedAmount: 15000,
            budgetBreakdownUrl: 'https://example.com/placeholder-budget-breakdown.pdf',
            officialRequestUrl: 'https://example.com/placeholder-official-request.pdf',
            eventPrimerUrl: 'https://example.com/placeholder-event-primer.pdf',
        },
    });

    // ── 7. Venue Request ──────────────────────────────────────────
    await prisma.venueRequest.create({
        data: {
            clubId: club1.id,
            clubHeadId: captain1.id,
            eventId: event1.id,
            projectProfileUrl: 'https://example.com/placeholder-project-profile.pdf',
            reservationDate: new Date('2026-09-10'),
            startTime: new Date('2026-09-10T08:00:00.000Z'),
            endTime: new Date('2026-09-10T17:00:00.000Z'),
            floor: 'FLOOR_15',
            numberOfPax: 150,
        },
    });

    // ── 8. Task ───────────────────────────────────────────────────
    await prisma.task.create({
        data: {
            taskName: 'Review Q3 budget requests',
            taskDetails: 'Go through all pending budget requests for Q3 events',
            assignedDate: new Date(),
            deadline: new Date('2026-09-01'),
            assignedOffice: 'ALLOCATION',
            status: 'PENDING',
        },
    });

    console.log('Seed complete. Login with any of these (password: password123):');
    console.log('  ', infoUser.email, '(INFORMATION)');
    console.log('  ', allocUser.email, '(ALLOCATION)');
    console.log('  ', workUser.email, '(WORKFORCE)');
    console.log('  ', adminUser.email, '(ADMIN)');
    console.log('IDs you\'ll need for Postman:');
    console.log('  club1.id      =', club1.id);
    console.log('  club2.id      =', club2.id);
    console.log('  captain1.id   =', captain1.id);
    console.log('  event1.id     =', event1.id);
    console.log('  event2.id     =', event2.id);
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });