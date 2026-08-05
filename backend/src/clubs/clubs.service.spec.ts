import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { ClubsService } from './clubs.service';
import { PrismaService } from '../../prisma/prisma.service';

describe('ClubsService', () => {
    let service: ClubsService;
    let prisma: {
        club: {
            create: jest.Mock;
            findMany: jest.Mock;
            findUnique: jest.Mock;
            delete: jest.Mock;
        };
    };

    const mockClub = {
        id: '1',
        clubName: 'Test Builders Club',
        universityName: 'Test University',
        clubType: 'STUDENT_BUILDER_GROUP',
        establishmentDate: new Date('2024-01-15'),
        memberCount: 25,
        islandGroup: 'LUZON',
        region: 'Region IV-A',
        province: 'Laguna',
        createdAt: new Date(),
    };

    beforeEach(async () => {
        prisma = {
            club: {
                create: jest.fn(),
                findMany: jest.fn(),
                findUnique: jest.fn(),
                delete: jest.fn(),
            },
        };

        const module: TestingModule = await Test.createTestingModule({
            providers: [ClubsService, { provide: PrismaService, useValue: prisma }],
        }).compile();

        service = module.get<ClubsService>(ClubsService);
    });

    describe('create', () => {
        // Verifies that a club is created through Prisma with the validated data.
        it('creates a club via prisma.club.create', async () => {
            prisma.club.create.mockResolvedValue(mockClub);

            const dto = {
                clubName: 'Test Builders Club',
                universityName: 'Test University',
                clubType: 'STUDENT_BUILDER_GROUP',
                establishmentDate: '2024-01-15',
                memberCount: 25,
                islandGroup: 'LUZON',
                region: 'Region IV-A',
                province: 'Laguna',
            } as any;

            const result = await service.create(dto);

            expect(prisma.club.create).toHaveBeenCalledWith({ data: dto });
            expect(result).toEqual(mockClub);
        });
    });

    describe('findAll', () => {
        // Verifies that the service returns clubs ordered newest first.
        it('returns all clubs ordered by newest first', async () => {
            prisma.club.findMany.mockResolvedValue([mockClub]);

            const result = await service.findAll();

            expect(prisma.club.findMany).toHaveBeenCalledWith({ orderBy: { createdAt: 'desc' } });
            expect(result).toEqual([mockClub]);
        });
    });

    describe('findOne', () => {
        // Verifies that an existing club is returned by id.
        it('returns the club when found', async () => {
            prisma.club.findUnique.mockResolvedValue(mockClub);

            const result = await service.findOne('1');

            expect(result).toEqual(mockClub);
        });

        // Verifies that a missing club triggers a not-found error.
        it('throws NotFoundException when club does not exist', async () => {
            prisma.club.findUnique.mockResolvedValue(null);

            await expect(service.findOne('999')).rejects.toThrow(NotFoundException);
        });
    });

    describe('remove', () => {
        // Verifies that an existing club is deleted after lookup succeeds.
        it('deletes the club when it exists', async () => {
            prisma.club.findUnique.mockResolvedValue(mockClub);
            prisma.club.delete.mockResolvedValue(mockClub);

            const result = await service.remove('1');

            expect(prisma.club.delete).toHaveBeenCalledWith({ where: { id: '1' } });
            expect(result).toEqual(mockClub);
        });

        // Verifies that delete is skipped when the club cannot be found.
        it('throws NotFoundException instead of deleting when club does not exist', async () => {
            prisma.club.findUnique.mockResolvedValue(null);

            await expect(service.remove('999')).rejects.toThrow(NotFoundException);
            expect(prisma.club.delete).not.toHaveBeenCalled();
        });
    });
});