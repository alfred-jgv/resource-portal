import { Injectable } from '@nestjs/common';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';

@Injectable()
export class AuthService {
	register(dto: RegisterDto) {
		return {
			message: 'User registered',
			data: dto,
		};
	}

	login(dto: LoginDto) {
		return {
			message: 'Login endpoint works',
			data: dto,
		};
	}
}