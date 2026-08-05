# Resource Hub Backend - AI Continuation Roadmap

Last updated: 2026-08-05

This file is a handoff guide for any AI/engineer continuing work in this NestJS + Prisma + Supabase backend.

## 1) Current Status

Implemented modules
- auth
- clubs
- captain-leads
- events
- department-executives
- budget-requests
- venue-requests
- tasks

Implemented security baseline
- Global request throttling with @nestjs/throttler
- Auth route throttling (register/login)
- Helmet security headers
- Global payload size limits
- CORS allowlist via env variable
- Strict ValidationPipe settings
- Upload constraints for PDF routes (type and size checks)

Upload handling currently implemented
- budget-requests: accepts multipart files, uploads to Supabase Storage, stores resulting URLs
- venue-requests: accepts multipart files, uploads to Supabase Storage, stores resulting URLs

## 2) Important Files

App bootstrap and security
- src/main.ts
- src/app.module.ts

Auth and guards
- src/auth/auth.controller.ts
- src/auth/jwt-auth.guard.ts
- src/auth/roles.guard.ts
- src/auth/roles.decorator.ts

Budget request flow
- src/budget-requests/budget-requests.controller.ts
- src/budget-requests/budget-requests.service.ts
- src/budget-requests/dto/create-budget-request.dto.ts

Venue request flow
- src/venue-requests/venue-requests.controller.ts
- src/venue-requests/venue-requests.service.ts
- src/venue-requests/dto/create-venue-request.dto.ts

Task flow
- src/tasks/tasks.controller.ts
- src/tasks/tasks.service.ts
- src/tasks/dto/create-task.dto.ts
- src/tasks/dto/update-task.dto.ts

Environment template
- .env.example

## 3) Required Environment Variables

Database and auth
- DATABASE_URL
- DIRECT_URL
- JWT_SECRET

Supabase storage
- SUPABASE_URL
- SUPABASE_SERVICE_ROLE_KEY
- SUPABASE_STORAGE_BUCKET

Security tuning
- TRUST_PROXY (true/false)
- CORS_ORIGIN (comma-separated list)
- BODY_LIMIT (example: 1mb)
- MAX_UPLOAD_SIZE_BYTES (example: 5242880)

## 4) Known Architecture Decisions

- Prisma client uses driver adapter (PrismaPg) and generated client path under generated/prisma.
- DateTime fields are normalized in service layer with new Date(...).
- Role-based access uses JwtAuthGuard and RolesGuard patterns established in existing modules.
- Tasks are admin-managed for writes, but reads are role-filtered:
  - ADMIN sees all tasks
  - Other roles only see assignedOffice matching their role
- Storage files are uploaded by backend and DB stores URLs, not binary files.

## 5) Production Readiness Checklist

- Use strong JWT secret, rotate periodically
- Restrict CORS_ORIGIN to real frontend domains only
- Set TRUST_PROXY correctly on deployed platform
- Use private storage bucket and signed URLs if files are sensitive
- Add monitoring/logging with redaction for auth and secrets
- Review Supabase RLS posture if frontend will ever access Supabase directly

## 6) Notes for Future AI

- This repo uses npm.cmd in PowerShell on this machine due execution-policy restrictions on npm.ps1.
- If tests fail around Supabase storage configuration, verify env reads happen at method call time, not class initialization.
- Keep changes incremental; avoid broad refactors unless requested.
