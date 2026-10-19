# Frontend API Usage Guide

Last updated: 2026-08-05

This is a practical guide for integrating the frontend with the current backend.

## 1) Base Setup

Base URL
- http://localhost:3000/api
- Configure it as `VITE_API_BASE_URL` in `frontend/.env` for local development.

For a separate Vercel deployment, set `VITE_API_BASE_URL` in the frontend
project's environment variables to the deployed backend URL, including
`/api` (for example, `https://your-backend.vercel.app/api`). Vite embeds this
value at build time, so redeploy the frontend after changing it. Also set the
backend's `CORS_ORIGIN` to the deployed frontend URL.

Auth header for protected routes
- Authorization: Bearer <access_token>

Common content types
- JSON routes: application/json
- Upload routes: multipart/form-data

## 2) Auth Flow

### Register
- POST /auth/register
- Body (JSON):
```json
{
  "email": "user@example.com",
  "password": "secret123",
  "name": "Sample User",
  "role": "INFORMATION"
}
```

### Login
- POST /auth/login
- Body (JSON):
```json
{
  "email": "user@example.com",
  "password": "secret123"
}
```
- Save returned access token in frontend state/storage.

### Current user
- GET /auth/me
- Requires Bearer token.

## 3) Role Rules (Frontend Guarding)

Use this to hide/disable actions in UI.

- Clubs create/delete: INFORMATION, ADMIN
- Captain Leads create/delete: INFORMATION, ADMIN
- Events create/delete: WORKFORCE, ADMIN
- Department Executives create/delete: WORKFORCE, ADMIN
- Budget Requests create/delete: ALLOCATION, ADMIN
- Venue Requests create/delete: WORKFORCE, ADMIN
- Tasks create/update/delete: ADMIN only
- Tasks view:
  - ADMIN sees all
  - Other roles see tasks assigned to their own office

## 4) Core Endpoints

All endpoints below are protected by JWT.

### Clubs
- GET /clubs
- GET /clubs/:id
- POST /clubs
- DELETE /clubs/:id

POST body
```json
{
  "clubName": "AWS Club",
  "universityName": "ABC University",
  "clubType": "STUDENT_BUILDER_GROUP",
  "establishmentDate": "2024-01-15T00:00:00.000Z",
  "memberCount": 30,
  "islandGroup": "LUZON",
  "region": "Region IV-A",
  "province": "Laguna"
}
```

### Captain Leads
- GET /captain-leads
- GET /captain-leads/:id
- POST /captain-leads
- DELETE /captain-leads/:id

POST body
```json
{
  "lastName": "Doe",
  "firstName": "Jane",
  "middleName": "A",
  "clubId": "<uuid>",
  "linkedinUrl": "https://linkedin.com/in/jane",
  "credlyUrl": "https://www.credly.com/users/jane"
}
```

### Events
- GET /events
- GET /events/:id
- POST /events
- DELETE /events/:id

POST body
```json
{
  "eventName": "Cloud Summit",
  "startDate": "2026-10-01T08:00:00.000Z",
  "endDate": "2026-10-01T17:00:00.000Z",
  "eventType": "TECHNICAL",
  "expectedParticipants": 120,
  "location": "Main Hall",
  "eventLink": "https://example.com/event"
}
```

### Department Executives
- GET /department-executives
- GET /department-executives/:id
- POST /department-executives
- DELETE /department-executives/:id

POST body
```json
{
  "lastName": "Reyes",
  "firstName": "Alex",
  "middleName": "B",
  "clubId": "<uuid>",
  "email": "alex@example.com",
  "contactNumber": "09171234567",
  "birthdate": "2000-01-01T00:00:00.000Z",
  "department": "EXECUTIVES"
}
```

## 5) Upload Endpoints

## Budget Requests (multipart)
- POST /budget-requests
- Fields:
  - requesteeType: CLUB | NON_CLUB
  - fullName: string
  - clubId: uuid (required when CLUB, empty when NON_CLUB)
  - nonClubOrgName: string (required when NON_CLUB)
  - eventId: uuid
  - participantTier: S | A | B | C
  - requestedAmount: string/decimal
  - budgetBreakdown: file (PDF)
  - officialRequest: file (PDF)
  - eventPrimer: file (PDF)

## Venue Requests (multipart)
- POST /venue-requests
- Fields:
  - clubId: uuid
  - clubHeadId: uuid
  - eventId: uuid
  - reservationDate: ISO date string
  - startTime: ISO date string
  - endTime: ISO date string
  - floor: FLOOR_15 | FLOOR_21
  - numberOfPax: integer
  - projectProfile: file (PDF)

Frontend note for uploads
- Use FormData
- Do not set Content-Type manually; let browser set multipart boundary

## 6) Tasks

- GET /tasks
- GET /tasks/:id
- POST /tasks (ADMIN)
- PATCH /tasks/:id (ADMIN)
- DELETE /tasks/:id (ADMIN)

POST body
```json
{
  "taskName": "Prepare report",
  "taskDetails": "Compile weekly updates",
  "assignedDate": "2026-08-05T00:00:00.000Z",
  "deadline": "2026-08-10T00:00:00.000Z",
  "assignedOffice": "WORKFORCE",
  "status": "PENDING"
}
```

PATCH body (partial)
```json
{
  "status": "IN_PROGRESS"
}
```

## 7) Typical Frontend Error Handling

Common status codes
- 400: validation or business-rule error
- 401: missing/invalid token
- 403: role not allowed
- 404: related record or target not found
- 429: rate-limited

Recommended UI behavior
- 401: force logout or token refresh flow
- 403: show permission message
- 429: show retry notice and backoff
- 400: surface server message near form fields

## 8) Frontend Quick Start Checklist

1. Save API base URL in frontend env.
2. Build auth store for token + user profile.
3. Attach Bearer token on protected requests.
4. Gate UI actions by role.
5. Use FormData for budget and venue create flows.
6. Handle 429 and 401 globally in HTTP client interceptor.
