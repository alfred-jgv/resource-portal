# AWSSUG-Resource Department Website

A modern full-stack resource platform built with **React**, **NestJS**, and **Supabase (PostgreSQL)**. The application enables users to discover, organize, and manage resources through a responsive and user-friendly interface.

## Features

- User authentication
- Browse and search resources
- Categorize and organize resources
- Responsive user interface
- RESTful API with NestJS
- PostgreSQL relational database
- Secure backend architecture
- Modern React frontend

## Tech Stack

### Frontend
- React
- TypeScript
- React Router
- Axios
- CSS

### Backend
- NestJS
- TypeScript
- Prisma
- JWT Authentication
- REST API

### Database
- Supabase (PostgreSQL)

## Project Structure

```
.
├── frontend/
│   ├── src/
│   └── ...
├── backend/
│   ├── src/
│   └── ...
└── README.md
```

## Getting Started

### Prerequisites

- Node.js (v20 or later recommended)
- npm
- Supabase project

### Installation

Clone the repository.

```bash
git clone https://github.com/your-username/resource-hub.git
cd resource-hub
```

### Frontend

```bash
cd frontend
npm install
npm run dev
```

### Backend

```bash
cd backend
npm install
npm run start:dev
```

## Environment Variables

Create a `.env` file inside the backend directory.

```env
DATABASE_URL=

JWT_SECRET=

SUPABASE_URL=

SUPABASE_ANON_KEY=

SUPABASE_SERVICE_ROLE_KEY=

SUPABASE_STORAGE_BUCKET=documents
```

Update the values with your own configuration.

For document uploads, create the storage bucket in Supabase first, then store its name in `SUPABASE_STORAGE_BUCKET`. The backend uploads the PDF to that bucket with the service role key and saves the resulting file URL in Prisma.

## License

This project is licensed under the MIT License.
