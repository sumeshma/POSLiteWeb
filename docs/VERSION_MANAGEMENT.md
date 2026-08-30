# POS Lite Web — Version Management

**Product:** POS Lite Web  
**Document Version:** 1.0  
**Status:** Active  
**Last Updated:** August 28, 2026  

---

# 1. Purpose

This document defines how POS Lite Web development will be divided, tracked, validated, and released.

The project is being developed primarily using Cursor AI. Therefore, version management must prevent uncontrolled implementation, feature overlap, and unclear completion status.

This document answers:

> **What are we building now, what is already completed, what comes next, and when can a version be considered complete?**

This document is the source of truth for the **current development scope and version status**.

---

# 2. Version Management Principles

Every version must have:

- A clear objective
- A defined scope
- Explicitly excluded work
- Acceptance criteria
- A validation status
- Known limitations or follow-up work

The development team and AI coding tools must not assume that every item in the PRD belongs to the current version.

A version is complete only when:

1. The approved scope is implemented.
2. Acceptance criteria are satisfied.
3. Required API integrations work.
4. Relevant validation has been completed.
5. Known limitations are documented.

---

# 3. Version Status Definitions

Use the following status values consistently.

| Status | Meaning |
|---|---|
| **Planned** | Approved for a future version but implementation has not started. |
| **In Progress** | Implementation is actively underway. |
| **Feature Complete** | Intended features are implemented but final validation may still be pending. |
| **Testing** | The version is undergoing functional, integration, or regression testing. |
| **Blocked** | Progress cannot continue because of a dependency or unresolved issue. |
| **Ready for Release** | Scope and validation are complete and the version is approved for deployment. |
| **Released** | The version has been deployed to the intended environment. |
| **Deferred** | Previously considered work has been moved to a future version. |

Do not use ambiguous status descriptions such as:

- Almost done
- Mostly complete
- Done except a few things

Use a defined status and record the actual outstanding work.

---

# 4. Version Numbering

POS Lite Web versions should use simple incremental release numbers.

Recommended format:

```text
v1.0
v1.1
v1.2
v2.0
```

### Major Version

A major version represents a significant release milestone.

Example:

```text
v1.0 — First usable POS Lite Web release
v2.0 — Major product expansion or architecture milestone
```

### Minor Version

A minor version represents an approved functional expansion or meaningful improvement.

Example:

```text
v1.1 — Additional business modules
v1.2 — Reporting and operational enhancements
```

Patch-level versions may be introduced when production bug-fix releases require them:

```text
v1.0.1
v1.0.2
```

Do not create artificial versions for trivial code changes during active feature development.

---

# 5. Development Versioning Strategy

The recommended development sequence is organized around usable milestones rather than individual screens.

```text
Foundation
    ↓
Core Application
    ↓
Core Master Data
    ↓
Inventory & Operations
    ↓
Standard POS
    ↓
POS Machine Mode
    ↓
Reporting & Administration
    ↓
Hardening & Release
```

Each version should leave the application in a coherent state.

Avoid creating versions that implement many disconnected screens without producing a usable workflow.

---

# 6. Current Roadmap Overview

The roadmap below is the initial development plan. It may be refined as the existing backend and final PRD are reviewed.

| Version | Name | Primary Goal | Initial Status |
|---|---|---|---|
| **v0.1** | Foundation | Establish the web application architecture and reusable shell | Feature Complete |
| **v0.2** | Authentication & Access | Enable secure login, shop context, and permission-aware access | Feature Complete |
| **v0.3** | Core Masters | Implement essential business master data workflows | Feature Complete |
| **v0.4** | Inventory Operations | Implement core inventory and stock-related workflows | Feature Complete |
| **v0.5** | Standard Web POS | Deliver the primary browser-based billing experience | Feature Complete |
| **v0.6** | POS Machine Mode | Deliver dedicated terminal/touchscreen POS experience | Feature Complete |
| **v0.7** | Business Operations | Complete customers, purchases, expenses, and related workflows | Feature Complete |
| **v0.8** | Reports & Administration | Add reporting, administration, logs, and management features | Feature Complete |
| **v0.9** | Hardening | Fix gaps, improve reliability, and complete cross-module validation | Feature Complete |
| **v1.0** | First Release | Production-ready initial POS Lite Web release | Feature Complete |

The exact module allocation must follow the approved `PRD.md` and verified backend capabilities.

---

