import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { VenueRequestsService } from './venue-requests.service';
import { PrismaService } from '../../prisma/prisma.service';

describe('VenueRequestsService', () => {
    let service: VenueRequestsService;
    let prisma: {
        club: {
            findUnique: jest.Mock;
        };
        captainLead: {
            findUnique: jest.Mock;
        };
        event: {
            findUnique: jest.Mock;
        };
        venueRequest: {
            create: jest.Mock;
            findMany: jest.Mock;
            findUnique: jest.Mock;
            delete: jest.Mock;
        };
    };

    const mockVenueRequest = {
        id: '1',
        clubId: 'club-1',
        clubHeadId: 'head-1',
        eventId: 'event-1',
        projectProfileUrl: 'https://example.com/profile.pdf',
        reservationDate: new Date('2024-09-01T00:00:00.000Z'),
        startTime: new Date('2024-09-01T08:00:00.000Z'),
        endTime: new Date('2024-09-01T10:00:00.000Z'),
        floor: 'FLOOR_15',
        numberOfPax: 50,
        createdAt: new Date(),
    };

    beforeEach(async () => {
        prisma = {
            club: {
                findUnique: jest.fn(),
            },
            captainLead: {
                findUnique: jest.fn(),
            },
            event: {
                findUnique: jest.fn(),
            },
            venueRequest: {
                create: jest.fn(),
                findMany: jest.fn(),
                findUnique: jest.fn(),
                delete: jest.fn(),
            },
        };

        const module: TestingModule = await Test.createTestingModule({
            providers: [VenueRequestsService, { provide: PrismaService, useValue: prisma }],
        }).compile();

        service = module.get<VenueRequestsService>(VenueRequestsService);
        process.env.SUPABASE_URL = 'https://project.supabase.co';
        process.env.SUPABASE_SERVICE_ROLE_KEY = 'service-role-key';
        process.env.SUPABASE_STORAGE_BUCKET = 'documents';
        jest.spyOn(globalThis, 'fetch').mockResolvedValue({ ok: true } as any);
    });

    afterEach(() => {
        jest.restoreAllMocks();
    });

    describe('create', () => {
        // Verifies that creation validates relations and uploads the project profile PDF.
        it('creates a venue request when all referenced entities exist', async () => {
            prisma.club.findUnique.mockResolvedValue({ id: 'club-1' });
            prisma.captainLead.findUnique.mockResolvedValue({ id: 'head-1', clubId: 'club-1' });
            prisma.event.findUnique.mockResolvedValue({ id: 'event-1' });
            prisma.venueRequest.create.mockResolvedValue(mockVenueRequest);

            const file = {
                mimetype: 'application/pdf',
                originalname: 'profile.pdf',
                buffer: Buffer.from('pdf'),
            };

            const dto = {
                clubId: 'club-1',
                clubHeadId: 'head-1',
                eventId: 'event-1',
                reservationDate: '2024-09-01T00:00:00.000Z',
                startTime: '2024-09-01T08:00:00.000Z',
                endTime: '2024-09-01T10:00:00.000Z',
                floor: 'FLOOR_15',
                numberOfPax: 50,
            } as any;

            const result = await service.create(dto, { projectProfile: [file] });

            expect(fetch).toHaveBeenCalledTimes(1);
            expect(prisma.venueRequest.create).toHaveBeenCalled();
            expect(result).toEqual(mockVenueRequest);
        });

        // Verifies that mismatched captain lead and club combinations are rejected.
        it('throws BadRequestException when clubHeadId belongs to a different club', async () => {
            prisma.club.findUnique.mockResolvedValue({ id: 'club-1' });
            prisma.captainLead.findUnique.mockResolvedValue({ id: 'head-1', clubId: 'club-2' });
            prisma.event.findUnique.mockResolvedValue({ id: 'event-1' });

            const dto = {
                clubId: 'club-1',
                clubHeadId: 'head-1',
                eventId: 'event-1',
                reservationDate: '2024-09-01T00:00:00.000Z',
                startTime: '2024-09-01T08:00:00.000Z',
                endTime: '2024-09-01T10:00:00.000Z',
                floor: 'FLOOR_15',
                numberOfPax: 50,
            } as any;

            await expect(service.create(dto, {} as any)).rejects.toThrow(BadRequestException);
        });

        // Verifies that missing references are rejected.
        it('throws NotFoundException when event does not exist', async () => {
            prisma.club.findUnique.mockResolvedValue({ id: 'club-1' });
            prisma.captainLead.findUnique.mockResolvedValue({ id: 'head-1', clubId: 'club-1' });
            prisma.event.findUnique.mockResolvedValue(null);

            const dto = {
                clubId: 'club-1',
                clubHeadId: 'head-1',
                eventId: 'event-1',
                reservationDate: '2024-09-01T00:00:00.000Z',
                startTime: '2024-09-01T08:00:00.000Z',
                endTime: '2024-09-01T10:00:00.000Z',
                floor: 'FLOOR_15',
                numberOfPax: 50,
            } as any;

            await expect(service.create(dto, {} as any)).rejects.toThrow(NotFoundException);
        });
    });

    describe('findAll', () => {
        // Verifies that the service returns venue requests ordered newest first.
        it('returns all venue requests ordered by newest first', async () => {
            prisma.venueRequest.findMany.mockResolvedValue([mockVenueRequest]);

            const result = await service.findAll();

            expect(prisma.venueRequest.findMany).toHaveBeenCalledWith({ orderBy: { createdAt: 'desc' } });
            expect(result).toEqual([mockVenueRequest]);
        });
    });

    describe('findOne', () => {
        // Verifies that an existing venue request is returned by id.
        it('returns the venue request when found', async () => {
            prisma.venueRequest.findUnique.mockResolvedValue(mockVenueRequest);

            const result = await service.findOne('1');

            expect(result).toEqual(mockVenueRequest);
        });

        // Verifies that a missing venue request triggers a not-found error.
        it('throws NotFoundException when venue request does not exist', async () => {
            prisma.venueRequest.findUnique.mockResolvedValue(null);

            await expect(service.findOne('999')).rejects.toThrow(NotFoundException);
        });
    });

    describe('remove', () => {
        // Verifies that an existing venue request is deleted after lookup succeeds.
        it('deletes the venue request when it exists', async () => {
            prisma.venueRequest.findUnique.mockResolvedValue(mockVenueRequest);
            prisma.venueRequest.delete.mockResolvedValue(mockVenueRequest);

            const result = await service.remove('1');

            expect(prisma.venueRequest.delete).toHaveBeenCalledWith({ where: { id: '1' } });
            expect(result).toEqual(mockVenueRequest);
        });

        // Verifies that delete is skipped when the venue request cannot be found.
        it('throws NotFoundException instead of deleting when venue request does not exist', async () => {
            prisma.venueRequest.findUnique.mockResolvedValue(null);

            await expect(service.remove('999')).rejects.toThrow(NotFoundException);
            expect(prisma.venueRequest.delete).not.toHaveBeenCalled();
        });
    });
});