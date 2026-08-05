import { Body, Controller, Delete, Get, Param, Post, UseGuards } from '@nestjs/common';
import { DepartmentExecutivesService } from './department-executives.service';
import { CreateDepartmentExecutiveDto } from './dto/create-department-executive.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { Role } from '../../generated/prisma/client';

@Controller('department-executives')
@UseGuards(JwtAuthGuard)
export class DepartmentExecutivesController {
    constructor(private readonly departmentExecutivesService: DepartmentExecutivesService) { }

    @Get()
    findAll() {
        return this.departmentExecutivesService.findAll();
    }

    @Get(':id')
    findOne(@Param('id') id: string) {
        return this.departmentExecutivesService.findOne(id);
    }

    @Post()
    @UseGuards(RolesGuard)
    @Roles(Role.WORKFORCE, Role.ADMIN)
    create(@Body() dto: CreateDepartmentExecutiveDto) {
        return this.departmentExecutivesService.create(dto);
    }

    @Delete(':id')
    @UseGuards(RolesGuard)
    @Roles(Role.WORKFORCE, Role.ADMIN)
    remove(@Param('id') id: string) {
        return this.departmentExecutivesService.remove(id);
    }
}