# 7. Version v0.1 — Foundation

**Status:** Feature Complete

## Objective

Create a stable frontend foundation that all future modules can use.

## Scope

- Initialize the approved Next.js application.
- Configure TypeScript.
- Configure Tailwind CSS.
- Configure shadcn/ui.
- Configure the approved icon library.
- Configure linting and formatting.
- Establish environment configuration.
- Establish the recommended project structure.
- Create the centralized API client foundation.
- Create reusable application layout components.
- Create loading, error, empty, and permission state patterns.
- Establish shared utilities for:
  - API communication
  - Currency formatting
  - Date formatting
  - General utilities
- Establish theme foundations according to `UI_UX_GUIDELINES.md`.

## Out of Scope

- Complete business modules.
- Full POS functionality.
- Large dashboards.
- Reporting implementation.
- Unapproved global state management.

## Acceptance Criteria

- [x] Application runs locally.
- [x] TypeScript is configured and used.
- [x] Linting is configured.
- [x] Approved UI stack is configured.
- [x] Environment-based API configuration exists.
- [x] Reusable application shell exists.
- [x] Shared UI state patterns exist.
- [x] Production build succeeds.

---

# 8. Version v0.2 — Authentication & Access

**Status:** Feature Complete

## Objective

Enable users to securely access the web application using the existing POS Lite authentication model.

## Scope

- Login screen.
- Shop Code handling.
- Username and password authentication.
- Access token handling.
- Refresh token handling where supported.
- Logout.
- Session-expiry handling.
- Protected routes.
- Permission-aware navigation.
- Permission-aware action visibility.
- Unauthorized and forbidden states.

## Out of Scope

- New authentication architecture.
- Separate user management backend.
- New permission model.

## Acceptance Criteria

- [x] Valid users can log in.
- [x] Invalid login is handled correctly.
- [x] Shop context is correctly established.
- [x] Protected pages are inaccessible without authentication.
- [x] Unauthorized API responses are handled consistently.
- [x] Logout clears the active session correctly.
- [x] Navigation reflects available permissions.

---

# 9. Version v0.3 — Core Masters

**Status:** Feature Complete

## Objective

Provide the essential master data required for normal POS and business operations.

## Candidate Scope

The exact modules must match the approved PRD and available backend APIs.

Implemented against the verified Canada development API:

- Products
- Categories
- Customers
- Suppliers

Not implemented (no backend master APIs / tables):

- Brands
- Units (product `unit` is a constrained string field, not a Units module)
- Taxes (product `taxRatePercent` is a numeric field, not a Taxes module)

## Common Capabilities

Where supported:

- List
- Search
- Filter
- Pagination
- Create
- Edit
- View details
- Active/inactive management
- Image handling

## Acceptance Criteria

For each included module:

- [x] List loads from the real API.
- [x] Loading state exists.
- [x] Empty state exists.
- [x] Error state exists.
- [x] Search/filter works according to API capabilities.
- [x] Create works.
- [x] Edit works.
- [x] Validation errors are understandable.
- [x] Permission behavior is correct.
- [x] Production build succeeds.

---

# 10. Version v0.4 — Inventory Operations

**Status:** Feature Complete

## Objective

Provide core inventory and stock management workflows supported by the existing backend.

## Candidate Scope

Depending on the PRD and API capabilities:

- Inventory overview
- Current stock
- Stock movement/history
- Stock adjustments
- Low-stock information
- Inventory-related search and filters

## Implemented

- Inventory overview from `GET /api/inventory/dashboard` (backend totals, recent movements sample).
- Current stock list reused from `GET /api/products` (no dedicated all-stock inventory list API).
- Low-stock list from `GET /api/inventory/low-stock` with server paging and search.
- Out-of-stock view from the complete products list (`stockQuantity <= 0`).
- Stock history from `GET /api/inventory/movements` with search, type, date, and paging.
- Product stock detail dialog (product record + recent movements by `productId`).
- Stock in / stock out / adjustment via `POST /api/inventory/movements` (`inventory.manage`).
- Permission-aware Catalog navigation: Inventory, Stock history.

## Out of Scope

- Reimplementation of backend inventory calculations.
- Direct database operations.
- Unapproved stock workflows.
- Standard Web POS, purchases, expenses, reports, and later versions.

## Known Limitations

