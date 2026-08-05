import { IsDateString, IsEnum, IsInt, IsOptional, IsString, IsUrl, Min, MinLength } from 'class-validator';
import { EventType } from '../../../generated/prisma/client';

/**
 * DOCU: Validates the payload for registering a new event.
 *
 * Last Updated: 2026-08-05
 * Author: Alfred
 * Last Updated By: Alfred
 */
export class CreateEventDto {
    @IsString()
    @MinLength(2)
    eventName!: string;

    @IsDateString()
    startDate!: string;

    @IsDateString()
    endDate!: string;

    @IsEnum(EventType)
    eventType!: EventType;

    @IsInt()
    @Min(1)
    expectedParticipants!: number;

    @IsString()
    @MinLength(2)
    location!: string;

    @IsOptional()
    @IsUrl()
    eventLink?: string;
}