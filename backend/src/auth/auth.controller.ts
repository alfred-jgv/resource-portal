import { Body, Controller, Post, Get, UseGuards, Req } from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import { RegisterDto } from './dto/register.dto';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { JwtAuthGuard } from './jwt-auth.guard';

@Controller('auth')
export class AuthController {
    constructor(private readonly authService: AuthService) { }

    @Post('register')
    @Throttle({ auth: { limit: 5, ttl: 60_000 } })
    register(@Body() dto: RegisterDto) {
        return this.authService.register(dto);
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