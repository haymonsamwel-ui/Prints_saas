# Creative Business OS Product Requirements Document

## 1. Product Summary

Creative Business OS is a multi-tenant business management system for printing, branding, design, signage, and production companies.

The core business flow is:

`Customer -> Quotation -> Acceptance -> Order -> Production -> Payment/Receipt -> Delivery -> Profit`

The system is designed to keep each company's data separate while giving staff one workspace for sales, operations, production, finance, and delivery.

## 2. Product Goals

- Replace disconnected spreadsheets and messaging threads with one operational workspace.
- Make the quotation-to-cash process traceable.
- Give customers a simple way to review and accept quotations.
- Connect accepted quotations to orders and production work.
- Track payments, receipts, expenses, inventory, and delivery status.
- Provide clear role-based navigation and tenant isolation.
- Keep artwork files outside the application while storing useful production metadata.

## 3. Users and Roles

| Role | Main responsibilities |
| --- | --- |
| ADMIN | Full workspace access, company setup, users, sales, operations, and finance |
| MANAGER | Workspace oversight and operational management |
| SALES | Customers, products, quotations, orders, invoices, and payments |
| DESIGNER | Production jobs and design approval progress |
| PRODUCTION | Production jobs and inventory |
| FINANCE | Invoices, payments, receipts, and expenses |
| DELIVERY | Orders, production readiness, and delivery tracking |

The interface hides navigation areas that are not assigned to a role. Server APIs also verify the authenticated tenant. Role enforcement inside every mutation remains a follow-up hardening task.

## 4. Current Functional Requirements

### 4.1 Authentication and Tenant Security

- A user can register a company workspace and administrator account.
- A user can sign in with an email and password.
- The server creates a signed, HTTP-only session cookie.
- The server resolves the company from the session instead of trusting a company ID or slug sent by the browser.
- A user can sign out and clear the server session.
- Tenant-owned API reads and writes are scoped to the authenticated company.
- `NEXTAUTH_SECRET` must be configured for server sessions.

### 4.2 Dashboard

The dashboard provides:

- Total sales.
- Amount paid.
- Outstanding balances.
- Expenses.
- Active production jobs.
- Monthly sales and expense charts.
- Production status counts.
- Low-stock items.
- Recent orders and customer pipeline information.

### 4.3 Customer Management

Users can:

- Create customer records.
- Store customer type, company, phone, email, address, and notes.
- View customers and recent order information.
- Reuse customers in quotations, orders, invoices, payments, and deliveries.

### 4.4 Product and Service Catalog

Users can:

- Create products or services.
- Store units, selling prices, cost prices, descriptions, and active status.
- Search the catalog.
- Use product information as the basis for pricing and future margin reporting.

### 4.5 Quotations

Users can:

- Create a quotation for a customer.
- Add an expiry date, service description, total, tax rate, and terms.
- View quotation status: draft, sent, viewed, accepted, rejected, expired, or cancelled.
- Download a PDF quotation.
- Share a quotation through WhatsApp.
- Copy a signed customer-facing quotation link.
- Edit and persist quotation status.

Customers can:

- Open the signed quotation link without an internal login.
- Review company, customer, item, tax, total, expiry, notes, and terms.
- Accept or reject the quotation.
- Submit their response once; a completed response cannot be changed through the public link.

### 4.6 Accepted Quotation Actions

After a quotation is accepted, an administrator or authorized staff member can:

- Convert it into an order.
- Automatically copy quotation items into order items.
- Automatically create a production job for the order.
- Create a receipt from the accepted quotation.
- Prevent duplicate order and receipt creation for the same quotation.

### 4.7 Orders

Users can:

- Create a direct order for an existing customer.
- Store due date, item, total, deposit, paid amount, balance, notes, and status.
- Track order status from new or confirmed through production, ready, delivered, completed, or cancelled.
- View customer and payment balance information.

### 4.8 Production

Users can:

- Create a production job.
- Link a job to an order.
- Store deadline, production notes, design status, approval status, and assigned staff metadata.
- Track the workflow through designing, approval, printing, finishing, quality check, ready, and delivered.

The application stores metadata and external references only. It does not store raw artwork files.

### 4.9 Inventory

Users can:

- Add stock using an item, SKU, unit, quantity, minimum stock, and supplier.
- Record stock transactions.
- View healthy and low-stock status.
- Use the dashboard to identify low-stock items.

