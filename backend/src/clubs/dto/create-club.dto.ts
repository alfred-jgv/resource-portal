import { IsString, IsEnum, IsInt, IsDateString, Min, MinLength } from 'class-validator';
import { ClubType, IslandGroup } from '../../../generated/prisma/client';

/**
 * DOCU: Validates the payload for registering a new club.
 *
 * Last Updated: 2026-08-05
 * Author: Alfred
 * Last Updated By: Alfred
 */
export class CreateClubDto {
    @IsString()
    @MinLength(2)
    clubName!: string;

    @IsString()
    @MinLength(2)
    universityName!: string;

    @IsEnum(ClubType)
    clubType!: ClubType;

    @IsDateString()
    establishmentDate!: string;

    @IsInt()
    @Min(1)
    memberCount!: number;

    @IsEnum(IslandGroup)
    islandGroup!: IslandGroup;

    @IsString()
    region!: string;

    @IsString()
    province!: string;
}