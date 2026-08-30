# POS Lite Web — Product Requirements Document (PRD)

**Product:** POS Lite Web  
**Document Version:** 1.0  
**Status:** Draft  
**Last Updated:** August 28, 2026  

---

## 1. Product Overview

POS Lite is an existing Android application used for billing and day-to-day operations in small shops. POS Lite Web will provide a browser-based version of the same system so users can access the platform from desktop computers, laptops, and tablets without requiring an Android device.

The web application will use the existing POS Lite ASP.NET Core backend, authentication model, shop codes, permissions, and shop databases.

### Product Vision

Provide a fast, simple, and reliable web-based POS and shop management experience that gives small businesses access to POS Lite from any supported browser.

### Core Principle

POS Lite Web is a new client application built on top of the existing backend. It will not duplicate backend business logic or directly access the database.

---

## 2. Problem Statement

The current POS Lite application is Android-based. Users who do not have access to an Android device, or who prefer operating from a larger screen, cannot use the system effectively.

Small-shop owners and staff may require:

- Desktop-based billing
- Easier product and inventory management
- Larger screens for reports and administration
- Access from laptops and tablets
- Browser-based access without installing the Android application

POS Lite Web addresses these needs while using the same backend and business data as the existing application.

---

## 3. Product Goals

### Primary Goals

1. Enable POS Lite access through modern web browsers.
2. Support POS billing from desktop and tablet devices.
3. Reuse the existing backend, authentication, shop codes, users, permissions, and databases.
4. Provide a desktop-friendly experience for shop operations and administration.
5. Maintain functional consistency with the existing POS Lite capabilities where applicable.
6. Make the system simple enough for non-technical shop staff.
7. Provide role-based access to features and operations.

### Success Criteria

The web application should allow an authorized user to:

- Log in using an existing Shop Code, username, and password.
- Access the correct shop data.
- See features based on their role and permissions.
- Perform POS billing.
- Manage products and inventory according to permissions.
- Manage customers, suppliers, purchases, and expenses.
- View sales and financial reports.
- Perform administration and shop settings tasks when authorized.

---

## 4. Target Users

### 4.1 Shop Owner / Administrator

Primary responsibilities:

- Monitor business performance.
- Manage products and categories.
- Manage employees and roles.
- Configure shop settings.
- Review reports.
- Manage inventory, purchases, suppliers, and expenses.
- Access administrative functions.

### 4.2 Cashier

Primary responsibilities:

- Create POS bills.
- Hold and resume orders.
- View order history.
- Manage customers where permitted.
- Access permitted sales reports.

### 4.3 Manager

Primary responsibilities:

- Perform POS operations.
- Monitor sales and reports.
- Manage customers and expenses where permitted.
- Support day-to-day shop operations.

### 4.4 Inventory Staff

Primary responsibilities:

- Manage categories and products.
- Monitor inventory.
- Record stock movements where authorized.
- Manage suppliers.
- Record purchases.

---

## 5. Product Scope

The first web product release will include the following major modules.

### Sales

- Dashboard
- Point of Sale
- Held Orders
- Order History
- Bill Details
- Customers

### Catalog

- Categories
- Products
- Product Images
- Inventory Dashboard
- Stock Movements
- Low Stock Monitoring

### Purchasing

- Suppliers
- Purchases

### Finance

- Expenses
- Daily Sales Reports
- Monthly Sales Reports
- Yearly Sales Reports
- Profit and Loss Reports
- GST Reports

### Administration

- Users
- Roles
- Permissions
- Attendance
- Activity Logs

### Settings

- Shop Settings
- Branding
- User Profile
- Password Management
- Available UI configuration

---

## 6. Functional Requirements

## 6.1 Authentication

The system shall allow users to log in using:

- Shop Code
- Username
- Password

The system shall:

- Authenticate using the existing backend API.
- Use the existing user accounts.
- Maintain the selected Shop Code for the active session.
- Send the Shop Code with applicable API requests.
- Support access token and refresh token handling.
- Support logout.
- Support logout from all sessions where available.
- Handle forced logout and require the user to sign in again when the backend invalidates the session.

