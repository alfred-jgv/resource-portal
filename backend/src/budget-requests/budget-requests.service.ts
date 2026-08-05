import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { Prisma, RequesteeType } from '../../generated/prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateBudgetRequestDto } from './dto/create-budget-request.dto';
import { randomUUID } from 'crypto';

type UploadFile = {
    mimetype: string;
    originalname: string;
    buffer: Buffer;
};

type BudgetRequestUploadFiles = {
    budgetBreakdown?: UploadFile[];
    officialRequest?: UploadFile[];
    eventPrimer?: UploadFile[];
};

@Injectable()
export class BudgetRequestsService {
    constructor(private prisma: PrismaService) { }

    /**
     * DOCU: Creates a new budget request after validating cross-field rules and uploading files to Supabase Storage.
     *
     * Last Updated: 2026-08-05
     * Author: Alfred
     * Last Updated By: Alfred
     */
    async create(dto: CreateBudgetRequestDto, files: BudgetRequestUploadFiles) {
        this.validateRequestee(dto);

        const event = await this.prisma.event.findUnique({ where: { id: dto.eventId } });
        if (!event) throw new NotFoundException('Event not found');

        if (dto.clubId) {
            const club = await this.prisma.club.findUnique({ where: { id: dto.clubId } });
            if (!club) throw new NotFoundException('Club not found');
        }

        const [budgetBreakdownUrl, officialRequestUrl, eventPrimerUrl] = await Promise.all([
            this.uploadRequiredPdf(files.budgetBreakdown?.[0], 'budget-breakdown'),
            this.uploadRequiredPdf(files.officialRequest?.[0], 'official-request'),
            this.uploadRequiredPdf(files.eventPrimer?.[0], 'event-primer'),
        ]);

        return this.prisma.budgetRequest.create({
            data: {
                requesteeType: dto.requesteeType,
                fullName: dto.fullName,
                clubId: dto.clubId || null,
                nonClubOrgName: dto.nonClubOrgName || null,
                eventId: dto.eventId,
                participantTier: dto.participantTier,
                requestedAmount: new Prisma.Decimal(dto.requestedAmount),
                budgetBreakdownUrl,
                officialRequestUrl,
                eventPrimerUrl,
            },
        });
    }

    /**
     * DOCU: Returns every budget request in the registry.
     *
     * Last Updated: 2026-08-05
     * Author: Alfred
     * Last Updated By: Alfred
     */
    findAll() {
        return this.prisma.budgetRequest.findMany({ orderBy: { createdAt: 'desc' } });
    }

    /**
     * DOCU: Finds a single budget request by id.
     *
     * Last Updated: 2026-08-05
     * Author: Alfred
     * Last Updated By: Alfred
     */
    async findOne(id: string) {
        const budgetRequest = await this.prisma.budgetRequest.findUnique({ where: { id } });
        if (!budgetRequest) throw new NotFoundException('Budget request not found');
        return budgetRequest;
    }

    /**
     * DOCU: Deletes a budget request by id.
     *
     * Last Updated: 2026-08-05
     * Author: Alfred
     * Last Updated By: Alfred
     */
    async remove(id: string) {
        await this.findOne(id);
        return this.prisma.budgetRequest.delete({ where: { id } });
    }

    private validateRequestee(dto: CreateBudgetRequestDto) {
        if (dto.requesteeType === RequesteeType.NON_CLUB) {
            if (dto.clubId) {
                throw new BadRequestException('clubId must be empty when requesteeType is NON_CLUB');
            }

            if (!dto.nonClubOrgName) {
                throw new BadRequestException('nonClubOrgName is required when requesteeType is NON_CLUB');
            }
            return;
        }

        if (!dto.clubId) {
            throw new BadRequestException('clubId is required when requesteeType is CLUB');
        }
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