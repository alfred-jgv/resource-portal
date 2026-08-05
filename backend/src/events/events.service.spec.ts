import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { EventsService } from './events.service';
import { PrismaService } from '../../prisma/prisma.service';

describe('EventsService', () => {
    let service: EventsService;
    let prisma: {
        event: {
            create: jest.Mock;
            findMany: jest.Mock;
            findUnique: jest.Mock;
            delete: jest.Mock;
        };
    };

    const mockEvent = {
        id: '1',
        eventName: 'Annual Summit',
        startDate: new Date('2024-05-01T00:00:00.000Z'),
        endDate: new Date('2024-05-02T00:00:00.000Z'),
        eventType: 'TECHNICAL',
        expectedParticipants: 100,
        location: 'Main Hall',
        eventLink: null,
        createdAt: new Date(),
    };

    beforeEach(async () => {
        prisma = {
            event: {
                create: jest.fn(),
                findMany: jest.fn(),
                findUnique: jest.fn(),
                delete: jest.fn(),
            },
        };

        const module: TestingModule = await Test.createTestingModule({
            providers: [EventsService, { provide: PrismaService, useValue: prisma }],
        }).compile();

        service = module.get<EventsService>(EventsService);
    });

    describe('create', () => {
        // Verifies that creation normalizes date strings before Prisma receives them.
        it('creates an event via prisma.event.create', async () => {
            prisma.event.create.mockResolvedValue(mockEvent);

            const dto = {
                eventName: 'Annual Summit',
                startDate: '2024-05-01T00:00:00.000Z',
                endDate: '2024-05-02T00:00:00.000Z',
                eventType: 'TECHNICAL',
                expectedParticipants: 100,
                location: 'Main Hall',
            } as any;

            const result = await service.create(dto);

            expect(prisma.event.create).toHaveBeenCalledWith({
                data: {
                    ...dto,
                    startDate: new Date(dto.startDate),
                    endDate: new Date(dto.endDate),
                },
            });
            expect(result).toEqual(mockEvent);
        });
    });

    describe('findAll', () => {
        // Verifies that the service returns events ordered newest first.
        it('returns all events ordered by newest first', async () => {
            prisma.event.findMany.mockResolvedValue([mockEvent]);

            const result = await service.findAll();

            expect(prisma.event.findMany).toHaveBeenCalledWith({ orderBy: { createdAt: 'desc' } });
            expect(result).toEqual([mockEvent]);
        });
    });

    describe('findOne', () => {
        // Verifies that an existing event is returned by id.
        it('returns the event when found', async () => {
            prisma.event.findUnique.mockResolvedValue(mockEvent);

            const result = await service.findOne('1');

            expect(result).toEqual(mockEvent);
        });

        // Verifies that a missing event triggers a not-found error.
        it('throws NotFoundException when event does not exist', async () => {
            prisma.event.findUnique.mockResolvedValue(null);

            await expect(service.findOne('999')).rejects.toThrow(NotFoundException);
        });
    });

    describe('remove', () => {
        // Verifies that an existing event is deleted after lookup succeeds.
        it('deletes the event when it exists', async () => {
            prisma.event.findUnique.mockResolvedValue(mockEvent);
            prisma.event.delete.mockResolvedValue(mockEvent);

            const result = await service.remove('1');

            expect(prisma.event.delete).toHaveBeenCalledWith({ where: { id: '1' } });
            expect(result).toEqual(mockEvent);
        });

        // Verifies that delete is skipped when the event cannot be found.
        it('throws NotFoundException instead of deleting when event does not exist', async () => {
            prisma.event.findUnique.mockResolvedValue(null);

            await expect(service.remove('999')).rejects.toThrow(NotFoundException);
            expect(prisma.event.delete).not.toHaveBeenCalled();
        });
    });
});