- There is no `GET /api/inventory` all-stock list. Current stock uses the Products API.
- `ProductStockSummaryDto` from low-stock does not include barcode, category, or `updatedAt`.
- There is no dedicated out-of-stock-only endpoint. Out-of-stock uses the complete products list.
- `includeOutOfStock` on low-stock adds out-of-stock rows; it is not an out-of-stock-only filter.
- POST movements accept only `StockIn`, `StockOut`, and `Adjustment`. Sale / Purchase / SaleReversal appear in history only.
- There is no stock-movement delete/update API. Probe history rows cannot be removed.
- Guide text says POST `/movements` is Admin; UI permission key is `inventory.manage`. Admin still bypasses on the client. Backend authorization remains authoritative.

## Acceptance Criteria

- [x] Inventory data comes from approved backend APIs.
- [x] Stock quantities display consistently.
- [x] Filters and pagination use backend capabilities where available.
- [x] Stock actions enforce available permissions.
- [x] Mutation results refresh affected data.
- [x] Error and loading states are handled.

---

# 11. Version v0.5 — Standard Web POS

**Status:** Feature Complete

## Objective

Deliver a complete browser-based POS billing experience for desktop, laptop, and tablet users.

## Scope

- Standard POS layout.
- Product search.
- Category navigation.
- Product selection.
- Barcode scanner input workflow.
- Cart management.
- Quantity changes.
- Product removal.
- Customer selection.
- Supported discounts.
- Packaging charges where supported.
- Tax and totals display.
- Hold order.
- Resume held order.
- Checkout.
- Supported payment methods.
- Duplicate submission protection.
- Successful transaction feedback.
- Failed transaction feedback.
- Print/reprint workflow where supported.

## Implemented

- Standard Web POS page at `/pos` inside the existing app shell (`pos` permission).
- POS product catalog from `GET /api/products?isActive=true&showOnPos=true` with search and category chips.
- Keyboard/scanner lookup: Enter matches barcode, SKU, or quick code, then adds to the local cart.
- Local cart (React reducer): add, quantity, remove, clear, item discount, bill discount, packaging, order type, customer, hold id.
- Customer walk-in, search/select, phone lookup (`GET /api/customers/lookup`), optional create via the existing customer modal.
- Hold / resume / cancel via `/api/billing/holds`.
- Checkout via `POST /api/billing/checkout` (Cash, Upi, Card; Counter / Parcel).
- Success bill dialog using server `BillResponseDto`; browser print plus `POST /api/billing/{id}/record-print`.
- After a successful sale, product and inventory queries are invalidated. Cart is cleared only after backend confirmation.

## Out of Scope

- POS Machine Mode (v0.6).
- Offline POS, camera scanning, hardware printers, cash drawers.
- Split payments, credit sales, and client-side tax/stock engines.
- Order history module (separate from the post-sale bill dialog).

## Known Limitations

- Shop code `DEV` on the South India API returned shop settings `businessName` / `appDisplayName` **Pure Cane**. Shop code `PURECANE` was not used. No database named `purecane` was accessed directly.
- There is no dedicated barcode endpoint; lookup uses the products list plus exact barcode/SKU/quick-code match.
- Hold create accepts `customerName`, not `customerId`. Checkout uses `customerId` when a real customer is selected.
- Resume marks a hold as `Resumed` and drops it from active holds; cancel after resume is rejected.
- UPI and Card must match the bill total exactly. Cash may overpay and return change. Split payment and credit sales are not in the API.
- Parcel orders require packaging charge > 0.
- When GST is enabled, cart tax is not estimated; the server bill is authoritative. DEV had `isGstEnabled: false`.
- Loyalty redemption is on the checkout DTO but was not exposed in the UI (unverified redemption rules).
- Probe bill `BILL-20260828-0001` was created then soft-deleted. Probe hold `HOLD-20260828-0001` was resumed (consumed). A second hold was created and cancelled.

## Acceptance Criteria

- [x] Products can be found quickly.
- [x] Products can be added to the cart.
- [x] Quantities can be changed.
- [x] Totals update correctly according to backend-supported behavior.
- [x] Customers can be selected where supported.
- [x] Orders can be held and resumed where supported.
- [x] Checkout uses real backend APIs.
- [x] Payment processing prevents accidental duplicate submission.
- [x] Success and failure states are clear.
- [x] Relevant permissions are respected.
- [x] The workflow works on desktop and tablet layouts.

---

# 12. Version v0.6 — POS Machine Mode

