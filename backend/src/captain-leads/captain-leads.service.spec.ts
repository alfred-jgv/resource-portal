import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { CaptainLeadsService } from './captain-leads.service';
import { PrismaService } from '../../prisma/prisma.service';

describe('CaptainLeadsService', () => {
    let service: CaptainLeadsService;
    let prisma: {
        club: {
            findUnique: jest.Mock;
        };
        captainLead: {
            create: jest.Mock;
            findMany: jest.Mock;
            findUnique: jest.Mock;
            delete: jest.Mock;
        };
    };

    const mockCaptainLead = {
        id: '1',
        firstName: 'Jane',
        lastName: 'Doe',
        middleName: null,
        clubId: 'club-1',
        linkedinUrl: null,
        credlyUrl: null,
        createdAt: new Date(),
    };

    beforeEach(async () => {
        prisma = {
            club: {
                findUnique: jest.fn(),
            },
            captainLead: {
                create: jest.fn(),
                findMany: jest.fn(),
                findUnique: jest.fn(),
                delete: jest.fn(),
            },
        };

        const module: TestingModule = await Test.createTestingModule({
            providers: [CaptainLeadsService, { provide: PrismaService, useValue: prisma }],
        }).compile();

        service = module.get<CaptainLeadsService>(CaptainLeadsService);
    });

    describe('create', () => {
        // Verifies that creation succeeds only after the club existence check passes.
        it('creates a captain lead when the club exists', async () => {
            prisma.club.findUnique.mockResolvedValue({ id: 'club-1' });
            prisma.captainLead.create.mockResolvedValue(mockCaptainLead);

            const dto = {
                firstName: 'Jane',
                lastName: 'Doe',
                clubId: 'club-1',
            } as any;

            const result = await service.create(dto);

            expect(prisma.club.findUnique).toHaveBeenCalledWith({ where: { id: 'club-1' } });
            expect(prisma.captainLead.create).toHaveBeenCalledWith({ data: dto });
            expect(result).toEqual(mockCaptainLead);
        });

        // Verifies that an invalid club id stops creation immediately.
        it('throws NotFoundException when the club does not exist', async () => {
            prisma.club.findUnique.mockResolvedValue(null);

            const dto = {
                firstName: 'Jane',
                lastName: 'Doe',
                clubId: 'missing-club',
            } as any;

            await expect(service.create(dto)).rejects.toThrow(NotFoundException);
            expect(prisma.captainLead.create).not.toHaveBeenCalled();
        });
    });

    describe('findAll', () => {
        // Verifies that the service returns captain leads ordered newest first.
        it('returns all captain leads ordered by newest first', async () => {
            prisma.captainLead.findMany.mockResolvedValue([mockCaptainLead]);

            const result = await service.findAll();

            expect(prisma.captainLead.findMany).toHaveBeenCalledWith({ orderBy: { createdAt: 'desc' } });
            expect(result).toEqual([mockCaptainLead]);
        });
    });

    describe('findOne', () => {
        // Verifies that an existing captain lead is returned by id.
        it('returns the captain lead when found', async () => {
            prisma.captainLead.findUnique.mockResolvedValue(mockCaptainLead);

            const result = await service.findOne('1');

            expect(result).toEqual(mockCaptainLead);
        });

        // Verifies that a missing captain lead triggers a not-found error.
        it('throws NotFoundException when captain lead does not exist', async () => {
            prisma.captainLead.findUnique.mockResolvedValue(null);

            await expect(service.findOne('999')).rejects.toThrow(NotFoundException);
        });
    });

    describe('remove', () => {
        // Verifies that an existing captain lead is deleted after lookup succeeds.
        it('deletes the captain lead when it exists', async () => {
            prisma.captainLead.findUnique.mockResolvedValue(mockCaptainLead);
            prisma.captainLead.delete.mockResolvedValue(mockCaptainLead);

            const result = await service.remove('1');

            expect(prisma.captainLead.delete).toHaveBeenCalledWith({ where: { id: '1' } });
            expect(result).toEqual(mockCaptainLead);
        });

        // Verifies that delete is skipped when the captain lead cannot be found.
        it('throws NotFoundException instead of deleting when captain lead does not exist', async () => {
            prisma.captainLead.findUnique.mockResolvedValue(null);

            await expect(service.remove('999')).rejects.toThrow(NotFoundException);
            expect(prisma.captainLead.delete).not.toHaveBeenCalled();
        });
    });
});