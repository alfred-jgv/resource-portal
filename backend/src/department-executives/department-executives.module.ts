import { Module } from '@nestjs/common';
import { DepartmentExecutivesController } from './department-executives.controller';
import { DepartmentExecutivesService } from './department-executives.service';

@Module({
    controllers: [DepartmentExecutivesController],
    providers: [DepartmentExecutivesService],
})
export class DepartmentExecutivesModule { }