**Status:** Feature Complete

## Objective

Provide a dedicated, high-speed billing interface optimized for POS terminals and touchscreens.

## Scope

- Dedicated POS Machine Mode layout at `/pos/machine` using the `(pos-machine)` route group.
- Distraction-free billing workspace with a compact top bar (no persistent application sidebar).
- Large touch-friendly product cards, category chips, quantity controls, and payment action.
- Prominent product search and barcode keyboard-wedge workflow (shared with Standard POS).
- Permanent order panel with prominent total and `PAY ₹…` action.
- Quick actions: customer, hold, held orders, clear, payment, return to main application.
- Landscape-first grid that stacks the order panel on narrow screens.
- Optional keyboard support: `/` focuses search, `F2` opens checkout, `F4` holds the order.

## Shared Logic Requirement

POS Machine Mode reuses `usePosWorkspace`, cart reducer, billing mutations, checkout/hold/customer/bill dialogs, and `/api/billing` contracts. Presentation is separate from Standard Web POS; checkout is not a second implementation.

## Access

- Main navigation: **POS Machine** (`pos` permission)
- Standard POS header link: **POS Machine Mode**
- Machine Mode menu: return to main application, Standard POS, logout

## Acceptance Criteria

- [x] POS Machine Mode can be accessed through the approved mode-selection approach.
- [x] Normal persistent sidebar does not reduce billing workspace.
- [x] Primary controls are touch-friendly.
- [x] Product search is immediately accessible.
- [x] Barcode workflow works efficiently.
- [x] Current order remains easy to review.
- [x] Total is always prominent.
- [x] Payment action is highly visible.
- [x] Checkout behavior matches Standard Web POS.
- [x] No duplicate POS business logic has been created.

---

# 13. Version v0.7 — Business Operations

**Status:** Feature Complete

## Objective

Complete remaining daily business workflows required for the first release.

## Implemented Scope

- Customers and suppliers: reused from v0.3 (not duplicated).
- Purchases: list, search, supplier/date filters, pagination, detail, create.
- Expenses: list, search, category/date filters, pagination, detail, create, update, delete, restore, deleted list.
- Expense categories: **read-only** list from `GET /api/expenses/categories` (fixed strings). Category CRUD is not available in the backend.

## Backend Gaps (not implemented; not faked)

- Purchase update / cancel / delete: HTTP 405. No purchase status field.
- Purchase tax, line discount, and purchase-number client generation: not in the API. `purchaseNumber` is displayed as returned (`PUR-…`).
- Expense category create/edit/delete: HTTP 405 on `POST /api/expenses/categories`.
- Expense numbers: no `next-number` endpoint and no `expenseNumber` on `ExpenseResponseDto`. The UI does not generate `EX1` / `EX2` values.
- Expense payment/reference fields: not on the verified DTO.

## Acceptance Criteria

For every included workflow:

- [x] Real API integration is complete for supported purchase and expense operations.
- [x] List and detail views work.
- [x] Create/edit operations work where applicable (purchase create; expense create/update; purchase edit not available).
- [x] Permission handling is correct (`purchases`, `purchases.manage`, `expenses`, `expenses.manage`).
- [x] Loading, empty, and error states exist.
- [x] Related data refreshes after mutations (purchases also invalidate products and inventory).
- [x] Production build succeeds (see validation section of the implementation report).

---

# 14. Version v0.8 — Reports & Administration

**Status:** Feature Complete

Application package version after this cycle: `0.9.0` (v0.8 and v0.9 shipped together; identities remain separate).

## Objective

Provide a useful operational dashboard and reports based only on verified backend APIs.

## Approved Scope (this cycle)

The explicit development request for this cycle was Dashboard, Reports & Analytics. Administration modules were candidate items in this document and remain **deferred**.

### Dashboard (`/`)

- Period presets mapped to backend report endpoints: Today, Yesterday, This month, This year.
- KPI cards from verified summaries: sales, bills, average bill, held orders, stock alerts.
- Profit/loss KPI row when `reports.profit` is present: purchases, expenses, gross profit, net profit.
- Sales visualization from backend breakdowns (hourly / daily / monthly).
- Payment method and order type donut charts when the selected endpoint returns those arrays.
- Recent bills, low stock, recent purchases, recent expenses, with links to existing modules.
- Permission-aware empty, loading, and error states. No fabricated analytics.

### Reports (`/reports`)

