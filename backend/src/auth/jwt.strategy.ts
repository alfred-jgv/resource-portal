import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
    constructor(private readonly prisma: PrismaService) {
        super({
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
            ignoreExpiration: false,
            secretOrKey: process.env.JWT_SECRET || 'dev-secret',
        });
    }

    async validate(payload: { sub: string; email: string; role: string; name?: string }) {
        const user = await this.prisma.user.findUnique({
            where: { id: payload.sub },
            select: { email: true, role: true, name: true },
        });
        return {
            userId: payload.sub,
            email: user?.email ?? payload.email,
            role: user?.role ?? payload.role,
            name: user?.name ?? payload.name ?? null,
        };
    }
}