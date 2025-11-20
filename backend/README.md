# RC Café Backend API

Backend API for the RC Café Management System.

## Setup

1. Install dependencies:
```bash
npm install
```

2. Create `.env` file (see `.env.example`)

3. Run database migrations:
```bash
npm run migrate
```

4. Start development server:
```bash
npm run dev
```

## Environment Variables

See `.env.example` for required environment variables.

## API Documentation

All API endpoints are prefixed with `/api`.

### Authentication Required

Most endpoints require authentication via JWT token in the Authorization header:
```
Authorization: Bearer <token>
```

## Database Schema

See `src/db/schema.sql` for the complete database schema.

