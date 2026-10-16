import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateCaptainLeadDto } from './dto/create-captain-lead.dto';

@Injectable()
export class CaptainLeadsService {
    constructor(private prisma: PrismaService) { }

    /**
     * DOCU: Creates a new captain lead record after confirming the club exists.
     *
     * Last Updated: 2026-08-05
     * Author: Alfred
     * Last Updated By: Alfred
     */
    async create(dto: CreateCaptainLeadDto) {
        const club = await this.prisma.club.findUnique({ where: { id: dto.clubId } });
        if (!club) throw new NotFoundException('Club not found');

        return this.prisma.captainLead.create({ data: dto });
    }

    /**
     * DOCU: Returns every captain lead in the registry.
     *
     * Last Updated: 2026-08-05
     * Author: Alfred
     * Last Updated By: Alfred
     */
    findAll() {
        return this.prisma.captainLead.findMany({ orderBy: { createdAt: 'desc' } });
    }

    findPublicOptions() {
        return this.prisma.captainLead.findMany({
            select: { id: true, firstName: true, lastName: true, clubId: true },
            orderBy: [{ lastName: 'asc' }, { firstName: 'asc' }],
        });
    }

    /**
     * DOCU: Finds a single captain lead by id.
     *
     * Last Updated: 2026-08-05
     * Author: Alfred
     * Last Updated By: Alfred
     */
    async findOne(id: string) {
        const captainLead = await this.prisma.captainLead.findUnique({ where: { id } });
        if (!captainLead) throw new NotFoundException('Captain lead not found');
        return captainLead;
    }

    /**
     * DOCU: Deletes a captain lead by id.
     *
     * Last Updated: 2026-08-05
     * Author: Alfred
     * Last Updated By: Alfred
     */
    async remove(id: string) {
        await this.findOne(id);
        return this.prisma.captainLead.delete({ where: { id } });
    }
}