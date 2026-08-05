import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { Floor } from '../../generated/prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateVenueRequestDto } from './dto/create-venue-request.dto';
import { randomUUID } from 'crypto';

type UploadFile = {
    mimetype: string;
    originalname: string;
    buffer: Buffer;
};

type VenueRequestUploadFiles = {
    projectProfile?: UploadFile[];
};

@Injectable()
export class VenueRequestsService {
    constructor(private prisma: PrismaService) { }

    /**
     * DOCU: Creates a venue request after relation checks and uploads the project profile PDF.
     *
     * Last Updated: 2026-08-05
     * Author: Alfred
     * Last Updated By: Alfred
     */
    async create(dto: CreateVenueRequestDto, files: VenueRequestUploadFiles) {
        const [club, clubHead, event] = await Promise.all([
            this.prisma.club.findUnique({ where: { id: dto.clubId } }),
            this.prisma.captainLead.findUnique({ where: { id: dto.clubHeadId } }),
            this.prisma.event.findUnique({ where: { id: dto.eventId } }),
        ]);

        if (!club) throw new NotFoundException('Club not found');
        if (!clubHead) throw new NotFoundException('Captain lead not found');
        if (!event) throw new NotFoundException('Event not found');

        if (clubHead.clubId !== dto.clubId) {
            throw new BadRequestException('clubHeadId does not belong to the provided clubId');
        }

        const projectProfileUrl = await this.uploadRequiredPdf(files.projectProfile?.[0], 'project-profile');

        return this.prisma.venueRequest.create({
            data: {
                clubId: dto.clubId,
                clubHeadId: dto.clubHeadId,
                eventId: dto.eventId,
                projectProfileUrl,
                reservationDate: new Date(dto.reservationDate),
                startTime: new Date(dto.startTime),
                endTime: new Date(dto.endTime),
                floor: dto.floor,
                numberOfPax: dto.numberOfPax,
            },
        });
    }

    /**
     * DOCU: Returns every venue request in the registry.
     *
     * Last Updated: 2026-08-05
     * Author: Alfred
     * Last Updated By: Alfred
     */
    findAll() {
        return this.prisma.venueRequest.findMany({ orderBy: { createdAt: 'desc' } });
    }

    /**
     * DOCU: Finds a single venue request by id.
     *
     * Last Updated: 2026-08-05
     * Author: Alfred
     * Last Updated By: Alfred
     */
    async findOne(id: string) {
        const venueRequest = await this.prisma.venueRequest.findUnique({ where: { id } });
        if (!venueRequest) throw new NotFoundException('Venue request not found');
        return venueRequest;
    }

    /**
     * DOCU: Deletes a venue request by id.
     *
     * Last Updated: 2026-08-05
     * Author: Alfred
     * Last Updated By: Alfred
     */
    async remove(id: string) {
        await this.findOne(id);
        return this.prisma.venueRequest.delete({ where: { id } });
    }

    private async uploadRequiredPdf(file: UploadFile | undefined, prefix: string) {
        if (!file) {
            throw new BadRequestException(`${prefix} file is required`);
        }

        if (file.mimetype !== 'application/pdf') {
            throw new BadRequestException(`${prefix} must be a PDF file`);
        }

        const supabaseUrl = process.env.SUPABASE_URL;
        const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
        const supabaseBucket = process.env.SUPABASE_STORAGE_BUCKET || 'documents';

        if (!supabaseUrl || !supabaseServiceRoleKey) {
            throw new BadRequestException('Supabase storage is not configured');
        }

        const path = `${prefix}/${randomUUID()}-${file.originalname.replace(/[^a-zA-Z0-9._-]/g, '_')}`;
        const response = await fetch(`${supabaseUrl}/storage/v1/object/${supabaseBucket}/${path}`, {
            method: 'POST',
            headers: {
                Authorization: `Bearer ${supabaseServiceRoleKey}`,
                apikey: supabaseServiceRoleKey,
                'Content-Type': file.mimetype,
                'x-upsert': 'true',
            },
            body: new Uint8Array(file.buffer),
        });

        if (!response.ok) {
            throw new BadRequestException(`Failed to upload ${prefix} file`);
        }

        return `${supabaseUrl}/storage/v1/object/public/${supabaseBucket}/${path}`;
    }
}