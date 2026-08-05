import { Test, TestingModule } from '@nestjs/testing';
import { ForbiddenException, NotFoundException } from '@nestjs/common';
import { TasksService } from './tasks.service';
import { PrismaService } from '../../prisma/prisma.service';

describe('TasksService', () => {
    let service: TasksService;
    let prisma: {
        task: {
            create: jest.Mock;
            findMany: jest.Mock;
            findUnique: jest.Mock;
            update: jest.Mock;
            delete: jest.Mock;
        };
    };

    const mockTask = {
        id: '1',
        taskName: 'Prepare docs',
        taskDetails: 'Compile files',
        assignedDate: new Date('2024-08-01T00:00:00.000Z'),
        deadline: new Date('2024-08-10T00:00:00.000Z'),
        assignedOffice: 'WORKFORCE',
        status: 'PENDING',
        createdAt: new Date(),
    };

    beforeEach(async () => {
        prisma = {
            task: {
                create: jest.fn(),
                findMany: jest.fn(),
                findUnique: jest.fn(),
                update: jest.fn(),
                delete: jest.fn(),
            },
        };

        const module: TestingModule = await Test.createTestingModule({
            providers: [TasksService, { provide: PrismaService, useValue: prisma }],
        }).compile();

        service = module.get<TasksService>(TasksService);
    });

    describe('create', () => {
        // Verifies that task creation normalizes date strings before Prisma receives them.
        it('creates a task via prisma.task.create', async () => {
            prisma.task.create.mockResolvedValue(mockTask);

            const dto = {
                taskName: 'Prepare docs',
                taskDetails: 'Compile files',
                assignedDate: '2024-08-01T00:00:00.000Z',
                deadline: '2024-08-10T00:00:00.000Z',
                assignedOffice: 'WORKFORCE',
            } as any;

            const result = await service.create(dto);

            expect(prisma.task.create).toHaveBeenCalled();
            expect(result).toEqual(mockTask);
        });
    });

    describe('findAll', () => {
        // Verifies that admin users can view all tasks.
        it('returns all tasks for ADMIN role', async () => {
            prisma.task.findMany.mockResolvedValue([mockTask]);

            const result = await service.findAll('ADMIN');

            expect(prisma.task.findMany).toHaveBeenCalledWith({ orderBy: { createdAt: 'desc' } });
            expect(result).toEqual([mockTask]);
        });

        // Verifies that non-admin users only see tasks assigned to their office.
        it('returns filtered tasks for non-admin roles', async () => {
            prisma.task.findMany.mockResolvedValue([mockTask]);

            const result = await service.findAll('WORKFORCE');

            expect(prisma.task.findMany).toHaveBeenCalledWith({
                where: { assignedOffice: 'WORKFORCE' },
                orderBy: { createdAt: 'desc' },
            });
            expect(result).toEqual([mockTask]);
        });
    });

    describe('findOne', () => {
        // Verifies that admins can access any task.
        it('returns the task for ADMIN', async () => {
            prisma.task.findUnique.mockResolvedValue(mockTask);

            const result = await service.findOne('1', 'ADMIN');

            expect(result).toEqual(mockTask);
        });

        // Verifies that users cannot read tasks assigned to a different office.
        it('throws ForbiddenException when role does not match assignedOffice', async () => {
            prisma.task.findUnique.mockResolvedValue(mockTask);

            await expect(service.findOne('1', 'ALLOCATION')).rejects.toThrow(ForbiddenException);
        });

        // Verifies that missing tasks trigger a not-found error.
        it('throws NotFoundException when task does not exist', async () => {
            prisma.task.findUnique.mockResolvedValue(null);

            await expect(service.findOne('999', 'ADMIN')).rejects.toThrow(NotFoundException);
        });
    });

    describe('update', () => {
        // Verifies that update normalizes provided date fields.
        it('updates the task when it exists', async () => {
            prisma.task.findUnique.mockResolvedValue(mockTask);
            prisma.task.update.mockResolvedValue(mockTask);

            const dto = {
                deadline: '2024-08-12T00:00:00.000Z',
                status: 'IN_PROGRESS',
            } as any;

            const result = await service.update('1', dto);

            expect(prisma.task.update).toHaveBeenCalled();
            expect(result).toEqual(mockTask);
        });

        // Verifies that update fails when the task is missing.
        it('throws NotFoundException when updating a missing task', async () => {
            prisma.task.findUnique.mockResolvedValue(null);

            await expect(service.update('999', { status: 'DONE' } as any)).rejects.toThrow(NotFoundException);
        });
    });

    describe('remove', () => {
        // Verifies that an existing task is deleted.
        it('deletes the task when it exists', async () => {
            prisma.task.findUnique.mockResolvedValue(mockTask);
            prisma.task.delete.mockResolvedValue(mockTask);

            const result = await service.remove('1');

            expect(prisma.task.delete).toHaveBeenCalledWith({ where: { id: '1' } });
            expect(result).toEqual(mockTask);
        });

        // Verifies that delete fails when the task cannot be found.
        it('throws NotFoundException when task does not exist', async () => {
            prisma.task.findUnique.mockResolvedValue(null);

            await expect(service.remove('999')).rejects.toThrow(NotFoundException);
            expect(prisma.task.delete).not.toHaveBeenCalled();
        });
    });
});