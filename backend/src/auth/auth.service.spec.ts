import { Test, TestingModule } from '@nestjs/testing';
import { ConflictException, UnauthorizedException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { AuthService } from './auth.service';
import { PrismaService } from '../../prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';

describe('AuthService', () => {
    let service: AuthService;
    let prisma: { user: { findUnique: jest.Mock; create: jest.Mock } };
    let jwt: { sign: jest.Mock };

    beforeEach(async () => {
        // Fake versions of the dependencies — no real DB, no real JWT signing
        prisma = {
            user: {
                findUnique: jest.fn(),
                create: jest.fn(),
            },
        };
        jwt = {
            sign: jest.fn().mockReturnValue('fake-jwt-token'),
        };

        const module: TestingModule = await Test.createTestingModule({
            providers: [
                AuthService,
                { provide: PrismaService, useValue: prisma },
                { provide: JwtService, useValue: jwt },
            ],
        }).compile();

        service = module.get<AuthService>(AuthService);
    });

    describe('register', () => {
        it('throws ConflictException if email already exists', async () => {
            prisma.user.findUnique.mockResolvedValue({ id: '1', email: 'test@test.com' });

            await expect(
                service.register({ email: 'test@test.com', password: 'password123', role: 'ADMIN' as any }),
            ).rejects.toThrow(ConflictException);
        });

        it('creates a user and returns a token when email is new', async () => {
            prisma.user.findUnique.mockResolvedValue(null);
            prisma.user.create.mockResolvedValue({
                id: '1',
                email: 'test@test.com',
                role: 'ADMIN',
            });

            const result = await service.register({
                email: 'test@test.com',
                password: 'password123',
                role: 'ADMIN' as any,
            });

            expect(prisma.user.create).toHaveBeenCalled();
            expect(result).toEqual({ access_token: 'fake-jwt-token' });
        });
    });

    describe('login', () => {
        it('throws UnauthorizedException if user does not exist', async () => {
            prisma.user.findUnique.mockResolvedValue(null);

            await expect(
                service.login({ email: 'nope@test.com', password: 'password123' }),
            ).rejects.toThrow(UnauthorizedException);
        });

        it('throws UnauthorizedException if password does not match', async () => {
            const hashed = await bcrypt.hash('correctpassword', 10);
            prisma.user.findUnique.mockResolvedValue({ id: '1', email: 'test@test.com', password: hashed, role: 'ADMIN' });

            await expect(
                service.login({ email: 'test@test.com', password: 'wrongpassword' }),
            ).rejects.toThrow(UnauthorizedException);
        });

        it('returns a token when credentials are correct', async () => {
            const hashed = await bcrypt.hash('password123', 10);
            prisma.user.findUnique.mockResolvedValue({ id: '1', email: 'test@test.com', password: hashed, role: 'ADMIN' });

            const result = await service.login({ email: 'test@test.com', password: 'password123' });

            expect(result).toEqual({ access_token: 'fake-jwt-token' });
        });
    });
});