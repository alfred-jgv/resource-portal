import { Injectable, UnauthorizedException, ConflictException, NotFoundException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../../prisma/prisma.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { UpdateOfficerDto } from './dto/update-officer.dto';

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
		if (dto.role === 'ADMIN') {
			const adminCount = await this.prisma.user.count({ where: { role: 'ADMIN' } });
			if (adminCount > 0) throw new ConflictException('Only one Admin account is allowed');
		}

		const hashed = await bcrypt.hash(dto.password, 10);
		const user = await this.prisma.user.create({
			data: {
				email: dto.email,
				password: hashed,
				name: dto.name,
				role: dto.role,
			},
		});

		return this.buildToken(user.id, user.email, user.role, user.name);
	}

	async findOfficers() {
		return this.prisma.user.findMany({
			select: { id: true, email: true, name: true, role: true, createdAt: true },
			orderBy: { createdAt: 'desc' },
		});
	}

	async updateOfficer(id: string, dto: UpdateOfficerDto) {
		const existing = await this.prisma.user.findUnique({ where: { id } });
		if (!existing) throw new NotFoundException('Officer not found');
		if (dto.role === 'ADMIN' && existing.role !== 'ADMIN') {
			const adminCount = await this.prisma.user.count({ where: { role: 'ADMIN' } });
			if (adminCount > 0) throw new ConflictException('Only one Admin account is allowed');
		}

		if (dto.email && dto.email !== existing.email) {
			const emailInUse = await this.prisma.user.findUnique({ where: { email: dto.email } });
			if (emailInUse) throw new ConflictException('Email already in use');
		}

		const data: { email?: string; name?: string; role?: UpdateOfficerDto['role']; password?: string } = {
			email: dto.email,
			name: dto.name,
			role: dto.role,
		};
		if (dto.password) data.password = await bcrypt.hash(dto.password, 10);

		return this.prisma.user.update({
			where: { id },
			data,
			select: { id: true, email: true, name: true, role: true, createdAt: true },
		});
	}

	async removeOfficer(id: string, requestingUserId: string) {
		if (id === requestingUserId) throw new ConflictException('You cannot delete your own account');
		const existing = await this.prisma.user.findUnique({ where: { id } });
		if (!existing) throw new NotFoundException('Officer not found');
		if (existing.role === 'ADMIN') throw new ConflictException('The Admin account cannot be deleted');
		return this.prisma.user.delete({
			where: { id },
			select: { id: true, email: true, name: true, role: true, createdAt: true },
		});
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

		return this.buildToken(user.id, user.email, user.role, user.name);
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
	private buildToken(sub: string, email: string, role: string, name?: string | null) {
		return { access_token: this.jwt.sign({ sub, email, role, name: name ?? undefined }) };
	}
}