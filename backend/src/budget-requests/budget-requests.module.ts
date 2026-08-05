import { Module } from '@nestjs/common';
import { BudgetRequestsController } from './budget-requests.controller';
import { BudgetRequestsService } from './budget-requests.service';

@Module({
    controllers: [BudgetRequestsController],
    providers: [BudgetRequestsService],
})
export class BudgetRequestsModule { }