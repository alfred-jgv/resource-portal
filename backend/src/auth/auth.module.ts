import { Module } from '@nestjs/common'
import { JwtModule } from '@nestjs/jwt'
import { PassportModule } from '@nestjs/passport'
import { APP_GUARD } from '@nestjs/core'
import { AuthService } from './auth.service'
import { AuthController } from './auth.controller'
import { JwtStrategy } from './jwt.strategy'
import { JwtAuthGuard } from './jwt-auth.guard'
import { RolesGuard } from './roles.guard'

/**
 * DOCU: AuthModule sets up JWT authentication and registers
 * global guards for authentication and role-based access control.
 *
 * - Registers `JwtModule` for token signing/verification.
 * - Provides `JwtStrategy` for Passport JWT validation.
 * - Registers `JwtAuthGuard` and `RolesGuard` as global guards via
 *   the `APP_GUARD` token. Order matters: `JwtAuthGuard` is provided
 *   first so that `request.user` is populated before `RolesGuard`
 *   performs role checks.
 *
 * Last Updated: 2026-08-04
 * Author: Alfred
 * Last Updated By: Alfred
 */
@Module({
    imports: [
        PassportModule,
        JwtModule.register({
            secret: process.env.JWT_SECRET || 'dev-secret',
            signOptions: { expiresIn: '7d' },
        }),
    ],
    controllers: [AuthController],
    providers: [
        AuthService,
        JwtStrategy,
        JwtAuthGuard,
        RolesGuard,
        { provide: APP_GUARD, useClass: JwtAuthGuard },
        { provide: APP_GUARD, useClass: RolesGuard },
    ],
    exports: [JwtModule],
})
export class AuthModule {}