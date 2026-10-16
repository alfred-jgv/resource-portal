import { Transform } from 'class-transformer';
import { IsDateString, IsEnum, IsInt, IsUUID, Min } from 'class-validator';
import { Floor } from '../../../generated/prisma/client';

/**
 * DOCU: Validates the payload for registering a new venue request.
 *
 * Last Updated: 2026-08-05
 * Author: Alfred
 * Last Updated By: Alfred
 */
export class CreateVenueRequestDto {
    @IsUUID()
    clubId!: string;

    @IsUUID()
    clubHeadId!: string;

    @IsUUID()
    eventId!: string;

    @IsDateString()
    reservationDate!: string;

    @IsDateString()
    startTime!: string;

    @IsDateString()
    endTime!: string;

    @IsEnum(Floor)
    floor!: Floor;

    @Transform(({ value }) => (typeof value === 'string' ? Number(value.trim()) : value))
    @IsInt()
    @Min(1)
    numberOfPax!: number;
}