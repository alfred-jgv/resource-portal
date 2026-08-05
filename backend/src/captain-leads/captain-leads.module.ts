import { Module } from '@nestjs/common';
import { CaptainLeadsController } from './captain-leads.controller';
import { CaptainLeadsService } from './captain-leads.service';

@Module({
    controllers: [CaptainLeadsController],
    providers: [CaptainLeadsService],
})
export class CaptainLeadsModule { }