import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { BudgetRequestsService } from './budget-requests.service';
import { PrismaService } from '../../prisma/prisma.service';

describe('BudgetRequestsService', () => {
    let service: BudgetRequestsService;
    let prisma: {
        club: {
            findUnique: jest.Mock;
        };
        event: {
            findUnique: jest.Mock;
        };
        budgetRequest: {
            create: jest.Mock;
            findMany: jest.Mock;
            findUnique: jest.Mock;
            delete: jest.Mock;
        };
    };

    const mockBudgetRequest = {
        id: '1',
        requesteeType: 'CLUB',
        fullName: 'Test User',
        clubId: 'club-1',
        nonClubOrgName: null,
        eventId: 'event-1',
        participantTier: 'A',
        requestedAmount: '1000.00',
        budgetBreakdownUrl: 'https://example.com/budget.pdf',
        officialRequestUrl: 'https://example.com/official.pdf',
        eventPrimerUrl: 'https://example.com/primer.pdf',
        createdAt: new Date(),
    };

    beforeEach(async () => {
        prisma = {
            club: {
                findUnique: jest.fn(),
            },
            event: {
                findUnique: jest.fn(),
            },
            budgetRequest: {
                create: jest.fn(),
                findMany: jest.fn(),
                findUnique: jest.fn(),
                delete: jest.fn(),
            },
        };

        const module: TestingModule = await Test.createTestingModule({
            providers: [BudgetRequestsService, { provide: PrismaService, useValue: prisma }],
        }).compile();

        service = module.get<BudgetRequestsService>(BudgetRequestsService);
        process.env.SUPABASE_URL = 'https://project.supabase.co';
        process.env.SUPABASE_SERVICE_ROLE_KEY = 'service-role-key';
        process.env.SUPABASE_STORAGE_BUCKET = 'documents';
        jest.spyOn(globalThis, 'fetch').mockResolvedValue({ ok: true } as any);
    });

    afterEach(() => {
        jest.restoreAllMocks();
    });

    describe('create', () => {
        // Verifies that creation validates relations and uploads the provided PDFs.
        it('creates a budget request when the club and event exist', async () => {
            prisma.event.findUnique.mockResolvedValue({ id: 'event-1' });
            prisma.club.findUnique.mockResolvedValue({ id: 'club-1' });
            prisma.budgetRequest.create.mockResolvedValue(mockBudgetRequest);

            const file = {
                mimetype: 'application/pdf',
                originalname: 'file.pdf',
                buffer: Buffer.from('pdf'),
            };

            const dto = {
                requesteeType: 'CLUB',
                fullName: 'Test User',
                clubId: 'club-1',
                eventId: 'event-1',
                participantTier: 'A',
                requestedAmount: '1000.00',
            } as any;

            const result = await service.create(dto, {
                budgetBreakdown: [file],
                officialRequest: [file],
                eventPrimer: [file],
            });

            expect(prisma.event.findUnique).toHaveBeenCalledWith({ where: { id: 'event-1' } });
            expect(prisma.club.findUnique).toHaveBeenCalledWith({ where: { id: 'club-1' } });
            expect(fetch).toHaveBeenCalledTimes(3);
            expect(prisma.budgetRequest.create).toHaveBeenCalled();
            expect(result).toEqual(mockBudgetRequest);
        });

        // Verifies that requestee rules are enforced before upload or database writes.
        it('throws BadRequestException when NON_CLUB includes clubId', async () => {
            const dto = {
                requesteeType: 'NON_CLUB',
                fullName: 'Test User',
                clubId: 'club-1',
                nonClubOrgName: 'Org',
                eventId: 'event-1',
                participantTier: 'A',
                requestedAmount: '1000.00',
            } as any;

            await expect(service.create(dto, {} as any)).rejects.toThrow(BadRequestException);
            expect(prisma.budgetRequest.create).not.toHaveBeenCalled();
        });

        // Verifies that missing related records are rejected.
        it('throws NotFoundException when the event does not exist', async () => {
            prisma.event.findUnique.mockResolvedValue(null);

            const dto = {
                requesteeType: 'CLUB',
                fullName: 'Test User',
                clubId: 'club-1',
                eventId: 'event-1',
                participantTier: 'A',
                requestedAmount: '1000.00',
            } as any;

            await expect(service.create(dto, {} as any)).rejects.toThrow(NotFoundException);
        });
    });

    describe('findAll', () => {
        // Verifies that the service returns budget requests ordered newest first.
        it('returns all budget requests ordered by newest first', async () => {
            prisma.budgetRequest.findMany.mockResolvedValue([mockBudgetRequest]);

            const result = await service.findAll();

            expect(prisma.budgetRequest.findMany).toHaveBeenCalledWith({ orderBy: { createdAt: 'desc' } });
            expect(result).toEqual([mockBudgetRequest]);
        });
    });

    describe('findOne', () => {
        // Verifies that an existing budget request is returned by id.
        it('returns the budget request when found', async () => {
            prisma.budgetRequest.findUnique.mockResolvedValue(mockBudgetRequest);

            const result = await service.findOne('1');

            expect(result).toEqual(mockBudgetRequest);
        });

        // Verifies that a missing budget request triggers a not-found error.
        it('throws NotFoundException when budget request does not exist', async () => {
            prisma.budgetRequest.findUnique.mockResolvedValue(null);

            await expect(service.findOne('999')).rejects.toThrow(NotFoundException);
        });
    });

    describe('remove', () => {
        // Verifies that an existing budget request is deleted after lookup succeeds.
        it('deletes the budget request when it exists', async () => {
            prisma.budgetRequest.findUnique.mockResolvedValue(mockBudgetRequest);
            prisma.budgetRequest.delete.mockResolvedValue(mockBudgetRequest);

            const result = await service.remove('1');

            expect(prisma.budgetRequest.delete).toHaveBeenCalledWith({ where: { id: '1' } });
            expect(result).toEqual(mockBudgetRequest);
        });

        // Verifies that delete is skipped when the budget request cannot be found.
        it('throws NotFoundException instead of deleting when budget request does not exist', async () => {
            prisma.budgetRequest.findUnique.mockResolvedValue(null);

            await expect(service.remove('999')).rejects.toThrow(NotFoundException);
            expect(prisma.budgetRequest.delete).not.toHaveBeenCalled();
        });
    });
});