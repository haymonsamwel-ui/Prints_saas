# Creative Business OS User Guide

## 1. What the System Does

Creative Business OS manages the journey from a customer request to completed payment and delivery:

`Customer -> Quotation -> Acceptance -> Order -> Production -> Receipt/Payment -> Delivery`

Each company works in its own workspace. Staff see the areas assigned to their role.

## 2. Setup

### Required environment variables

Create or update `.env` with:

```env
DATABASE_URL="your-postgresql-connection-string"
DIRECT_URL="your-direct-postgresql-connection-string"
NEXTAUTH_SECRET="a-long-random-secret"
```

`NEXTAUTH_SECRET` is used to sign the server session cookie. Never commit `.env` or expose secret values in the browser.

### Install and run

```bash
npm install
npx prisma generate
npm run dev
```

Open `http://localhost:3000`.

For a production check:

```bash
npm run build
npm run start
```

## 3. Register or Sign In

1. Open `/login`.
2. Select **Register** for a new workspace.
3. Enter the studio name, administrator name, email, and password.
4. Select **Create workspace**.
5. The server creates the company, administrator, password hash, and signed session cookie.
6. For an existing account, select **Sign in** and enter the email and password.
7. Select **Sign out** from the workspace header when finished.

Passwords are checked against the database and are not stored in browser local storage.

## 4. Understand the Navigation

The navigation is role-aware:

- **Overview:** KPIs, sales, expenses, production, inventory, and recent orders.
- **Customers:** Customer profiles and recent order information.
- **Products:** Products, services, prices, costs, and margins.
- **Company:** Workspace profile and team settings.
- **Quotations:** Create, share, accept, reject, and convert quotations.
- **Orders:** Create direct orders and track order status.
- **Production:** Track jobs, deadlines, design approval, and production stages.
- **Inventory:** Track stock and low-stock materials.
- **Invoices:** View invoices, receipts, paid amounts, and balances.
- **Payments:** Record and review payments against orders.
- **Deliveries:** Schedule pickup, delivery, or installation.
- **Expenses:** Record operating costs.
- **Notifications:** Review tenant-scoped internal alerts.
- **Reports:** Review sales, payments, expenses, profit, outstanding balances, and top customers.
- **Suppliers:** Maintain supplier and purchasing contacts.
- **Audit log:** Review important actions as an administrator or manager.

## 5. Recommended Daily Workflow

### Step 1: Create the customer

1. Open **Customers**.
2. Select **Add customer**.
3. Enter the customer name, type, phone, email, address, and notes.
4. Save the record.

The customer can now be used in quotations, orders, payments, receipts, and delivery records.

### Step 2: Maintain products and services

1. Open **Products**.
2. Select **Add item**.
3. Enter the service or product name, unit, selling price, cost price, and description.
4. Save the item.

Use cost prices to support future margin and profit reports.

### Step 3: Create and send a quotation

1. Open **Quotations**.
2. Select **New quotation**.
3. Enter the customer name, expiry date, product or service, total, tax rate, and terms.
4. Save the quotation.
5. In the quotation row, select the copy-link icon.
6. Send the copied link to the customer by email, WhatsApp, or another channel.
7. Use the PDF icon when a downloadable quotation is needed.
8. Use the WhatsApp icon for a prepared WhatsApp message.

The customer link is signed and can be opened without an internal account.

### Step 4: Customer accepts or rejects

The customer opens the link and sees:

- Company information.
- Customer name.
- Quotation number.
- Issue and expiry dates.
- Items.
- Subtotal, tax, and total.
- Notes and terms.

The customer selects **Accept quotation** or **Decline**. The response is saved to the quotation. A quotation that has already been accepted or rejected cannot be answered again through the public link.

When the customer opens a draft quotation link, the quotation is marked `VIEWED`. If the expiry date has passed, the quotation is marked `EXPIRED` and cannot be accepted.

### Step 5: Convert an accepted quotation to an order

1. Return to **Quotations**.
2. Find the quotation with status `ACCEPTED`.
3. Select the arrow action.
4. The system creates:
   - An order for the same customer.
   - Matching order items.
   - A confirmed order status.
   - A production job.
5. The system prevents creating a second order from the same quotation.

### Step 6: Create a receipt

1. In **Quotations**, find an accepted quotation.
2. Select the receipt icon.
3. The system creates a receipt using the quotation customer, subtotal, tax, and total.
4. Open **Invoices** to view the receipt.
5. Record any later payment from **Payments**.

The system prevents duplicate receipt creation for the same quotation.

### Step 7: Manage production

1. Open **Production**.
2. Review the automatically created job or select **New job** for a direct job.
3. Set the deadline and production notes.
4. Move the job through the relevant stages:
   - Order confirmed.
   - Designing.
   - Design approval.
   - Printing.
   - Finishing.
   - Quality check.
   - Ready.
   - Delivered.
5. Use the approval field and notes to communicate production readiness.

Artwork files are not uploaded to this system. Store artwork in the approved external design or file-sharing system and keep only a reference or status in the job notes.

### Step 8: Record payments

1. Open **Payments**.
2. Select the payment action.
3. Enter the order number, amount, method, reference number, and notes.
4. Save the payment.
5. The linked order's paid amount increases and its balance decreases.
6. Review the result on the order and dashboard.

Use a bank reference, mobile-money reference, or receipt number where available.

### Step 9: Schedule delivery or installation

1. Open **Deliveries**.
2. Select **Schedule delivery**.
3. Enter the order number.
4. Choose `CUSTOMER_PICKUP`, `DELIVERY`, or `INSTALLATION`.
5. Add the address, driver or installer, date, costs, and notes.
6. Save the schedule.
7. Update delivery status as the work progresses.