### Acceptance Criteria

- Valid users can log in successfully.
- Invalid credentials display a meaningful error.
- Users cannot access protected pages without authentication.
- A user is returned to the login page when their session can no longer be refreshed.

---

## 6.2 Role and Permission-Based Access

The system shall use the existing backend roles and permission model.

The web application shall:

- Show navigation based on user permissions.
- Restrict access to unauthorized screens and actions.
- Hide actions that the user is not expected to perform.
- Handle backend permission errors gracefully.

The frontend shall not be treated as the final security layer. The backend remains the authority for authorization.

---

## 6.3 Dashboard

The dashboard shall provide a quick overview of shop performance.

### Key Information

- Today's sales
- Total orders
- Average order value
- Active held orders
- Low stock count

### Visualizations

- Hourly sales
- Payment method distribution
- Order type distribution
- Relevant sales trends where supported by available data

### Quick Actions

Where permitted, users should be able to quickly access:

- New Sale
- Add Product
- Record Purchase
- Add Expense

---

## 6.4 Point of Sale

The POS module shall support the primary billing workflow.

### Product Selection

Users shall be able to:

- Search products.
- Browse products.
- Filter by category.
- Use barcode or quick code input where supported by the browser and connected hardware.

### Cart Management

Users shall be able to:

- Add products.
- Change quantities.
- Remove products.
- Apply supported discounts.
- Add packaging charges where applicable.
- Review totals before checkout.

### Customer Selection

Users shall be able to:

- Search customers.
- Look up customers by phone number.
- Add a customer where permitted.

### Checkout

The system shall support available backend payment methods:

- Cash
- UPI
- Card

The system shall support available order types:

- Counter
- Parcel

### Bill Completion

After successful checkout, the user shall be able to:

- View the completed bill.
- Print the bill using browser printing.
- Reprint the bill where supported.

---

## 6.5 Held Orders

Users with POS access shall be able to:

- Hold a current order.
- View active held orders.
- Search held orders.
- Resume a held order.
- Cancel a held order where permitted.

---

## 6.6 Order History

Authorized users shall be able to:

- View order history.
- Search orders.
- Filter by date range.
- Filter by payment method.
- Filter by order type.
- View bill details.

Administrative users shall have access to additional order operations where supported by the backend.

---

## 6.7 Customers

The customer module shall support:

- Customer listing.
- Search.
- Phone lookup.
- Customer creation.
- Customer updates where permitted.
- Viewing available loyalty and visit information.

---

## 6.8 Categories

Authorized users shall be able to:

- View categories.
- Search categories.
- Create categories.
- Edit categories.
- Manage parent and child categories where supported.
- Upload category images.
- Delete and restore categories where supported.

---

## 6.9 Products

Authorized users shall be able to:

- View products.
- Search and filter products.
- Create products.
- Edit products.
- Upload product images.
- Configure product pricing.
- Configure stock and reorder levels.
- Configure tax information.
- Configure product visibility on POS.
- Delete and restore products where supported.

---

## 6.10 Inventory

Authorized users shall be able to:

- View inventory summary information.
- View stock movement history.
- Record supported stock movements.
- Monitor low-stock products.
- View low-stock counts.

---

## 6.11 Suppliers

Authorized users shall be able to:

- View suppliers.
- Create suppliers.
- Edit suppliers.
- Delete and restore suppliers where supported.

---

## 6.12 Purchases

Authorized users shall be able to:

- View purchase history.
- Search and filter purchases.
- Create purchases.
- Select suppliers.
- Add purchase items.
- Enter quantities and unit costs.
- View purchase details.

---

## 6.13 Expenses

Authorized users shall be able to:

- View expenses.
- Search and filter expenses.
- Add expenses.
- Edit expenses.
- Delete and restore expenses where supported.
- Use the expense categories supported by the backend.

---

## 6.14 Reports

The reporting area shall provide authorized users with access to available backend reports.

### Sales Reports

- Daily
- Monthly
- Yearly

### Profit and Loss

- Daily
- Monthly
- Yearly

### GST

