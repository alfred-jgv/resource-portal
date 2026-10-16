import 'dotenv/config';
import { PrismaClient } from '../generated/prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import * as bcrypt from 'bcrypt';

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

const id = (prefix: string, index: number) =>
    `00000000-0000-4000-8000-${prefix.slice(0, 4)}${String(index).padStart(8, '0')}`;

async function main() {
    console.log('Seeding 100 records per resource...');

    const password = await bcrypt.hash('password123', 10);
    await Promise.all([
        prisma.user.upsert({
            where: { email: 'info@test.com' },
            update: { password, name: 'Info Officer', role: 'INFORMATION' },
            create: { email: 'info@test.com', password, name: 'Info Officer', role: 'INFORMATION' },
        }),
        prisma.user.upsert({
            where: { email: 'alloc@test.com' },
            update: { password, name: 'Allocation Officer', role: 'ALLOCATION' },
            create: { email: 'alloc@test.com', password, name: 'Allocation Officer', role: 'ALLOCATION' },
        }),
        prisma.user.upsert({
            where: { email: 'work@test.com' },
            update: { password, name: 'Workforce Officer', role: 'WORKFORCE' },
            create: { email: 'work@test.com', password, name: 'Workforce Officer', role: 'WORKFORCE' },
        }),
        prisma.user.upsert({
            where: { email: 'admin@test.com' },
            update: { password, name: 'Admin', role: 'ADMIN' },
            create: { email: 'admin@test.com', password, name: 'Admin', role: 'ADMIN' },
        }),
    ]);

    const clubs = Array.from({ length: 100 }, (_, index) => ({
        id: id('10000000', index + 1),
        clubName: `AWSSUG PH Club ${String(index + 1).padStart(3, '0')}`,
        universityName: `University ${String((index % 25) + 1).padStart(2, '0')}`,
        clubType: index % 2 === 0 ? 'STUDENT_BUILDER_GROUP' as const : 'LEARNING_CLUB' as const,
        establishmentDate: new Date(Date.UTC(2018 + (index % 8), index % 12, (index % 27) + 1)),
        memberCount: 20 + (index % 181),
        islandGroup: (['LUZON', 'VISAYAS', 'MINDANAO'] as const)[index % 3],
        region: `Region ${((index % 13) + 1).toString().padStart(2, '0')}`,
        province: `Province ${String((index % 30) + 1).padStart(2, '0')}`,
    }));
    await prisma.club.createMany({ data: clubs, skipDuplicates: true });

    const captainLeads = Array.from({ length: 100 }, (_, index) => ({
        id: id('20000000', index + 1),
        lastName: `LeadLastName${index + 1}`,
        firstName: `LeadFirstName${index + 1}`,
        middleName: index % 3 === 0 ? `Middle${index + 1}` : null,
        clubId: clubs[index].id,
        linkedinUrl: `https://www.linkedin.com/in/awssug-lead-${index + 1}`,
        credlyUrl: index % 2 === 0 ? `https://www.credly.com/users/awssug-lead-${index + 1}` : null,
    }));
    await prisma.captainLead.createMany({ data: captainLeads, skipDuplicates: true });

    // Ensure every existing club has at least one lead. The relation remains
    // one-to-many, so additional leads can still be added for any club.
    const allClubs = await prisma.club.findMany({
        select: { id: true, clubName: true },
        orderBy: { createdAt: 'asc' },
    });
    let repairedClubCount = 0;
    for (const [index, club] of allClubs.entries()) {
        const existingLead = await prisma.captainLead.findFirst({
            where: { clubId: club.id },
            select: { id: true },
        });
        if (existingLead) continue;

        await prisma.captainLead.create({
            data: {
                lastName: `ClubLead${index + 1}`,
                firstName: club.clubName.slice(0, 40),
                clubId: club.id,
            },
        });
        repairedClubCount += 1;
    }

    const events = Array.from({ length: 100 }, (_, index) => {
        const startDate = new Date(Date.UTC(2026, index % 12, (index % 27) + 1, 8));
        const endDate = new Date(startDate);
        endDate.setUTCHours(17);
        return {
            id: id('30000000', index + 1),
            eventName: `AWSSUG PH Event ${String(index + 1).padStart(3, '0')}`,
            startDate,
            endDate,
            eventType: (['TECHNICAL', 'LEADERSHIP', 'SUSTAINABILITY', 'CAREER_GROWTH', 'DIVERSITY'] as const)[index % 5],
            expectedParticipants: 40 + (index % 461),
            location: index % 2 === 0 ? `Venue ${index + 1}` : 'Online',
            eventLink: index % 2 === 0 ? `https://example.com/events/${index + 1}` : null,
        };
    });
    await prisma.event.createMany({ data: events, skipDuplicates: true });

    const executives = Array.from({ length: 100 }, (_, index) => ({
        id: id('40000000', index + 1),
        lastName: `ExecutiveLastName${index + 1}`,
        firstName: `ExecutiveFirstName${index + 1}`,
        middleName: index % 2 === 0 ? `Middle${index + 1}` : null,
        clubId: clubs[index].id,
        email: `executive${index + 1}@example.com`,
        contactNumber: `0917${String(index + 1).padStart(7, '0')}`,
        birthdate: new Date(Date.UTC(1985 + (index % 20), index % 12, (index % 27) + 1)),
        department: (['EXECUTIVES', 'RESOURCE', 'OPERATIONS', 'TECHNOLOGY', 'RELATIONS', 'MULTIMEDIA', 'LEARNING_CLUBS', 'SKILL_BUILDERS', 'BUILDHERS_PLUS'] as const)[index % 9],
    }));
    await prisma.departmentExecutive.createMany({ data: executives, skipDuplicates: true });

    const budgetRequests = Array.from({ length: 100 }, (_, index) => ({
        id: id('50000000', index + 1),
        requesteeType: index % 5 === 0 ? 'NON_CLUB' as const : 'CLUB' as const,
        fullName: `Budget Requester ${index + 1}`,
        clubId: index % 5 === 0 ? null : clubs[index].id,
        nonClubOrgName: index % 5 === 0 ? `Partner Organization ${index + 1}` : null,
        eventId: events[index].id,
        participantTier: (['S', 'A', 'B', 'C'] as const)[index % 4],
        requestedAmount: 5000 + (index * 1250),
        budgetBreakdownUrl: `https://example.com/documents/budget-breakdown-${index + 1}.pdf`,
        officialRequestUrl: `https://example.com/documents/official-request-${index + 1}.pdf`,
        eventPrimerUrl: `https://example.com/documents/event-primer-${index + 1}.pdf`,
    }));
    await prisma.budgetRequest.createMany({ data: budgetRequests, skipDuplicates: true });

    const venueRequests = Array.from({ length: 100 }, (_, index) => ({
        id: id('60000000', index + 1),
        clubId: clubs[index].id,
        clubHeadId: captainLeads[index].id,
        eventId: events[index].id,
        projectProfileUrl: `https://example.com/documents/project-profile-${index + 1}.pdf`,
        reservationDate: events[index].startDate,
        startTime: new Date(Date.UTC(2026, index % 12, (index % 27) + 1, 8)),
        endTime: new Date(Date.UTC(2026, index % 12, (index % 27) + 1, 17)),
        floor: index % 2 === 0 ? 'FLOOR_15' as const : 'FLOOR_21' as const,
        numberOfPax: 20 + (index % 281),
    }));
    await prisma.venueRequest.createMany({ data: venueRequests, skipDuplicates: true });

    const tasks = Array.from({ length: 100 }, (_, index) => ({
        id: id('70000000', index + 1),
        taskName: `Resource Department Task ${index + 1}`,
        taskDetails: `Seeded task details for resource department workflow item ${index + 1}.`,
        assignedDate: new Date(Date.UTC(2026, index % 12, (index % 27) + 1)),
        deadline: new Date(Date.UTC(2026, (index + 1) % 12, ((index + 10) % 27) + 1)),
        assignedOffice: (['INFORMATION', 'ALLOCATION', 'WORKFORCE', 'ADMIN'] as const)[index % 4],
        status: (['PENDING', 'IN_PROGRESS', 'DONE'] as const)[index % 3],
    }));
    await prisma.task.createMany({ data: tasks, skipDuplicates: true });

    console.log(`Seed complete: 100 clubs, leads, executives, events, budget requests, venue requests, and tasks. Repaired ${repairedClubCount} clubs without a lead.`);
    console.log('Test password for seeded users: password123');
}

main()
    .catch((error) => {
        console.error(error);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