- Report landing cards gated by verified permissions.
- Sales report: `/api/reports/daily|monthly|yearly` plus paged `/api/orders`.
- Profit & loss: `/api/reports/profit-loss/daily|monthly|yearly`.
- GST: `/api/reports/gst` with `fromDate` and `toDate` (Today, Yesterday, Last 7 days, This month, This year, Custom).
- Inventory report: existing `/api/inventory/dashboard` and `/api/inventory/low-stock`.
- Purchase report: existing `/api/purchases` plus P&L purchase total when permitted.
- Expense report: existing `/api/expenses` plus P&L expense total/category breakdown when permitted.

## Out of Scope / Not Available

- Product performance / top products / category sales reports — no backend endpoints (`/api/reports/products` is 404).
- Dedicated `/api/dashboard` or `/api/analytics` — not present.
- Inventory rupee value — not returned; not estimated from `stock × cost`.
- Last 7 days / arbitrary custom range for sales and P&L summaries — no weekly endpoint.
- Backend CSV/Excel/PDF export endpoints — not present; frontend does not export a single page as a full report.
- Administration: users, roles, attendance, activity logs, shop settings screens — **deferred** (not part of the approved cycle).

## Permissions Used

Verified keys only: `reports`, `reports.monthly`, `reports.profit`, `reports.tax`, `orders`, `inventory`, `purchases`, `expenses`. No invented `dashboard.view` / `analytics.view`.

## Acceptance Criteria

- [x] Report data comes from approved APIs.
- [x] Filters follow backend capabilities.
- [x] Charts provide meaningful information from backend breakdowns.
- [x] Tables support appropriate pagination/filtering.
- [ ] Administration screens respect permissions — **deferred**; not implemented in this cycle.
- [x] Sensitive actions use confirmation where appropriate (unchanged from prior modules).

## Validation

- [x] Type check
- [x] Lint
- [x] Production build
- [x] API verification against South India + shop DEV (GET-only)

## Known Limitations

- Daily sales for a day with no orders correctly shows zero; DEV 2026-08-28 was empty while August monthly data exists.
- Yearly sales report does not return payment/order-type breakdowns.
- Yearly P&L sample did not include `expenseBreakdown`.
- Orders `paymentMethod` filter values may not match report labels (`Upi` vs `UPI`).
- Monthly/yearly report routes are documented as Admin-only on the API in addition to UI keys `reports.monthly` / `reports.profit`.

---

# 15. Version v0.9 — Hardening & Release Preparation

**Status:** Feature Complete

## Objective

Prepare the existing v0.1–v0.8 implementation for a more robust production-ready state without a rewrite.

## Completed Hardening

- Login shop-code placeholder no longer suggests a real shop code.
- `.env.example` uses a placeholder API host; the real URL stays in gitignored `.env.local`.
- Query retry no longer repeats 400/401/403/404 responses.
- Successful sales, purchases, and expenses invalidate report and order caches.
- Inventory dashboard and hold-count queries are permission-gated with `enabled`.
- Charts use `--chart-*` semantic tokens and respect reduced motion.
- Theme picker waits for client mount to avoid hydration mismatch.
- Account/POS menus wrap `DropdownMenuLabel` in `DropdownMenuGroup` so Base UI does not crash on open.
- Reports nav item uses verified `anyPermission` keys; nested report routes highlight Reports.
- Direct report URLs still use `RequirePermission`; hidden nav is not the security boundary.
- Session login/logout/401 already cleared TanStack Query; confirmed for multi-shop cache isolation.
- Duplicate-submit guards on existing forms were reviewed and left in place.

## Acceptance Criteria

- [x] Critical workflows reviewed (dashboard/reports plus existing POS/masters via prior versions).
- [x] Authentication/session/refresh flow reviewed (singleton refresh, 401 redirect, cache clear).
- [x] Permission behavior reviewed for new routes.
- [x] Standard POS / POS Machine Mode not rewritten; cache invalidation after sale extended to reports.
- [x] Production build succeeds.
- [x] Deployment configuration reviewed (`.env.example`, `NEXT_PUBLIC_API_BASE_URL`).
- [ ] Release notes for a production deploy — not a v1.0 release; notes belong with v1.0.

## Validation

- [x] Type check
- [x] Lint
- [x] Production build

## Out of Scope

- v1.0 production release packaging.
- Administration modules.
- Broad UI rewrite or extra libraries.