### Step 10: Record expenses

1. Open **Expenses**.
2. Select **Add expense**.
3. Enter the title, category, amount, date, payment method, and notes.
4. Save the expense.
5. The dashboard uses expenses when calculating operational totals.

### Step 11: Review reports

1. Open **Reports** as an administrator, manager, or finance user.
2. Review sales, payments received, expenses, estimated profit, and outstanding balances.
3. Use the monthly chart to compare sales over the year.
4. Use the top-customer list to identify the highest-value customer relationships.

Estimated profit is calculated from recorded order sales minus recorded expenses. It is an operational estimate, not a complete accounting statement.

### Step 12: Maintain suppliers and audit history

1. Open **Suppliers** to add supplier names, contacts, addresses, and notes.
2. Use supplier information when managing materials and supplier-related expenses.
3. Open **Audit log** as an administrator or manager to review important creates and status changes.
4. Open **Notifications** to review new order, payment, and accepted quotation alerts.

### Step 13: Review a customer statement

1. Open **Customers**.
2. Select **Statement** beside a customer.
3. Review quotations, orders, invoices, receipts, payments, and outstanding balance.
4. Select **Print** to print or save the statement as a PDF from the browser.

The notifications page also creates reminders for invoice balances older than 30 days. Inventory stock-out actions are rejected when the requested quantity would make stock negative.

## 6. How Data Security Works

- Login creates a signed HTTP-only cookie on the server.
- The server looks up the user and company from that cookie.
- API routes use the authenticated company ID for queries and writes.
- Request parameters cannot choose another tenant's company.
- Public quotation links use a signed token bound to both the quote number and company.
- Customer public pages expose only the quotation information needed for acceptance.
- Passwords are hashed with `bcryptjs` before storage.

The UI hides navigation based on role, and the API independently enforces the role for each operational area. A user cannot bypass the interface restrictions by calling an API directly.

## 7. Status Meanings

### Quotation statuses

- `DRAFT`: Still being prepared.
- `SENT`: Shared with the customer.
- `VIEWED`: Customer has viewed it when view tracking is added.
- `ACCEPTED`: Customer approved the work.
- `REJECTED`: Customer declined the work.
- `EXPIRED`: Expiry date has passed.
- `CANCELLED`: Workspace cancelled the quotation.

### Order statuses

- `NEW`: Recently created.
- `CONFIRMED`: Customer work is confirmed.
- `IN_PRODUCTION`: Work is underway.
- `READY`: Work is ready for handover.
- `DELIVERED`: Handover has occurred.
- `COMPLETED`: Commercial and operational work is complete.
- `CANCELLED`: Order was cancelled.

### Production statuses

`ORDER_CONFIRMED`, `DESIGNING`, `DESIGN_APPROVAL`, `PRINTING`, `FINISHING`, `QUALITY_CHECK`, `READY`, and `DELIVERED` represent the production lifecycle.

### Delivery statuses

`PENDING`, `ASSIGNED`, `OUT_FOR_DELIVERY`, `DELIVERED`, `FAILED`, and `CANCELLED` represent the delivery lifecycle.

## 8. What Was Built and Why

The implementation was completed in these stages:

1. **Database loading:** Quotation reads were optimized to use one relational query and select only rendered fields.
2. **Sales workflows:** Accepted quotations now convert to orders, copy their items, and create production jobs.
3. **Order creation:** Direct order creation was connected to the database instead of being only a visual dialog.
4. **Operations:** Delivery scheduling and expense tracking were added using the existing Prisma models.
5. **Authentication:** Signed HTTP-only sessions, database login, registration sessions, and logout were added.
6. **Tenant isolation:** Data APIs were changed to resolve `companyId` from the authenticated session.
7. **Notifications:** Tenant-scoped notification listing and mark-as-read behavior were added.
8. **Customer quotation response:** Signed public quotation links were added with accept and reject actions.
9. **Accepted quotation documents:** Admins can create receipts from accepted quotations and view them in invoices.
10. **Role enforcement:** API routes now return `403` when an authenticated role is not allowed to perform the requested operation.
11. **Reporting:** A finance and management report shows sales, payments, expenses, estimated profit, outstanding balances, monthly sales, and top customers.
12. **Validation:** TypeScript checks and production builds were run after the feature work.
13. **Operations:** Added supplier contacts, audit history, automatic core activity notifications, and dependency-free financial smoke tests.

## 9. Troubleshooting

### The page shows no records

- Confirm the user is signed in.
- Confirm `DATABASE_URL` is set.
- Confirm the logged-in company has data.
- Check the browser network response for a `401` or `500` status.
- Run `npx prisma generate` after schema or dependency changes.

### The public quotation link does not open

- Copy a new link from the quotation row.
- Do not remove or change the `token` query parameter.
- Confirm the quotation still exists.
- Confirm the link is being opened at the same deployed application domain.

### A receipt cannot be created

- Confirm the quotation status is `ACCEPTED`.
- Check whether a receipt already exists for that quotation.
- Confirm the company has a quotation and invoice prefix setting.

### The application cannot authenticate

- Confirm `NEXTAUTH_SECRET` is present in `.env`.
- Restart the development server after changing `.env`.
- Confirm the email and password match the database user.

## 10. Developer Checks

```bash
npx tsc --noEmit
npm run lint
npm run build
```

The repository may contain pre-existing lint warnings or errors unrelated to a feature change. The production build and TypeScript check are the required baseline checks before deployment.
