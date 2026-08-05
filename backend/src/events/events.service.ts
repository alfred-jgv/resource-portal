import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateEventDto } from './dto/create-event.dto';

@Injectable()
export class EventsService {
    constructor(private prisma: PrismaService) { }

    /**
     * DOCU: Creates a new event record and normalizes date strings into Date objects.
     *
     * Last Updated: 2026-08-05
     * Author: Alfred
     * Last Updated By: Alfred
     */
    create(dto: CreateEventDto) {
        return this.prisma.event.create({
            data: {
                ...dto,
                startDate: new Date(dto.startDate),
                endDate: new Date(dto.endDate),
            },
        });
    }

    /**
     * DOCU: Returns every event in the registry.
     *
     * Last Updated: 2026-08-05
     * Author: Alfred
     * Last Updated By: Alfred
     */
    findAll() {
        return this.prisma.event.findMany({ orderBy: { createdAt: 'desc' } });
    }

    /**
     * DOCU: Finds a single event by id.
     *
     * Last Updated: 2026-08-05
     * Author: Alfred
     * Last Updated By: Alfred
     */
    async findOne(id: string) {
        const event = await this.prisma.event.findUnique({ where: { id } });
        if (!event) throw new NotFoundException('Event not found');
        return event;
    }

    /**
     * DOCU: Deletes an event by id.
     *
     * Last Updated: 2026-08-05
     * Author: Alfred
     * Last Updated By: Alfred
     */
    async remove(id: string) {
        await this.findOne(id);
        return this.prisma.event.delete({ where: { id } });
    }
}