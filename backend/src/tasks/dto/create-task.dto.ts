import { IsDateString, IsEnum, IsOptional, IsString, MinLength } from 'class-validator';
import { Role, TaskStatus } from '../../../generated/prisma/client';

/**
 * DOCU: Validates the payload for creating a task.
 *
 * Last Updated: 2026-08-05
 * Author: Alfred
 * Last Updated By: Alfred
 */
export class CreateTaskDto {
    @IsString()
    @MinLength(2)
    taskName!: string;

    @IsString()
    @MinLength(2)
    taskDetails!: string;

    @IsDateString()
    assignedDate!: string;

    @IsDateString()
    deadline!: string;

    @IsEnum(Role)
    assignedOffice!: Role;

    @IsOptional()
    @IsEnum(TaskStatus)
    status?: TaskStatus;
}