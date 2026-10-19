# AWSSUG Resource Department

The AWSSUG Resource Department is a full-stack resource management portal for
the AWS Student User Group Philippines. It provides public request forms and
authenticated, role-based tools for managing clubs, personnel, events,
departmental requests, and operational tasks.

## Features

- JWT-based authentication with role-based navigation and authorization
- Public budget and venue request submission
- Resource officer management for clubs, Captain & Leads, and department executives
- Event and venue coordination
- Admin-managed operational tasks with office-specific visibility
- Dashboard metrics, distributions, searchable tables, and CRUD workflows
- PDF upload support through Supabase Storage
- Responsive AWSSUG-themed interface with reusable design primitives
- Content-shaped skeleton loaders for page initialization, dashboards, tables,
  task lists, officer lists, and reference pickers
- Explicit high-contrast task status badges for Pending, In Progress, and Done
- Accessible loading semantics, reduced-motion support, and preserved empty/error states
- API throttling, Helmet security headers, strict validation, CORS allowlisting,
  request-size limits, and upload constraints

## Technology stack

### Frontend

- React 19
- TypeScript
- Vite
- React Router
- Axios
- TanStack React Query
- CSS design tokens and component-specific styles
- Oxlint

### Backend

- NestJS 11
- TypeScript
- Prisma 7 with PostgreSQL
- Supabase PostgreSQL and Storage
- JWT, Passport, bcrypt
- `class-validator` and `class-transformer`
- Helmet and `@nestjs/throttler`
- Jest and Supertest

## Application areas

| Area | Frontend route | API resource | Access |
| --- | --- | --- | --- |
| Home | `/` | - | Public |
| Login | `/login` | `/api/auth/login` | Public |
| Budget requests | `/budget-requests` | `/api/budget-requests` | Public submission; ALLOCATION and ADMIN management |
| Venue requests | `/venue-requests` | `/api/venue-requests` | Public submission; WORKFORCE and ADMIN management |
| Tasks | `/tasks` | `/api/tasks` | Authenticated users; ADMIN creates and manages |
| Clubs | `/clubs` | `/api/clubs` | INFORMATION and ADMIN |
| Captain & Leads | `/captain-leads` | `/api/captain-leads` | INFORMATION and ADMIN |
| Department executives | `/department-executives` | `/api/department-executives` | WORKFORCE and ADMIN |
| Events | `/events` | `/api/events` | WORKFORCE and ADMIN |
| Officers | `RegisterOfficerPage` (route registration pending) | `/api/auth/officers` | ADMIN only |

The frontend hides navigation links that do not apply to the current role, but
the backend remains the source of truth for authorization.

The sidebar currently includes an `/admin/register` Officers link, while the
page component exists in `frontend/src/pages/RegisterOfficerPage.tsx`. The
route should be registered in `frontend/src/App.tsx` before using that link in
a deployed build.

## Roles

- `ADMIN`: Full access, including officer accounts, tasks, and all modules
- `INFORMATION`: Clubs and Captain & Leads
- `ALLOCATION`: Budget request management
- `WORKFORCE`: Events, venue requests, and department executives

Task reads are role-filtered by the backend: `ADMIN` sees all tasks, while
other authenticated roles see tasks assigned to their office. Task writes are
restricted to `ADMIN`.

## Project structure

```text
.
├── frontend/
│   ├── src/
│   │   ├── api/              # API client and reference-list cache
│   │   ├── components/       # Layout, forms, dashboards, skeletons, navigation
│   │   ├── context/          # Authentication and toast state
│   │   ├── hooks/            # Shared React hooks
│   │   ├── pages/            # Routed application pages
│   │   ├── styles/           # Shared tokens and page/component styles
│   │   └── App.tsx           # Router and provider composition
│   └── package.json
├── backend/
│   ├── prisma/               # Prisma schema, client setup, and seed data
│   ├── src/
│   │   ├── auth/             # Login, officers, JWT, and role guards
│   │   ├── clubs/
│   │   ├── captain-leads/
│   │   ├── department-executives/
│   │   ├── events/
│   │   ├── budget-requests/
│   │   ├── venue-requests/
│   │   ├── tasks/
│   │   ├── app.module.ts     # Module composition and throttling
│   │   └── main.ts           # API bootstrap and security configuration
│   └── package.json
└── README.md
```

Each backend domain generally contains a NestJS module, controller, service,
DTOs, and unit tests. The shared frontend `ModuleForm` component supplies
consistent create, dashboard, table, and manage workflows for most resources.

## Getting started

### Prerequisites

