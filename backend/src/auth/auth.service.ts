import { Injectable, UnauthorizedException, ConflictException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../../prisma/prisma.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';

@Injectable()
export class AuthService {
	constructor(
		private prisma: PrismaService,
		private jwt: JwtService,
	) { }

	/**
	 * DOCU: Registers a new user by checking for an existing email,
	 * hashing the password, saving the user record, and issuing a JWT.
	 * @param {RegisterDto} dto - Contains email, password, optional name, and role
	 * @returns {Promise<{ access_token: string }>} - Signed JWT for the new user
	 * @throws {ConflictException} - If the email is already registered
	 *
	 * Last Updated: 2026-08-04
	 * Author: Alfred
	 * Last Updated By: Alfred
	 */
	async register(dto: RegisterDto) {
		const existing = await this.prisma.user.findUnique({ where: { email: dto.email } });
		if (existing) throw new ConflictException('Email already in use');

		const hashed = await bcrypt.hash(dto.password, 10);
		const user = await this.prisma.user.create({
			data: {
				email: dto.email,
				password: hashed,
				name: dto.name,
				role: dto.role,
			},
		});

		return this.buildToken(user.id, user.email, user.role);
	}

	/**
	 * DOCU: Authenticates a user by verifying their email and password,
	 * then issues a JWT if the credentials are valid.
	 * @param {LoginDto} dto - Contains email and password
	 * @returns {Promise<{ access_token: string }>} - Signed JWT for the authenticated user
	 * @throws {UnauthorizedException} - If the email doesn't exist or the password doesn't match
	 *
	 * Last Updated: 2026-08-04
	 * Author: Alfred
	 * Last Updated By: Alfred
	 */
	async login(dto: LoginDto) {
		const user = await this.prisma.user.findUnique({ where: { email: dto.email } });
		if (!user) throw new UnauthorizedException('Invalid credentials');

		const valid = await bcrypt.compare(dto.password, user.password);
		if (!valid) throw new UnauthorizedException('Invalid credentials');

		return this.buildToken(user.id, user.email, user.role);
	}

	/**
	 * DOCU: Builds and signs a JWT containing the user's id, email, and role.
	 * @param {string} sub - The user's id, used as the JWT subject
	 * @param {string} email - The user's email, embedded in the token payload
	 * @param {string} role - The user's office/role, embedded in the token payload
	 * @returns {{ access_token: string }} - Object containing the signed JWT
	 *
	 * Last Updated: 2026-08-04
	 * Author: Alfred
	 * Last Updated By: Alfred
	 */
	private buildToken(sub: string, email: string, role: string) {
		return { access_token: this.jwt.sign({ sub, email, role }) };
	}
}