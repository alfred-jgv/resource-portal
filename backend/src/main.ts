import 'dotenv/config';
import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import helmet from 'helmet';
import { json, urlencoded } from 'express';
import { AppModule } from './app.module';

async function bootstrap() {
    const app = await NestFactory.create(AppModule);

    // Ensure client IP is preserved when deployed behind a reverse proxy.
    const httpServer = app.getHttpAdapter().getInstance() as { set?: (key: string, value: unknown) => void };
    httpServer.set?.('trust proxy', process.env.TRUST_PROXY === 'true');

    app.use(
        helmet({
            crossOriginResourcePolicy: { policy: 'cross-origin' },
        }),
    );

    // Limit payload size to reduce abuse risk on JSON/form endpoints.
    app.use(json({ limit: process.env.BODY_LIMIT || '1mb' }));
    app.use(urlencoded({ extended: true, limit: process.env.BODY_LIMIT || '1mb' }));

    const allowedOrigins = (process.env.CORS_ORIGIN || 'http://localhost:5173,http://localhost:3000')
        .split(',')
        .map((origin) => origin.trim())
        .filter(Boolean);

    app.enableCors({
        origin: allowedOrigins,
        credentials: true,
        methods: ['GET', 'POST', 'PATCH', 'PUT', 'DELETE', 'OPTIONS'],
    });

    app.useGlobalPipes(
        new ValidationPipe({
            whitelist: true,
            transform: true,
            forbidNonWhitelisted: true,
            forbidUnknownValues: true,
            stopAtFirstError: true,
        }),
    );

    app.setGlobalPrefix('api');
    await app.listen(process.env.PORT ?? 3000);
}
bootstrap();