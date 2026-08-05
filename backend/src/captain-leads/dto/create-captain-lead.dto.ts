import { IsOptional, IsString, IsUUID, IsUrl, MinLength } from 'class-validator';

/**
 * DOCU: Validates the payload for registering a new captain lead.
 *
 * Last Updated: 2026-08-05
 * Author: Alfred
 * Last Updated By: Alfred
 */
export class CreateCaptainLeadDto {
    @IsString()
    @MinLength(2)
    lastName!: string;

    @IsString()
    @MinLength(2)
    firstName!: string;

    @IsOptional()
    @IsString()
    middleName?: string;

    @IsUUID()
    clubId!: string;

    @IsOptional()
    @IsUrl()
    linkedinUrl?: string;

    @IsOptional()
    @IsUrl()
    credlyUrl?: string;
}