import { Body, Controller, Get, Post, Delete, Param, UseGuards } from '@nestjs/common';
import { ClubsService } from './clubs.service';
import { CreateClubDto } from './dto/create-club.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { Role } from '../../generated/prisma/client';

@Controller('clubs')
@UseGuards(JwtAuthGuard) // every route below requires login
export class ClubsController {
    constructor(private readonly clubsService: ClubsService) { }

    @Get()
    findAll() {
        return this.clubsService.findAll();
    }

    @Get(':id')
    findOne(@Param('id') id: string) {
        return this.clubsService.findOne(id);
    }

    @Post()
    @UseGuards(RolesGuard)
    @Roles(Role.INFORMATION, Role.ADMIN)
    create(@Body() dto: CreateClubDto) {
        return this.clubsService.create(dto);
    }

    @Delete(':id')
    @UseGuards(RolesGuard)
    @Roles(Role.INFORMATION, Role.ADMIN)
    remove(@Param('id') id: string) {
        return this.clubsService.remove(id);
    }
}