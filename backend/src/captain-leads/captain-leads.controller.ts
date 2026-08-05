import { Body, Controller, Delete, Get, Param, Post, UseGuards } from '@nestjs/common';
import { CaptainLeadsService } from './captain-leads.service';
import { CreateCaptainLeadDto } from './dto/create-captain-lead.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { Role } from '../../generated/prisma/client';

@Controller('captain-leads')
@UseGuards(JwtAuthGuard)
export class CaptainLeadsController {
    constructor(private readonly captainLeadsService: CaptainLeadsService) { }

    @Get()
    findAll() {
        return this.captainLeadsService.findAll();
    }

    @Get(':id')
    findOne(@Param('id') id: string) {
        return this.captainLeadsService.findOne(id);
    }

    @Post()
    @UseGuards(RolesGuard)
    @Roles(Role.INFORMATION, Role.ADMIN)
    create(@Body() dto: CreateCaptainLeadDto) {
        return this.captainLeadsService.create(dto);
    }

    @Delete(':id')
    @UseGuards(RolesGuard)
    @Roles(Role.INFORMATION, Role.ADMIN)
    remove(@Param('id') id: string) {
        return this.captainLeadsService.remove(id);
    }
}