import { Body, Controller, Delete, Get, Param, Post, UploadedFiles, UseGuards, UseInterceptors } from '@nestjs/common';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import { VenueRequestsService } from './venue-requests.service';
import { CreateVenueRequestDto } from './dto/create-venue-request.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { Role } from '../../generated/prisma/client';

type UploadFile = {
    mimetype: string;
    originalname: string;
    buffer: Buffer;
};

const maxPdfSizeBytes = Number(process.env.MAX_UPLOAD_SIZE_BYTES || 5 * 1024 * 1024);

const pdfOnlyFileFilter = (_req: any, file: UploadFile, cb: (error: Error | null, acceptFile: boolean) => void) => {
    if (file.mimetype !== 'application/pdf') {
        return cb(new Error('Only PDF files are allowed'), false);
    }

    cb(null, true);
};

const venueRequestFilesInterceptor = (FileFieldsInterceptor as unknown as (...args: any[]) => any)(
    [{ name: 'projectProfile', maxCount: 1 }],
    {
        storage: memoryStorage(),
        limits: {
            fileSize: maxPdfSizeBytes,
            files: 1,
        },
        fileFilter: pdfOnlyFileFilter,
    },
);

/*
 * DOCU: POST is public — anyone can submit a venue request without
 * logging in. GET (list/single) and DELETE are restricted to
 * WORKFORCE + ADMIN, who review and manage submissions.
 *
 * Last Updated: 2026-08-06
 * Author: Alfred
 * Last Updated By: Alfred
 */
@Controller('venue-requests')
export class VenueRequestsController {
    constructor(private readonly venueRequestsService: VenueRequestsService) { }

    @Get()
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(Role.WORKFORCE, Role.ADMIN)
    findAll() {
        return this.venueRequestsService.findAll();
    }

    @Get(':id')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(Role.WORKFORCE, Role.ADMIN)
    findOne(@Param('id') id: string) {
        return this.venueRequestsService.findOne(id);
    }

    @Post()
    @UseInterceptors(venueRequestFilesInterceptor)
    create(
        @Body() dto: CreateVenueRequestDto,
        @UploadedFiles()
        files: {
            projectProfile?: UploadFile[];
        },
    ) {
        return this.venueRequestsService.create(dto, files);
    }

    @Delete(':id')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(Role.WORKFORCE, Role.ADMIN)
    remove(@Param('id') id: string) {
        return this.venueRequestsService.remove(id);
    }
}