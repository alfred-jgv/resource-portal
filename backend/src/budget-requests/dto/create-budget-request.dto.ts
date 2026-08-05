import { IsEnum, IsOptional, IsString, IsUUID, MinLength } from 'class-validator';
import { ParticipantTier, RequesteeType } from '../../../generated/prisma/client';

/**
 * DOCU: Validates the payload for registering a new budget request.
 *
 * Last Updated: 2026-08-05
 * Author: Alfred
 * Last Updated By: Alfred
 */
export class CreateBudgetRequestDto {
    @IsEnum(RequesteeType)
    requesteeType!: RequesteeType;

    @IsString()
    @MinLength(2)
    fullName!: string;

    @IsOptional()
    @IsUUID()
    clubId?: string;

    @IsOptional()
    @IsString()
    @MinLength(2)
    nonClubOrgName?: string;

    @IsUUID()
    eventId!: string;

    @IsEnum(ParticipantTier)
    participantTier!: ParticipantTier;

    @IsString()
    requestedAmount!: string;
}