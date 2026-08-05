import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { Role } from '../../generated/prisma/client';

@Injectable()
export class TasksService {
    constructor(private prisma: PrismaService) { }

    /**
     * DOCU: Creates a new task.
     *
     * Last Updated: 2026-08-05
     * Author: Alfred
     * Last Updated By: Alfred
     */
    create(dto: CreateTaskDto) {
        return this.prisma.task.create({
            data: {
                ...dto,
                assignedDate: new Date(dto.assignedDate),
                deadline: new Date(dto.deadline),
            },
        });
    }

    /**
     * DOCU: Returns tasks visible to the current office role.
     *
     * Last Updated: 2026-08-05
     * Author: Alfred
     * Last Updated By: Alfred
     */
    findAll(currentRole: Role | string) {
        if (currentRole === Role.ADMIN) {
            return this.prisma.task.findMany({ orderBy: { createdAt: 'desc' } });
        }

        return this.prisma.task.findMany({
            where: { assignedOffice: currentRole as Role },
            orderBy: { createdAt: 'desc' },
        });
    }

    /**
     * DOCU: Finds one task and enforces role-based visibility.
     *
     * Last Updated: 2026-08-05
     * Author: Alfred
     * Last Updated By: Alfred
     */
    async findOne(id: string, currentRole: Role | string) {
        const task = await this.prisma.task.findUnique({ where: { id } });
        if (!task) throw new NotFoundException('Task not found');

        if (currentRole !== Role.ADMIN && task.assignedOffice !== currentRole) {
            throw new ForbiddenException('You do not have access to this task');
        }

        return task;
    }

    /**
     * DOCU: Updates a task by id.
     *
     * Last Updated: 2026-08-05
     * Author: Alfred
     * Last Updated By: Alfred
     */
    async update(id: string, dto: UpdateTaskDto) {
        await this.ensureExists(id);

        return this.prisma.task.update({
            where: { id },
            data: {
                ...dto,
                assignedDate: dto.assignedDate ? new Date(dto.assignedDate) : undefined,
                deadline: dto.deadline ? new Date(dto.deadline) : undefined,
            },
        });
    }

    /**
     * DOCU: Deletes a task by id.
     *
     * Last Updated: 2026-08-05
     * Author: Alfred
     * Last Updated By: Alfred
     */
    async remove(id: string) {
        await this.ensureExists(id);
        return this.prisma.task.delete({ where: { id } });
    }

    private async ensureExists(id: string) {
        const task = await this.prisma.task.findUnique({ where: { id } });
        if (!task) throw new NotFoundException('Task not found');
        return task;
    }
}