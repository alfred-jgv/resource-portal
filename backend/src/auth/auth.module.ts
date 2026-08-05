import { Module } from '@nestjs/common'
import { JwtModule } from '@nestjs/jwt'
import { PassportModule } from '@nestjs/passport'
import { AuthService } from './auth.service'
import { AuthController } from './auth.controller'
import { JwtStrategy } from './jwt.strategy'

/**
 * DOCU: Configures authentication services and JWT support.
 *
 * - Registers `PassportModule` for authentication strategies.
 * - Configures `JwtModule` for signing and verifying JWT access tokens.
 * - Provides `AuthService` for authentication-related business logic.
 * - Registers `JwtStrategy` for validating JWT Bearer tokens with Passport.
 * - Exports `JwtModule` so other modules can inject `JwtService` if needed.
 *
 * Last Updated: 2026-08-05
 * Author: Alfred
 * Last Updated By: Alfred
 */
@Module({
  imports: [
    PassportModule,
    JwtModule.register({
      secret: process.env.JWT_SECRET || 'dev-secret',
      signOptions: { expiresIn: '1d' },
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy],
  exports: [JwtModule],
})
export class AuthModule {}