- Node.js 20 or later
- npm
- A PostgreSQL database, typically through Supabase
- A Supabase Storage bucket for uploaded documents

### Install dependencies

```bash
git clone https://github.com/alfred-jgv/awssug-resource-department.git
cd awssug-resource-department

cd backend
npm install

cd ../frontend
npm install
```

### Configure the backend

Copy `backend/.env.example` to `backend/.env` and provide the deployment
values:

```env
# Prisma/PostgreSQL
DATABASE_URL=
DIRECT_URL=

# Authentication
JWT_SECRET=

# Runtime and API security
TRUST_PROXY=false
CORS_ORIGIN=http://localhost:5173,http://localhost:3000
BODY_LIMIT=1mb
MAX_UPLOAD_SIZE_BYTES=5242880

# Supabase Storage
SUPABASE_URL=
SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
SUPABASE_STORAGE_BUCKET=documents
```

Use a strong, private `JWT_SECRET`. Restrict `CORS_ORIGIN` to trusted frontend
origins in deployed environments. The service-role key must only be used by
the backend and must never be exposed to the frontend.

### Configure the frontend

The frontend uses `/api` by default. For a separately hosted API, create
`frontend/.env` with:

```env
VITE_API_BASE_URL=http://localhost:3000/api
```

### Run locally

Start the backend:

```bash
cd backend
npm run start:dev
```

Start the frontend in a second terminal:

```bash
cd frontend
npm run dev
```

The Vite development server is normally available at
`http://localhost:5173`; the NestJS API listens on port `3000` unless `PORT`
is configured.

## Database and storage

Generate the Prisma client and build the backend:

```bash
cd backend
npm run build
```

Seed configured initial data:

```bash
npm run seed
```

Budget and venue request PDF files are uploaded to the configured Supabase
Storage bucket. The database stores resulting file URLs rather than binary
content. For sensitive documents, use a private bucket and signed URLs in
production.

## API behavior

The backend applies the global `/api` prefix. Important authentication
endpoints include:

- `POST /api/auth/login`
- `GET /api/auth/me`
- `POST /api/auth/register` (ADMIN)
- `GET /api/auth/officers` (ADMIN)
- `PATCH /api/auth/officers/:id` (ADMIN)
- `DELETE /api/auth/officers/:id` (ADMIN)

Resource modules expose the standard REST operations supported by their
controllers. Public option endpoints are available for form references such
as clubs and events. Protected endpoints use JWT authentication and, where
required, the `RolesGuard`.

## Frontend loading and accessibility

[`frontend/src/components/Skeletons.tsx`](./frontend/src/components/Skeletons.tsx)
contains reusable skeleton variants for:

- App shell initialization
- Dashboard headings, metrics, and chart cards
- Table headers, rows, and cells
- Task cards
- Reference-picker values
- Mutating action buttons

Skeletons are shown only during active initialization or data requests.
Meaningful empty and error states remain visible after requests complete.
Skeleton regions expose loading status semantics, decorative shapes are hidden
from assistive technology, and action controls use `aria-busy`. Shimmer
animation is disabled for users who prefer reduced motion. Shared visual
tokens live in
[`frontend/src/styles/primitives.css`](./frontend/src/styles/primitives.css).

Task badges are styled in
[`frontend/src/styles/TasksPage.css`](./frontend/src/styles/TasksPage.css)
with explicit foreground, background, and border colors so Pending, In
Progress, and Done remain distinguishable and readable in the supported dark
theme.

## Development commands

### Frontend

```bash
cd frontend
npm run dev       # Start Vite development server
npm run build     # Type-check and build for production
npm run lint      # Run Oxlint
npm run preview   # Preview the production build
```

### Backend

```bash
cd backend
npm run start:dev # Start NestJS with watch mode
npm run build     # Generate Prisma client and compile NestJS
npm run seed      # Seed initial data
npm run lint      # Run ESLint with fixes
npm test          # Run Jest unit tests
npm run test:cov  # Run tests with coverage
npm run test:e2e  # Run end-to-end tests
npm run format    # Format backend TypeScript
```

## Security and production checklist

- Use a strong JWT secret and rotate it periodically.
- Restrict CORS origins to known frontend domains.
- Configure `TRUST_PROXY` only when the deployment proxy is trusted.
- Keep Supabase service credentials server-side.
- Configure a private storage bucket and signed URLs for sensitive documents.
- Keep request body and upload limits appropriate for the deployment.
- Review database and Supabase Row Level Security policies before allowing
  direct client access.
- Add redacted monitoring and alerting for authentication and upload failures.

## License

This project is licensed under the MIT License.
