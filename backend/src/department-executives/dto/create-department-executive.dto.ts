import { IsDateString, IsEmail, IsEnum, IsString, IsUUID, MinLength } from 'class-validator';
import { Department } from '../../../generated/prisma/client';

/**
 * DOCU: Validates the payload for registering a new department executive.
 *
 * Last Updated: 2026-08-05
 * Author: Alfred
 * Last Updated By: Alfred
 */
export class CreateDepartmentExecutiveDto {
    @IsString()
    @MinLength(2)
    lastName!: string;

    @IsString()
    @MinLength(2)
    firstName!: string;

    @IsString()
    middleName?: string;

    @IsUUID()
    clubId!: string;

    @IsEmail()
    email!: string;

    @IsString()
    @MinLength(7)
    contactNumber!: string;

    @IsDateString()
    birthdate!: string;

    @IsEnum(Department)
    department!: Department;
}