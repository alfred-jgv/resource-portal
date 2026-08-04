import { Reflector } from '@nestjs/core';
import { ExecutionContext } from '@nestjs/common';
import { RolesGuard } from './roles.guard';

describe('RolesGuard', () => {
    let guard: RolesGuard;
    let reflector: Reflector;

    const mockContext = (userRole: string, requiredRoles: string[] | undefined) => {
        jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(requiredRoles);
        return {
            getHandler: () => ({}),
            getClass: () => ({}),
            switchToHttp: () => ({
                getRequest: () => ({ user: { role: userRole } }),
            }),
        } as unknown as ExecutionContext;
    };

    beforeEach(() => {
        reflector = new Reflector();
        guard = new RolesGuard(reflector);
    });

    it('allows access when no roles are required', () => {
        const context = mockContext('INFORMATION', undefined);
        expect(guard.canActivate(context)).toBe(true);
    });

    it('allows access when the user has an allowed role', () => {
        const context = mockContext('ADMIN', ['ADMIN']);
        expect(guard.canActivate(context)).toBe(true);
    });

    it('denies access when the user does not have an allowed role', () => {
        const context = mockContext('INFORMATION', ['ADMIN']);
        expect(guard.canActivate(context)).toBe(false);
    });
});