import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common'
import { Reflector } from '@nestjs/core'
import { ROLES_KEY } from './roles.decorator'
import { Role } from '../../generated/prisma/enums'

/**
 * DOCU: Guard that enforces role-based access control.
 * - Reads required roles from metadata set by `@Roles(...)`.
 * - Expects `request.user.role` to be present (populated by JwtAuthGuard).
 * - Returns `true` when no roles are specified to allow unrestricted access.
 *
 * Notes:
 * - When used globally, ensure `JwtAuthGuard` runs before this guard so
 *   `request.user` is populated.
 *
 * Last Updated: 2026-08-04
 * Author: Alfred
 * Last Updated By: Alfred
 */
@Injectable()
export class RolesGuard implements CanActivate {
    constructor(private reflector: Reflector) {}

    canActivate(context: ExecutionContext): boolean {
        const requiredRoles = this.reflector.getAllAndOverride<Role[]>(ROLES_KEY, [
            context.getHandler(),
            context.getClass(),
        ])

        if (!requiredRoles || requiredRoles.length === 0) {
            return true
        }

        const request = context.switchToHttp().getRequest()
        const user = request.user
        if (!user || !user.role) return false

        return requiredRoles.includes(user.role)
    }
}
