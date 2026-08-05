import { IsDateString, IsEnum, IsOptional, IsString, MinLength } from 'class-validator';
import { Role, TaskStatus } from '../../../generated/prisma/client';

/**
 * DOCU: Validates the payload for updating a task.
 *
 * Last Updated: 2026-08-05
 * Author: Alfred
 * Last Updated By: Alfred
 */
export class UpdateTaskDto {
    @IsOptional()
    @IsString()
    @MinLength(2)
    taskName?: string;

    @IsOptional()
    @IsString()
    @MinLength(2)
    taskDetails?: string;

    @IsOptional()
    @IsDateString()
    assignedDate?: string;

    @IsOptional()
    @IsDateString()
    deadline?: string;

    @IsOptional()
    @IsEnum(Role)
    assignedOffice?: Role;

    @IsOptional()
    @IsEnum(TaskStatus)
    status?: TaskStatus;
}