---

# 16. Version v1.0 — First Production Release

**Status:** Feature Complete

## Objective

Release the first stable production version of POS Lite Web, including remaining verified administration modules and end-to-end validation of the completed roadmap.

## Scope change from this cycle

`VERSION_MANAGEMENT.md` originally described v1.0 as a production-readiness milestone. Users/roles were listed as **Future / v1.0**. Activity logs, attendance, and shop settings administration were listed as **Future**.

This explicit v1.0 request pulled the following Future items into v1.0 because backend APIs were verified:

- Users / roles / permissions screens
- Activity logs
- Attendance (read-only records and employee dashboard)

Shop settings administration remains **Future**. POS already reads `GET /api/ShopSettings`. No admin settings UI was added.

No v1.1 work was started.

## Completed Scope

- User administration: list, search, filters, create, edit, activate/deactivate, soft-delete/restore, force logout
- Admin password reset via verified `UpdateUserRequestDto.newPassword` (no dedicated reset-password endpoint)
- Signed-in profile update (`PUT /api/users/me`) and self password change (`PUT /api/users/me/password`)
- Role administration: list, create, edit, permission assignment from `GET /api/users/permissions`, soft-delete/restore
- Activity logs: paged search with user, module, action, and date filters
- Attendance: login/logout records, date/employee filters, employee dashboard summary
- Administration landing and permission-aware navigation
- Application version `1.0.0`

## Out of Scope / Not Implemented

- Dedicated admin password-reset endpoint (`/api/users/reset-password` returns 404)
- Attendance check-in/check-out mutations (not in Swagger; records come from authentication)
- Shop settings administration screen (still deferred)
- Profile image upload UI
- Product performance reports and report file export (still no backend)
- Advanced printer integration
- v1.1 or later roadmap work

## Required Conditions

Before marking v1.0 as **Ready for Release**:

- [x] All approved v1.0 scope is complete.
- [x] Deferred features are explicitly documented.
- [x] Critical workflows are validated.
- [x] Backend integration is verified.
- [x] Authentication and permissions are validated.
- [x] POS checkout is validated.
- [x] POS Machine Mode is validated.
- [x] Production build passes.
- [ ] Deployment environment is configured.
- [x] Critical issues are resolved or explicitly accepted.
- [x] Release notes are prepared.

Deployment packaging and environment configuration remain an operations step, not a code-feature gap.

## Validation

- [x] Type check
- [x] Lint
- [x] Production build
- [x] Functional testing (DEV shop code against the South India API)

## Known Issues

- Attendance has no check-in/check-out API; the UI is read-only.
- Other-user password reset uses `PUT /api/users/{id}` with `newPassword`.
- Shop settings GET is used by POS; there is no admin edit screen in v1.0.
- DEV shop branding still displays as "Pure Cane"; shop code PURECANE was not used.
- Expense categories remain a fixed backend list (`POST /api/expenses/categories` returns 405).
- Purchases cannot be updated or deleted (405).
- No product performance report API and no report export endpoints.

## Release Notes

```text
# POS Lite Web v1.0

Release Date: 2026-08-28

## New Features
- Administration: users, roles, activity logs, and attendance
- Profile and change-password from the account menu
- Admin password reset for other users through the verified user update API

## Improvements
- Permission-aware Administration navigation
- End-to-end validation of the v0.1–v1.0 application

## Bug Fixes
- None beyond the administration delivery

## Known Limitations
- Shop settings administration is deferred
- Attendance check-in/check-out mutations are not provided by the backend
- Report export and product performance reports are not provided by the backend

## Technical Notes
- Application version is 1.0.0
- Continue using NEXT_PUBLIC_API_BASE_URL; do not hardcode API hosts
```


# 17. Version Scope Change Rules

Once implementation of a version has started, new requirements must not automatically be added.

When a new requirement appears, decide whether it is:

1. Required to complete the current version.
2. A bug in current version scope.
3. A small improvement that can safely fit.
4. A new feature for a future version.

If it is a new feature, add it to the appropriate future version instead of silently expanding the current scope.

This protects delivery timelines and keeps AI-assisted implementation focused.

---

# 18. Definition of Done

A feature can be marked **Done** only when all applicable conditions are satisfied.

## Functional

- [ ] Acceptance criteria are implemented.
- [ ] Required backend APIs are integrated.
- [ ] No placeholder implementation is presented as complete.

