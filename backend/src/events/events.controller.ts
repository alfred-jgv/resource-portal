import { Body, Controller, Delete, Get, Param, Post, UseGuards } from '@nestjs/common';
import { EventsService } from './events.service';
import { CreateEventDto } from './dto/create-event.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { Role } from '../../generated/prisma/client';

@Controller('events')
export class EventsController {
    constructor(private readonly eventsService: EventsService) { }

    @Get()
    findAll() {
        return this.eventsService.findAll();
    }

    @Get(':id')
    @UseGuards(JwtAuthGuard)
    findOne(@Param('id') id: string) {
        return this.eventsService.findOne(id);
    }

    @Post()
    @UseGuards(RolesGuard)
    @Roles(Role.WORKFORCE, Role.ADMIN)
    create(@Body() dto: CreateEventDto) {
        return this.eventsService.create(dto);
    }

    @Delete(':id')
    @UseGuards(RolesGuard)
    @Roles(Role.WORKFORCE, Role.ADMIN)
    remove(@Param('id') id: string) {
        return this.eventsService.remove(id);
    }
}