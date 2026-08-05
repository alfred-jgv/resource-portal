import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateDepartmentExecutiveDto } from './dto/create-department-executive.dto';

@Injectable()
export class DepartmentExecutivesService {
    constructor(private prisma: PrismaService) { }

    /**
     * DOCU: Creates a department executive record after confirming the club exists.
     *
     * Last Updated: 2026-08-05
     * Author: Alfred
     * Last Updated By: Alfred
     */
    async create(dto: CreateDepartmentExecutiveDto) {
        const club = await this.prisma.club.findUnique({ where: { id: dto.clubId } });
        if (!club) throw new NotFoundException('Club not found');

        return this.prisma.departmentExecutive.create({
            data: {
                ...dto,
                birthdate: new Date(dto.birthdate),
            },
        });
    }

    /**
     * DOCU: Returns every department executive in the registry.
     *
     * Last Updated: 2026-08-05
     * Author: Alfred
     * Last Updated By: Alfred
     */
    findAll() {
        return this.prisma.departmentExecutive.findMany({ orderBy: { createdAt: 'desc' } });
    }

    /**
     * DOCU: Finds a single department executive by id.
     *
     * Last Updated: 2026-08-05
     * Author: Alfred
     * Last Updated By: Alfred
     */
    async findOne(id: string) {
        const departmentExecutive = await this.prisma.departmentExecutive.findUnique({ where: { id } });
        if (!departmentExecutive) throw new NotFoundException('Department executive not found');
        return departmentExecutive;
    }

    /**
     * DOCU: Deletes a department executive by id.
     *
     * Last Updated: 2026-08-05
     * Author: Alfred
     * Last Updated By: Alfred
     */
    async remove(id: string) {
        await this.findOne(id);
        return this.prisma.departmentExecutive.delete({ where: { id } });
    }
}