### 4.10 Payments, Invoices, and Receipts

Users can:

- Create invoices and receipts.
- Record totals, tax, payments, balances, payment methods, and payment details.
- Record payments against orders.
- Track payment references and payment dates.
- View paid, partial, and open balances.

### 4.11 Delivery and Installation

Users can:

- Schedule pickup, delivery, or installation.
- Link delivery work to an order and customer.
- Store address, driver or installer, date, delivery cost, installation cost, and notes.
- Track delivery status through pending, assigned, out for delivery, delivered, failed, or cancelled.

### 4.12 Expenses

Finance users can:

- Record operating expenses.
- Classify expenses by category.
- Store amount, date, payment method, and notes.
- View recorded expense totals.

### 4.13 Notifications

Users can:

- View tenant-scoped internal notifications.
- See unread notifications highlighted.
- Mark notifications as read.

The data model already supports notification types for orders, payments, stock, production deadlines, quotation acceptance, quotation expiry, and overdue payments. Automatic event generation and external delivery are future work.

## 5. Technical Architecture

- Next.js App Router for pages and API route handlers.
- TypeScript for application code.
- Tailwind CSS for the interface.
- Prisma ORM for PostgreSQL access.
- PostgreSQL or Supabase PostgreSQL for persistence.
- `bcryptjs` for password hashing.
- Signed HMAC server sessions using `NEXTAUTH_SECRET`.
- Client components for interactive tables and dialogs.
- Server API routes for database operations and tenant checks.
- Lightweight browser profile data remains in local storage for some presentation-only company profile fields.

## 6. Data Ownership Rules

Every tenant-owned record must have a `companyId`. API handlers must obtain the company from the authenticated server session. Browser-provided company slugs may be retained as harmless request data for compatibility, but they must not decide which tenant is queried.

Public quotation access is the exception: it uses a signed token bound to both the quotation number and company ID, and exposes only the quotation information needed by the customer.

## 7. Primary Workflows

### Sales to production

1. Create or select a customer.
2. Create a quotation.
3. Copy the signed link and send it to the customer.
4. Customer accepts the quotation.
5. Convert the accepted quotation into an order.
6. The system creates the order items and production job.
7. Production advances the job status.
8. Finance creates a receipt or records payments.
9. Delivery schedules pickup, delivery, or installation.
10. Dashboard metrics reflect sales, payments, expenses, and operational status.

### Accepted quotation to receipt

1. Open the quotations page.
2. Confirm the quotation status is `ACCEPTED`.
3. Use the receipt action on the quotation.
4. The server creates a receipt with the quotation customer, subtotal, tax, total, and source note.
5. The receipt appears on the invoices page.
6. Duplicate receipt creation for the same quotation is rejected.

## 8. Non-Functional Requirements

- Tenant data must not be readable across company boundaries.
- Passwords must never be stored in browser local storage.
- Public quotation links must be signed and non-guessable.
- Financial operations must validate positive numeric amounts and prevent invalid balances.
- Pages should provide loading, empty, and error states.
- Production builds must pass TypeScript validation before deployment.
- The system should remain usable on desktop and mobile layouts.

## 9. Future Roadmap

### Priority 1

- Enforce role permissions inside every API mutation.
- Add database-backed company profile and team management.
- Add automated audit log records for status, payment, receipt, and deletion events.
- Add tests for tenant isolation, quotation acceptance, order conversion, and financial calculations.

### Priority 2

- Add supplier and purchase management.
- Add inventory reservation and material consumption from production jobs.
- Add automatic internal notifications for important business events.
- Add reporting for profit by order, product, customer, and month.

### Priority 3

- Add email and WhatsApp delivery of quotation links.
- Add customer portal access for quotations, orders, invoices, and delivery status.
- Add payment gateway integrations.
- Add exports for PDF, CSV, and accounting workflows.
- Add backups, monitoring, rate limiting, and production security review.

## 10. Acceptance Criteria

The MVP is considered operational when:

- A company can register and sign in.
- Authenticated APIs cannot read another tenant's records.
- A quotation can be created, shared, accepted, and rejected.
- An accepted quotation can produce an order, production job, and receipt.
- Payments, expenses, inventory, and delivery records persist in PostgreSQL.
- The production build succeeds.
- Users can understand the next action from each workflow status.
