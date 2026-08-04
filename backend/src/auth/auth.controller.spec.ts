import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';

describe('AuthController', () => {
    let controller: AuthController;
    let authService: { register: jest.Mock; login: jest.Mock };

    beforeEach(async () => {
        authService = {
            register: jest.fn().mockResolvedValue({ access_token: 'fake-token' }),
            login: jest.fn().mockResolvedValue({ access_token: 'fake-token' }),
        };

        const module: TestingModule = await Test.createTestingModule({
            controllers: [AuthController],
            providers: [{ provide: AuthService, useValue: authService }],
        }).compile();

        controller = module.get<AuthController>(AuthController);
    });

    it('register() delegates to AuthService.register', async () => {
        const dto = { email: 'test@test.com', password: 'password123', role: 'ADMIN' as any };
        const result = await controller.register(dto);

        expect(authService.register).toHaveBeenCalledWith(dto);
        expect(result).toEqual({ access_token: 'fake-token' });
    });

    it('login() delegates to AuthService.login', async () => {
        const dto = { email: 'test@test.com', password: 'password123' };
        const result = await controller.login(dto);

        expect(authService.login).toHaveBeenCalledWith(dto);
        expect(result).toEqual({ access_token: 'fake-token' });
    });

    it('getProfile() returns req.user', () => {
        const req = { user: { userId: '1', email: 'test@test.com', role: 'ADMIN' } };
        expect(controller.getProfile(req)).toEqual(req.user);
    });
});