## UI

- [ ] UI follows `UI_UX_GUIDELINES.md`.
- [ ] Loading state exists.
- [ ] Empty state exists where applicable.
- [ ] Error state exists.
- [ ] Responsive behavior is checked where relevant.

## Security and Access

- [ ] Authentication requirements are respected.
- [ ] Permission behavior is implemented.
- [ ] Tenant/shop context is handled correctly.

## Quality

- [ ] Type errors introduced by the feature are resolved.
- [ ] Lint issues introduced by the feature are resolved.
- [ ] Relevant build validation is completed.
- [ ] Critical workflow testing is completed.

## Documentation

- [ ] Version status is updated where necessary.
- [ ] Known limitations are documented.
- [ ] Significant technology or design changes are documented in the appropriate source document.

---

# 19. Version Completion Template

When a version reaches **Feature Complete**, record:

```text
## Version: vX.X

Status: Feature Complete

### Completed Scope
- Feature 1
- Feature 2

### Validation
- [x] Type check
- [x] Lint
- [x] Production build
- [x] Functional testing

### Known Issues
- None

### Deferred
- Feature moved to vX.X

### Notes
- Any important implementation or release information
```

Do not mark validation as completed unless it was actually performed.

---

# 20. Current Version Dashboard

This section should be updated as development progresses.

## Active Version

**Version:** v1.0  
**Name:** First Production Release  
**Status:** Feature Complete

Application package version: `1.0.0`

## Current Objective

v1.0 administration completion and end-to-end validation are implemented. Do not start v1.1.

## Current Scope Progress

### v1.0 Administration & Release Readiness

| Area | Status | Notes |
|---|---|---|
| Users | Feature Complete | List/create/edit/activate/delete/restore/force logout |
| Admin password reset | Feature Complete | `PUT /api/users/{id}` `newPassword`; no dedicated reset endpoint |
| Profile / self password | Feature Complete | `PUT /api/users/me` and `PUT /api/users/me/password` |
| Roles | Feature Complete | Catalog from `GET /api/users/permissions` |
| Activity logs | Feature Complete | Paged backend audit list |
| Attendance | Feature Complete | Read-only records + employee dashboard |
| Shop settings admin UI | Deferred | GET already used by POS; still Future |
| End-to-end validation | Feature Complete | DEV shop against South India API |

## Current Blockers

None recorded that block the implemented supported scope.

Shop code DEV branding still displays as "Pure Cane"; shop code PURECANE was not used.

## Next Major Milestone

No further roadmap versions are in scope. Do not start v1.1 unless explicitly requested.

---

# 21. Backlog

The backlog contains approved ideas or work that is not currently part of the active version.

Items should include enough information to understand their purpose.

Example:

| Item | Priority | Target Version | Status | Notes |
|---|---|---|---|---|
| Advanced POS keyboard shortcuts | Medium | Future | Backlog | Evaluate after initial POS release |
| Dedicated printer integration | Low | Future | Backlog | Browser printing first |
| Additional dashboard analytics | Medium | Future | Backlog | Add only when supported by useful data |

Do not implement backlog items automatically.

A backlog item must be moved into an active version before implementation.

---

# 22. Deferred Items

Use this section for requirements intentionally moved out of a version.

Example:

| Item | Original Version | Deferred To | Reason |
|---|---|---|---|
| Advanced printer integration | v1.0 | Future | Not required for initial release |
| Users / roles / permissions screens | v0.8 | v1.0 | Implemented in v1.0 |
| Attendance | v0.8 | v1.0 | Implemented in v1.0 as read-only records |
| Activity logs | v0.8 | v1.0 | Implemented in v1.0 |
| Shop settings administration screen | v0.8 | Future | GET shop settings already used by POS; no admin settings UI in v1.0 |
| Product performance reports | v0.8 | Future | No backend product report endpoints |
| Report file export (CSV/Excel/PDF) | v0.8 | Future | No backend export endpoints; page-only export not implemented |
| Attendance check-in/check-out | v1.0 | Future | Backend exposes GET attendance only |
| Dedicated admin password-reset endpoint | v1.0 | Future | Reset uses `PUT /api/users/{id}` `newPassword` |
| Profile image upload UI | v1.0 | Future | `PUT /api/users/me/profile-image` exists; file-upload UI not in this cycle |

This prevents deferred work from being forgotten.

---

# 23. Known Issues

