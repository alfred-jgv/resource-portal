import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { DepartmentExecutivesService } from './department-executives.service';
import { PrismaService } from '../../prisma/prisma.service';

describe('DepartmentExecutivesService', () => {
    let service: DepartmentExecutivesService;
    let prisma: {
        club: {
            findUnique: jest.Mock;
        };
        departmentExecutive: {
            create: jest.Mock;
            findMany: jest.Mock;
            findUnique: jest.Mock;
            delete: jest.Mock;
        };
    };

    const mockDepartmentExecutive = {
        id: '1',
        firstName: 'Alex',
        lastName: 'Reyes',
        middleName: null,
        clubId: 'club-1',
        email: 'alex@example.com',
        contactNumber: '09171234567',
        birthdate: new Date('2000-01-01T00:00:00.000Z'),
        department: 'EXECUTIVES',
        createdAt: new Date(),
    };

    beforeEach(async () => {
        prisma = {
            club: {
                findUnique: jest.fn(),
            },
            departmentExecutive: {
                create: jest.fn(),
                findMany: jest.fn(),
                findUnique: jest.fn(),
                delete: jest.fn(),
            },
        };

        const module: TestingModule = await Test.createTestingModule({
            providers: [DepartmentExecutivesService, { provide: PrismaService, useValue: prisma }],
        }).compile();

        service = module.get<DepartmentExecutivesService>(DepartmentExecutivesService);
    });

    describe('create', () => {
        // Verifies that creation succeeds only after the club existence check passes.
        it('creates a department executive when the club exists', async () => {
            prisma.club.findUnique.mockResolvedValue({ id: 'club-1' });
            prisma.departmentExecutive.create.mockResolvedValue(mockDepartmentExecutive);

            const dto = {
                firstName: 'Alex',
                lastName: 'Reyes',
                clubId: 'club-1',
                email: 'alex@example.com',
                contactNumber: '09171234567',
                birthdate: '2000-01-01T00:00:00.000Z',
                department: 'EXECUTIVES',
            } as any;

            const result = await service.create(dto);

            expect(prisma.club.findUnique).toHaveBeenCalledWith({ where: { id: 'club-1' } });
            expect(prisma.departmentExecutive.create).toHaveBeenCalledWith({
                data: {
                    ...dto,
                    birthdate: new Date(dto.birthdate),
                },
            });
            expect(result).toEqual(mockDepartmentExecutive);
        });

        // Verifies that an invalid club id stops creation immediately.
        it('throws NotFoundException when the club does not exist', async () => {
            prisma.club.findUnique.mockResolvedValue(null);

            const dto = {
                firstName: 'Alex',
                lastName: 'Reyes',
                clubId: 'missing-club',
                email: 'alex@example.com',
                contactNumber: '09171234567',
                birthdate: '2000-01-01T00:00:00.000Z',
                department: 'EXECUTIVES',
            } as any;

            await expect(service.create(dto)).rejects.toThrow(NotFoundException);
            expect(prisma.departmentExecutive.create).not.toHaveBeenCalled();
        });
    });

    describe('findAll', () => {
        // Verifies that the service returns department executives ordered newest first.
        it('returns all department executives ordered by newest first', async () => {
            prisma.departmentExecutive.findMany.mockResolvedValue([mockDepartmentExecutive]);

            const result = await service.findAll();

            expect(prisma.departmentExecutive.findMany).toHaveBeenCalledWith({ orderBy: { createdAt: 'desc' } });
            expect(result).toEqual([mockDepartmentExecutive]);
        });
    });

    describe('findOne', () => {
        // Verifies that an existing department executive is returned by id.
        it('returns the department executive when found', async () => {
            prisma.departmentExecutive.findUnique.mockResolvedValue(mockDepartmentExecutive);

            const result = await service.findOne('1');

            expect(result).toEqual(mockDepartmentExecutive);
        });

        // Verifies that a missing department executive triggers a not-found error.
        it('throws NotFoundException when department executive does not exist', async () => {
            prisma.departmentExecutive.findUnique.mockResolvedValue(null);

            await expect(service.findOne('999')).rejects.toThrow(NotFoundException);
        });
    });

    describe('remove', () => {
        // Verifies that an existing department executive is deleted after lookup succeeds.
        it('deletes the department executive when it exists', async () => {
            prisma.departmentExecutive.findUnique.mockResolvedValue(mockDepartmentExecutive);
            prisma.departmentExecutive.delete.mockResolvedValue(mockDepartmentExecutive);

            const result = await service.remove('1');

            expect(prisma.departmentExecutive.delete).toHaveBeenCalledWith({ where: { id: '1' } });
            expect(result).toEqual(mockDepartmentExecutive);
        });

        // Verifies that delete is skipped when the department executive cannot be found.
        it('throws NotFoundException instead of deleting when department executive does not exist', async () => {
            prisma.departmentExecutive.findUnique.mockResolvedValue(null);

            await expect(service.remove('999')).rejects.toThrow(NotFoundException);
            expect(prisma.departmentExecutive.delete).not.toHaveBeenCalled();
        });
    });
});