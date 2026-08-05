import { Module } from '@nestjs/common';
import { VenueRequestsController } from './venue-requests.controller';
import { VenueRequestsService } from './venue-requests.service';

@Module({
    controllers: [VenueRequestsController],
    providers: [VenueRequestsService],
})
export class VenueRequestsModule { }