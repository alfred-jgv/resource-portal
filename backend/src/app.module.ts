import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { PrismaModule } from '../prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { ClubsModule } from './clubs/clubs.module';
import { CaptainLeadsModule } from './captain-leads/captain-leads.module';
import { EventsModule } from './events/events.module';
import { DepartmentExecutivesModule } from './department-executives/department-executives.module';
import { BudgetRequestsModule } from './budget-requests/budget-requests.module';
import { VenueRequestsModule } from './venue-requests/venue-requests.module';
import { TasksModule } from './tasks/tasks.module';
import { AppController } from './app.controller';
import { AppService } from './app.service';

@Module({
    imports: [
        PrismaModule,
        AuthModule,
        ClubsModule,
        CaptainLeadsModule,
        EventsModule,
        DepartmentExecutivesModule,
        BudgetRequestsModule,
        VenueRequestsModule,
        TasksModule,
        ThrottlerModule.forRoot([
            {
                name: 'default',
                ttl: 60_000,
                limit: 120,
            },
            {
                name: 'auth',
                ttl: 60_000,
                limit: 8,
            },
        ]),
    ],
    controllers: [AppController],
    providers: [
        AppService,
        {
            provide: APP_GUARD,
            useClass: ThrottlerGuard,
        },
    ],
})
export class AppModule { }