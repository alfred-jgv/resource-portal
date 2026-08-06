import { Body, Controller, Delete, Get, Param, Post, UploadedFiles, UseGuards, UseInterceptors } from '@nestjs/common';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import { BudgetRequestsService } from './budget-requests.service';
import { CreateBudgetRequestDto } from './dto/create-budget-request.dto';
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

const budgetRequestFilesInterceptor = (FileFieldsInterceptor as unknown as (...args: any[]) => any)(
    [
        { name: 'budgetBreakdown', maxCount: 1 },
        { name: 'officialRequest', maxCount: 1 },
        { name: 'eventPrimer', maxCount: 1 },
    ],
    {
        storage: memoryStorage(),
        limits: {
            fileSize: maxPdfSizeBytes,
            files: 3,
        },
        fileFilter: pdfOnlyFileFilter,
    },
);

/*
 * DOCU: POST is public — anyone can submit a budget request without
 * logging in. GET (list/single) and DELETE are restricted to
 * ALLOCATION + ADMIN, who review and manage submissions.
 *
 * Last Updated: 2026-08-06
 * Author: Alfred
 * Last Updated By: Alfred
 */
@Controller('budget-requests')
export class BudgetRequestsController {
    constructor(private readonly budgetRequestsService: BudgetRequestsService) { }

    @Get()
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(Role.ALLOCATION, Role.ADMIN)
    findAll() {
        return this.budgetRequestsService.findAll();
    }

    @Get(':id')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(Role.ALLOCATION, Role.ADMIN)
    findOne(@Param('id') id: string) {
        return this.budgetRequestsService.findOne(id);
    }

    @Post()
    @UseInterceptors(budgetRequestFilesInterceptor)
    create(
        @Body() dto: CreateBudgetRequestDto,
        @UploadedFiles()
        files: {
            budgetBreakdown?: UploadFile[];
            officialRequest?: UploadFile[];
            eventPrimer?: UploadFile[];
        },
    ) {
        return this.budgetRequestsService.create(dto, files);
    }

    @Delete(':id')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(Role.ALLOCATION, Role.ADMIN)
    remove(@Param('id') id: string) {
        return this.budgetRequestsService.remove(id);
    }
}