- Date-range reporting
- Tax totals
- Tax-rate breakdowns

Reports should use backend summary endpoints instead of downloading all business records and calculating totals in the browser.

---

## 6.15 Users

Authorized administrators shall be able to:

- View users.
- Create users.
- Edit users.
- Configure applicable roles and permissions.
- Manage active status.
- Delete and restore users where supported.
- Force logout where supported.

---

## 6.16 Roles and Permissions

Authorized users shall be able to:

- View roles.
- Create roles.
- Edit roles.
- Assign permissions.
- Delete and restore roles where supported.

Permissions should be presented in logical groups to simplify administration.

---

## 6.17 Attendance

The system shall support:

### Employees

- Viewing their own attendance records.

### Authorized Administrators

- Viewing employee attendance.
- Filtering by employee.
- Filtering by date range.

---

## 6.18 Shop Settings and Branding

Authorized administrators shall be able to manage available shop settings, including:

- Business name
- Application display name
- Logo
- GSTIN
- Address
- Phone number
- GST configuration
- Out-of-stock selling configuration
- Available UI selection

---

## 6.19 Activity Logs

Authorized administrators shall be able to:

- View activity logs.
- Filter by module.
- Filter by action type.
- Filter by user.
- Filter by date range.
- Search activity records.
- Navigate paginated results.

---

## 7. User Experience Requirements

The product should be designed for small-shop operations.

### UX Principles

The application should be:

- Simple
- Fast
- Easy to learn
- Easy to operate
- Visually clean
- Professional
- Consistent
- Accessible
- Desktop-first
- Tablet-friendly

### Operational Efficiency

Common tasks should require minimal clicks.

The POS screen should prioritize:

- Fast product discovery.
- Easy cart management.
- Clearly visible totals.
- Large and understandable checkout controls.

### Data Management

Management screens should generally provide:

- Search
- Relevant filters
- Data table or list
- Pagination when required
- Clear create actions
- Clear edit actions
- Confirmation before destructive operations

### Application States

Every data-driven screen should consider:

- Loading
- Success
- Empty state
- Error state
- Permission denied

---

## 8. Non-Functional Requirements

### Performance

The application should:

- Avoid unnecessary API calls.
- Use backend summary endpoints for KPIs and reports.
- Provide appropriate loading indicators.
- Handle paginated data efficiently.

### Reliability

The application should:

- Handle API failures gracefully.
- Display meaningful error messages.
- Recover from expired access tokens using the supported refresh flow.
- Prevent loss of completed business transactions caused by normal UI navigation where practical.

### Security

The application shall:

- Use the existing JWT-based authentication model.
- Send shop context using the required mechanism.
- Avoid direct database access.
- Avoid exposing secrets in client-side code.
- Respect backend authorization responses.

### Browser Support

The initial target should be modern versions of:

- Google Chrome
- Microsoft Edge
- Mozilla Firefox
- Safari where practical

### Responsive Support

Priority order:

1. Desktop
2. Laptop
3. Tablet landscape
4. Tablet portrait
5. Mobile browser

---

## 9. Out of Scope for Initial Release

The following are not required unless specifically added to a future version:

- New backend business logic that duplicates existing API behavior.
- Direct browser-to-database access.
- A separate user system for web users.
- A separate shop or tenant model.
- Native Android functionality that has no meaningful browser equivalent.
- Browser-specific Bluetooth printer integration in the initial release.

Initial printing will use standard browser printing where practical.

---

## 10. Product Constraints

### Existing Backend

The web application must work with the existing POS Lite API unless a backend enhancement is separately planned.

### Existing Authentication

The web application will use the existing:

- Shop Codes
- Users
- Roles
- Permissions
- JWT authentication
- Refresh token mechanism

### Multi-Tenancy

The application must maintain the correct shop context for API operations.

A user must only operate within the data associated with the selected shop.

### API Source of Truth

When API documentation differs from the running backend, Swagger and the implemented backend contract should be treated as the source of truth.

---

## 11. High-Level User Journeys

### Journey 1 — Cashier Creates a Bill

