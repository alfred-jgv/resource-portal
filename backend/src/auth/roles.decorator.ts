import { SetMetadata } from '@nestjs/common'
import { Role } from '../../generated/prisma/enums'

/**
 * DOCU: Decorator to declare required roles for a route or controller.
 * Usage:
 *     @Roles(Role.ADMIN, Role.ALLOCATION)
 *     @UseGuards(JwtAuthGuard, RolesGuard)
 *
 * This attaches metadata under the `roles` key which `RolesGuard`
 * reads to enforce role-based access control.
 *
 * Last Updated: 2026-08-04
 * Author: Alfred
 * Last Updated By: Alfred
 */
export const ROLES_KEY = 'roles'
export const Roles = (...roles: Role[]) => SetMetadata(ROLES_KEY, roles)