Record meaningful known issues that remain after implementation.

Example:

| Issue | Severity | Affected Area | Status | Planned Resolution |
|---|---|---|---|---|
| Azure Canada `/health` can time out on cold start | Low | API health check | Open | Retry from the Foundation page; revisit if it affects v0.2 |
| Expense category management is a fixed string list | Medium | Expenses | Open | Backend `POST /api/expenses/categories` returns 405; UI is read-only |
| Purchases cannot be updated or deleted | Medium | Purchases | Open | `PUT`/`PATCH`/`DELETE /api/purchases/{id}` return 405 |
| Expense records have no expense number field | Low | Expenses | Open | `ExpenseResponseDto` has no number; UI does not invent one |
| No product performance / top-selling report API | Medium | Reports | Open | `/api/reports/products` returns 404; not implemented in UI |
| No report export endpoints | Medium | Reports | Open | CSV/Excel/PDF export is not available from the backend |
| Payment method casing differs (`Upi` vs `UPI`) | Low | Sales report filters | Open | Checkout DTO uses `Upi`; some stored bills show `UPI` |
| Attendance check-in/check-out APIs are not published | Medium | Attendance | Open | UI shows login/logout records only |
| No dedicated admin password-reset endpoint | Low | Users | Open | Admin reset uses `newPassword` on user update |

Severity should be used consistently:

- **Critical** — Blocks essential use, risks data integrity, or creates a major security issue.
- **High** — Major functionality is unavailable or unreliable.
- **Medium** — Important but workable issue.
- **Low** — Minor usability or cosmetic issue.

Do not use this section to list temporary development warnings that have already been resolved.

---

# 24. Release Notes Template

For each released version:

```text
# POS Lite Web vX.X

Release Date: YYYY-MM-DD

## New Features
- Feature

## Improvements
- Improvement

## Bug Fixes
- Fix

## Known Limitations
- Limitation

## Technical Notes
- Important deployment or compatibility information
```

Release notes should describe user-visible and operationally relevant changes.

Avoid filling release notes with internal file names or trivial refactoring details.

---

# 25. Relationship to Git

This document tracks **product and development versions**.

Git tracks **source-code history**.

Do not treat Git commits as product versions.

A single version may contain:

- Multiple commits
- Multiple branches
- Multiple pull requests
- Multiple bug fixes

Version status should be updated based on actual scope completion and validation, not merely because code was committed.

The exact branch and pull request strategy can be maintained separately if needed.

---

# 26. Relationship to Other Project Documents

Each project document has a specific responsibility.

- `PRD.md` — Defines what POS Lite Web must do.
- `UI_UX_GUIDELINES.md` — Defines visual and interaction standards.
- `TECH_STACK.md` — Defines approved technologies and technical boundaries.
- `AI_CODING_GUIDELINES.md` — Defines how Cursor AI should work within the codebase.
- `WEB_DEVELOPER_GUIDE.md` — Defines backend/API integration information.
- `VERSION_MANAGEMENT.md` — Defines current scope, roadmap, progress, completion, and release status.

When documents appear to overlap:

- Product requirement → `PRD.md`
- UI decision → `UI_UX_GUIDELINES.md`
- Technology decision → `TECH_STACK.md`
- Backend/API behavior → `WEB_DEVELOPER_GUIDE.md`
- AI workflow → `AI_CODING_GUIDELINES.md`
- Current version scope and status → `VERSION_MANAGEMENT.md`

---

# 27. How Cursor Should Use This Document

Before implementing a task, Cursor AI should:

1. Check the current active version.
2. Confirm that the requested work belongs to that version.
3. Review the version acceptance criteria.
4. Implement only the approved scope.
5. Avoid implementing future-version items automatically.
6. Update status when meaningful work is completed.
7. Report deferred work separately.

If a request belongs to a future version but the user explicitly asks to implement it now, the explicit request takes priority. The version scope should then be updated to reflect the decision.

---

# 28. Final Version Management Principle

The purpose of version management is not to create administrative overhead.

Its purpose is to answer one simple question at any time:

> **What exactly are we building right now, and how do we know when it is complete?**

For POS Lite Web:

- Build in coherent milestones.
- Keep version scope focused.
- Do not silently add new features.
- Validate before marking work complete.
- Record what is deferred.
- Keep the current version status accurate.

A clear version plan is especially important when development is performed primarily using AI-assisted coding.