1. User logs in.
2. User opens POS.
3. User searches or selects products.
4. Products are added to the cart.
5. User optionally selects a customer.
6. User reviews quantities and applicable discounts.
7. User selects payment method.
8. User completes checkout.
9. System displays the completed bill.
10. User prints the bill if required.

### Journey 2 — Inventory Staff Records a Purchase

1. User logs in.
2. User opens Purchases.
3. User creates a new purchase.
4. User selects a supplier.
5. User adds products.
6. User enters quantities and unit costs.
7. User saves the purchase.
8. Backend processes the purchase and associated inventory behavior.

### Journey 3 — Shop Owner Reviews Performance

1. Owner logs in.
2. Owner opens Dashboard.
3. Owner reviews today's sales and orders.
4. Owner checks low-stock information.
5. Owner opens Reports.
6. Owner reviews sales, profit/loss, or GST information.

---

## 12. Release Priorities

### Priority 1 — Core Access and Foundation

- Application foundation
- Authentication
- Shop context
- Permissions
- Application shell

### Priority 2 — Core Operations

- Dashboard
- Categories
- Products
- Inventory
- Suppliers
- Purchases

### Priority 3 — POS

- Product selection
- Cart
- Customers
- Checkout
- Held orders
- Printing

### Priority 4 — Management

- Orders
- Expenses
- Reports
- Users
- Roles
- Attendance
- Activity Logs
- Settings

### Priority 5 — Release Hardening

- Functional testing
- Permission testing
- Multi-tenant testing
- Responsive testing
- Performance optimization
- Production deployment

Detailed implementation scope and acceptance criteria for each release version will be maintained in `VERSION_MANAGEMENT.md`.

---

## 13. Dependencies

The web application depends on:

- Existing POS Lite ASP.NET Core API.
- Existing authentication and token services.
- Existing multi-tenant shop configuration.
- Existing PostgreSQL shop databases.
- Existing permission model.
- Existing API availability and deployment environments.
- Swagger/API contracts for implementation verification.

---

## 14. Risks

### API Contract Changes

Changes to backend request or response contracts may affect the web application.

**Mitigation:** Verify API integration against Swagger and the running backend.

### Permission Differences

Some backend write operations may require Admin access even when related permissions exist.

**Mitigation:** Test each module using the intended user roles.

### Multi-Tenant Data Isolation

Incorrect handling of shop context could cause requests to fail or access the wrong tenant context.

**Mitigation:** Centralize API request handling and shop header management.

### Browser and Hardware Differences

Some mobile capabilities may not have direct browser equivalents.

**Mitigation:** Use browser-native alternatives for the initial release and evaluate specialized integrations separately.

---

## 15. Future Enhancements

The following may be considered after the initial web release:

- Advanced printer integrations.
- Keyboard shortcuts for POS.
- Progressive Web App capabilities.
- Offline support, subject to backend and data consistency requirements.
- Additional dashboards and analytics.
- Export options for reports.
- Enhanced hardware integrations.

These items are not part of the initial scope unless explicitly added through version planning.

---

## 16. Document Ownership

This PRD defines the product-level requirements for POS Lite Web.

Supporting documents:

- `WEB_DEVELOPER_GUIDE.md` — Backend, API, authentication, permissions, and integration reference.
- `UI_UX_GUIDELINES.md` — Visual and interaction standards.
- `TECH_STACK.md` — Approved technologies and implementation stack.
- `AI_CODING_GUIDELINES.md` — Rules for AI-assisted development using Cursor.
- `VERSION_MANAGEMENT.md` — Version scope, implementation progress, acceptance criteria, and release tracking.

---

## 17. Approval Criteria

The initial POS Lite Web release will be considered ready for production when:

- Core modules included in the approved version scope are implemented.
- Authentication and shop context work correctly.
- Role and permission restrictions are tested.
- POS billing can be completed successfully.
- Core catalog, inventory, purchasing, customer, expense, and reporting workflows work as expected.
- Administrative features included in the release scope are functional.
- Desktop and tablet layouts are tested.
- Production build succeeds.
- Critical and high-priority defects are resolved.
- The application is validated against the approved API contracts.
