# Creative Business Management System

A multi-tenant SaaS for creative businesses covering the full flow:

Customer → Quotation → Order → Production → Payment → Delivery → Profit

## Project status

This project is being built in phases. The work is scoped to a production-ready MVP for creative printing, branding, design, and production businesses.

## Todo list

### Phase 1: Foundation and authentication
- [x] Set up the project structure and framework foundation
- [x] Configure the database schema with multi-tenant design
- [ ] Implement authentication and user roles
- [x] Add company setup and company profile management
- [x] Build the dashboard with KPI cards and charts
- [x] Create customer management and search/filtering
- [x] Add product and service management

### Phase 2: Sales workflow
- [x] Build quotation management and PDF-ready layouts
- [x] Implement order management and status flow
- [x] Add invoice generation and payment tracking
- [x] Create payment receipts and balance updates

### Phase 3: Production and delivery
- [x] Build production job management and design metadata
- [x] Add job assignment and status progression
- [ ] Implement delivery and installation tracking

### Phase 4: Operations and finance
- [x] Add inventory management and stock movement tracking
- [ ] Create suppliers and purchase tracking
- [ ] Add expense tracking and categories

### Phase 5: Employees and reporting
- [ ] Add employee and freelancer management
- [ ] Implement commissions and performance tracking
- [ ] Create reporting modules for sales, expenses, profit, and inventory

### Phase 6: Customer and advanced features
- [ ] Add the customer portal experience
- [ ] Implement notification architecture for internal and external channels
- [ ] Add advanced analytics and export support
- [ ] Final security hardening and tenant isolation review

## Tech stack

- Next.js 16
- TypeScript
- Tailwind CSS
- Prisma ORM
- PostgreSQL
- Supabase PostgreSQL and Auth
- Zod validation
- bcryptjs password hashing dependency

## Getting started

```bash
npm install
npm run dev
```

Open http://localhost:3000 in the browser.

## Notes

- The system intentionally does not store artwork or raw design files.
- Only lightweight metadata such as design status, approval status, notes, and external references are stored.
- Every tenant-owned record must remain isolated by company.
- Prisma Client is generated from `prisma/schema.prisma`; set `DATABASE_URL` before applying migrations or querying production data.
- The current browser session and CRUD interactions are an MVP shell until PostgreSQL credentials are configured.
- Supabase setup requires `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, and the Supabase PostgreSQL connection string in `DATABASE_URL`.
