# Barber Site - Gentleman's Cut

## Overview
A full-stack barbershop appointment booking website built with React, Express, and PostgreSQL.

## Tech Stack
- **Frontend**: React 18 with Vite, TailwindCSS, Radix UI components
- **Backend**: Express.js with TypeScript
- **Database**: PostgreSQL with Drizzle ORM
- **Styling**: TailwindCSS with custom animations

## Project Structure
```
├── client/           # React frontend
│   ├── src/
│   │   ├── components/  # UI components
│   │   ├── pages/       # Page components (Home, Booking, Admin)
│   │   ├── lib/         # Utilities and query client
│   │   └── hooks/       # Custom React hooks
├── server/           # Express backend
│   ├── index.ts      # Server entry point
│   ├── routes.ts     # API routes
│   ├── db.ts         # Database connection
│   ├── storage.ts    # Data access layer
│   └── replit_integrations/  # Auth integration
├── shared/           # Shared types and schemas
│   └── schema.ts     # Drizzle database schema
└── attached_assets/  # Static assets
```

## Scripts
- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run db:push` - Push database schema changes

## Environment Variables
- `DATABASE_URL` - PostgreSQL connection string (auto-configured)

## Key Features
- Homepage with services and barbers showcase
- Appointment booking system
- Admin dashboard for managing barbers and services
