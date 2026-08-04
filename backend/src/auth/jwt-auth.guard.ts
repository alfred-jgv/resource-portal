import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

/**
 * DOCU: Guard that protects routes by requiring a valid JWT.
 * Delegates verification to the 'jwt' Passport strategy (JwtStrategy).
 * If the token is missing, expired, or invalid, the request is
 * rejected with 401 before it reaches the controller method.
 *
 * Last Updated: 2026-08-04
 * Author: Alfred
 * Last Updated By: Alfred
 */
@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') { }