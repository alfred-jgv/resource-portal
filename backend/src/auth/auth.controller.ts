import { Body, Controller, Post, Get, Patch, Delete, Param, UseGuards, Req } from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import { RegisterDto } from './dto/register.dto';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { JwtAuthGuard } from './jwt-auth.guard';
import { RolesGuard } from './roles.guard';
import { Roles } from './roles.decorator';
import { Role } from '../../generated/prisma/enums';
import { UpdateOfficerDto } from './dto/update-officer.dto';

@Controller('auth')
export class AuthController {
    constructor(private readonly authService: AuthService) { }

    @Post('register')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(Role.ADMIN)
    @Throttle({ auth: { limit: 5, ttl: 60_000 } })
    register(@Body() dto: RegisterDto) {
        return this.authService.register(dto);
    }

    @Get('officers')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(Role.ADMIN)
    findOfficers() {
        return this.authService.findOfficers();
    }

    @Patch('officers/:id')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(Role.ADMIN)
    updateOfficer(@Param('id') id: string, @Body() dto: UpdateOfficerDto) {
        return this.authService.updateOfficer(id, dto);
    }

    @Delete('officers/:id')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(Role.ADMIN)
    removeOfficer(@Param('id') id: string, @Req() req: any) {
        return this.authService.removeOfficer(id, req.user.userId);
    }

    @Post('login')
    @Throttle({ auth: { limit: 8, ttl: 60_000 } })
    login(@Body() dto: LoginDto) {
        return this.authService.login(dto);
    }

    /**
     * DOCU: Returns the currently authenticated user's info from their JWT.
     * Protected by JwtAuthGuard — only reachable with a valid Bearer token.
     * @param {Request} req - Express request; req.user is populated by JwtStrategy.validate()
     * @returns {{ userId: string, email: string, role: string }} - Decoded token payload
     *
     * Last Updated: 2026-08-04
     * Author: Alfred
     * Last Updated By: Alfred
     */
    @Get('me')
    @UseGuards(JwtAuthGuard)
    getProfile(@Req() req: any) {
        return req.user;
    }
}