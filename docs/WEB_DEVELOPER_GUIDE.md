# Auralizz POS Lite — Full Project Documentation (Web Team)

**Audience:** Teammates building a **web application** against the same backend as the Flutter POS app.  
**Repo:** https://github.com/akhilkrishnas4u-debug/AuralizzPosLite  
**Last updated:** August 2026

This document covers architecture, environments, authentication, permissions, database schema, and the full HTTP API.

For interactive request/response examples while developing, also open **Swagger** on a running API (`/swagger`).

---

## Table of contents

1. [Project overview](#1-project-overview)
2. [Environments & URLs](#2-environments--urls)
3. [Architecture](#3-architecture)
4. [Multi-tenant shops](#4-multi-tenant-shops)
5. [Authentication & sessions](#5-authentication--sessions)
6. [Permissions (RBAC)](#6-permissions-rbac)
7. [Common API conventions](#7-common-api-conventions)
8. [Database overview](#8-database-overview)
9. [Database tables](#9-database-tables)
10. [Enums](#10-enums)
11. [API reference](#11-api-reference)
12. [Web SPA implementation checklist](#12-web-spa-implementation-checklist)
13. [Related docs](#13-related-docs)

---

## 1. Project overview

| Layer | Tech |
|-------|------|
| API | ASP.NET Core (.NET 10), Clean Architecture |
| DB | PostgreSQL (Azure or local), EF Core |
| Mobile | Flutter (Riverpod + GoRouter) — already live |
| Web | **To be built** — consume this same API |

**Solution folders**

```
src/
  AuralizzPOSLite.API/             Controllers, middleware, Swagger
  AuralizzPOSLite.Application/     DTOs, interfaces, validation, settings
  AuralizzPOSLite.Domain/          Entities, enums
  AuralizzPOSLite.Infrastructure/  Auth, services, file storage
  AuralizzPOSLite.Persistence/     EF Core, repositories, migrations
mobile/                            Flutter POS app
docs/                              Documentation (this file)
```

**Default seeded admin (per shop DB, first run)**

| Field | Value |
|-------|--------|
| Username | `admin` |
| Password | `Admin@123` |
| Email | `admin@auralizz.com` |

Change this password in production.

---

## 2. Environments & URLs

| Environment | Base URL |
|-------------|----------|
| Local API | `http://localhost:5008` |
| Azure Canada (current shop APK default) | `https://auralizzposliteapi-feeec5bzc5g5egab.canadacentral-01.azurewebsites.net` |
| Azure South India | `https://auralizzposliteapiproduction-hbgbcvfkhuc7hwaz.southindia-01.azurewebsites.net` |

| Helper URL | Notes |
|------------|--------|
| `{base}/swagger` | OpenAPI UI (when `EnableSwagger` is true) |
| `{base}/health` | Health check (no auth, no shop header) |

**CORS:** Policy `AllowFlutter` allows any origin, method, and header — browser SPAs can call the API directly. Prefer sending JWT in `Authorization` (not cookies).

**Flutter default API** is set in `mobile/lib/core/config/app_config.dart`. Web should use the same production host the shop is pointed at.

---

## 3. Architecture

```
[ Web SPA / Flutter ]
        │  HTTPS + JWT + X-Shop-Code
        ▼
[ AuralizzPOSLite.API ]
  ShopContextMiddleware  → picks tenant DB from X-Shop-Code
  JWT auth               → validates Bearer token
  Permission middleware  → checks permission claims (Admin bypasses)
        ▼
[ Services / Repositories ]
        ▼
[ PostgreSQL per shop ]  e.g. AuralizzPOSLite_PureCane
```

Images: uploaded via `/api/files/upload`, stored on disk (local) or **Azure Blob** (production). URLs like `/api/files/media/catalog/{file}.png` or full blob HTTPS URLs.

---

## 4. Multi-tenant shops

Every shop has its **own PostgreSQL database**. One App Service hosts many shops.

### Header (required on almost all APIs)

```
X-Shop-Code: PURECANE
```

| Situation | Shop code required? |
|-----------|---------------------|
| Most `/api/*` calls | **Yes** — missing → HTTP 400 |
| `POST /api/auth/login` | Via body `shopCode` **or** header |
| `/health`, `/swagger`, `/api/files/media/*` | No |

### Known shop mappings (`Database:ShopMappings`)

| Shop code | Database name |
|-----------|----------------|
| `PURECANE` | `AuralizzPOSLite_PureCane` |
| `FRESHJUICE` | `AuralizzPOSLite_FreshJuice` |
| `JUICEWORLD` | `AuralizzPOSLite_JuiceWorld` |
| `ABCJUICES` | `AuralizzPOSLite_ABCJuices` |

`ConnectionStrings:DefaultConnection` holds **host + credentials**. For mapped shops, only the database name is swapped at runtime.

**Web tip:** Persist `shopCode` after login (same as Flutter) and attach `X-Shop-Code` on every request.

---

## 5. Authentication & sessions

### Login

`POST /api/auth/login`

```json
{
  "username": "admin",
  "password": "Admin@123",
  "shopCode": "PURECANE",
  "loginDevice": "Web Chrome"
}
```

**Success `data`:**

| Field | Description |
|-------|-------------|
| `accessToken` | JWT — send as `Authorization: Bearer …` |
| `refreshToken` | Used to renew access |
| `accessTokenExpiresAt` | Expiry |
| `refreshTokenExpiresAt` | Expiry |
| `user` | Profile + `permissions[]` + `role` + optional `shift` |
| `session` | Optional shift auto-logout info |

### Refresh

`POST /api/auth/refresh` — body `{ "refreshToken": "…" }` → new token pair.

### Logout

| Endpoint | Effect |
|----------|--------|
| `POST /api/auth/logout` | Revokes this refresh token (body: `{ "refreshToken" }`) |
| `POST /api/auth/logout-all` | Revokes all sessions for this user |

### Force logout

Admins can `POST /api/users/{id}/force-logout`. Client should treat **401** with force-logout messaging as “sign in again”.

### JWT claims used by UI

- `role`: `"Admin"` or `"Employee"`
- Permission claims (strings listed in §6)

**Admin** users bypass permission middleware checks.

---

## 6. Permissions (RBAC)

Permissions are strings on the user (from **AppRole** and/or user overrides). Gate web menus with `user.permissions` and `user.role`.

| Key | Label (approx.) | Group |
|-----|-----------------|-------|
| `pos` | Point of Sale | Sales & POS |
| `orders` | Order History | Sales & POS |
| `reports` | Sales Reports | Sales & POS |
| `reports.monthly` | Monthly Reports | Sales & POS |
| `reports.profit` | Profit & Loss | Sales & POS |
| `reports.tax` | GST Reports | Sales & POS |
| `customers` | View Customers | Sales & POS |
| `customers.manage` | Manage Customers | Sales & POS |
| `expenses` | View Expenses | Sales & POS |
| `expenses.manage` | Manage Expenses | Sales & POS |
| `categories` | View Categories | Catalog |
| `categories.manage` | Manage Categories | Catalog |
| `products` | View Products | Catalog |
| `products.manage` | Manage Products | Catalog |
| `inventory` | View Inventory | Catalog |
| `inventory.manage` | Manage Inventory | Catalog |
| `suppliers` | View Suppliers | Purchasing |
| `suppliers.manage` | Manage Suppliers | Purchasing |
| `purchases` | Purchase History | Purchasing |
| `purchases.manage` | Record Purchases | Purchasing |
| `settings.shop` | Shop & GST Settings | Settings |
| `printer` | Bluetooth Printer | Settings (mobile) |
| `users.manage` | Manage Employees | Administration |
| `roles.manage` | Manage Roles | Administration |
| `activity.logs` | Activity Logs | Administration |

### Seeded AppRoles

| Role | Typical permissions |
|------|---------------------|
| Administrator | All of the above |
| Cashier | `pos`, `orders`, `reports`, `customers`, `printer` |
| Manager | POS + reports (incl. monthly/profit/tax) + customers/expenses manage + printer |
| Inventory Staff | Catalog + inventory + suppliers + purchases |

### ASP.NET policies vs permissions

| Policy | Meaning |
|--------|---------|
| Anonymous | No JWT |
| Authenticated | Valid JWT |
| AdminOnly | JWT + `role` = Admin |

Many **write** endpoints are **AdminOnly** even if a permission key exists. Non-admin employees with manage permissions can use some paths; others still require Admin. When in doubt, try as Admin first, then test employee roles.

Missing permission → **HTTP 403**  
`"You do not have permission to perform this action."`

---

## 7. Common API conventions

### Response wrapper (`ApiResponseDto<T>`)

```json
{
  "success": true,
  "message": "Success",
  "data": { },
  "errors": null
}
```

Failure:

```json
{
  "success": false,
  "message": "Validation failed.",
  "data": null,
  "errors": ["Field X is required"]
}
```

Always check `success` before using `data`.

### Pagination (`PagedResultDto<T>`)

| Field | Type |
|-------|------|
| `items` | array |
| `page` | number (1-based) |
| `pageSize` | number |
| `totalCount` | number |
| `totalPages` | number |
| `hasNextPage` | boolean |
| `hasPreviousPage` | boolean |

Defaults are often `page=1`, `pageSize=20` (activity logs: `pageSize=50`).

### JSON naming

Property names are **camelCase**.

### Soft delete

Most masters use soft delete (`isDeleted`). List endpoints hide deleted rows. Admin “deleted” + “restore” endpoints recover them.

### Dates

Send/receive ISO-8601. Report date filters are typically **UTC calendar dates** on the server.

### Payment / order type strings

| Field | Allowed values (API strings) |
|-------|------------------------------|
| `paymentMethod` | `Cash`, `Upi`, `Card` |
| `orderType` | `Counter`, `Parcel` |
| `status` (orders) | `Completed`, `Cancelled` |

---

## 8. Database overview

| Item | Detail |
|------|--------|
| Engine | PostgreSQL |
| ORM | EF Core 10 |
| Soft delete | Global filter `IsDeleted = false` on soft-deletable entities |
| Latest migration | `UniqueSkuAndSize_V28` |
| Tenant model | One database per shop code |

### Soft-deletable tables

`users`, `app_roles`, `categories`, `products`, `orders`, `order_items`, `held_orders`, `held_order_items`, `suppliers`, `purchases`, `purchase_items`, `expenses`, `customers`, `shop_settings`, `stock_movements`, `activity_logs`

### Not soft-deleted

`user_permissions`, `role_permissions`, `refresh_tokens`, `employee_attendance`, `ui_pickup`

### Base columns (most entities)

| Column | Type |
|--------|------|
| `Id` | uuid |
| `CreatedAt` | timestamptz |
| `UpdatedAt` | timestamptz nullable |
| Soft-delete extras | `IsDeleted`, `DeletedBy`, `DeletedDate` |

---

## 9. Database tables

### `users`

Staff accounts.

| Column | Type | Notes |
|--------|------|--------|
| Email, Username | string | Unique when not deleted |
| PasswordHash | string | BCrypt |
| FirstName, LastName | string | |
| PhoneNumber, ProfileImageUrl | nullable | |
| Role | string | `Admin` / `Employee` |
| IsActive | bool | |
| SecurityStamp | string | Invalidates JWT on force-logout |
| AppRoleId | uuid? | FK → `app_roles` |
| ShiftEnabled, ShiftStartTime, ShiftEndTime | shift fields | |
| WorkingDays | string? | CSV DayOfWeek 0–6 |
| GraceBeforeLoginMinutes, GraceAfterShiftMinutes | int | |
| AllowLoginOutsideShift | bool | |

Related: `user_permissions (UserId, Permission)`, `refresh_tokens`, `employee_attendance`.

### `app_roles` / `role_permissions`

Named roles and their permission strings.

### `categories`

Hierarchical catalog (`ParentCategoryId` self-FK). `Name`, `Description`, `ImageUrl`, `IsActive`, `DefaultShowOnPos`.

### `products`

| Important columns | Notes |
|-------------------|--------|
| Name, Size, Sku | Unique `(Sku, Size)` when not deleted |
| QuickCode | Optional unique POS code |
| CategoryId | FK categories |
| Price, CostPrice | decimal |
| StockQuantity, ReorderLevel | int |
| Unit, Barcode, HsnCode | |
| TaxRatePercent | default 5 |
| IsActive, ShowOnPos | |
| ImageUrl | |

### `orders` / `order_items`

Completed bills. Totals include discount, packaging, GST splits, loyalty fields, `PaymentMethod`, `OrderType`, `CashierId`, optional `CustomerId`, `PrintCount`.

Line items snapshot product name/sku/prices/tax.

### `held_orders` / `held_order_items`

Paused carts (`Hold`, `Resumed`, `Cancelled`, `Completed`).

### `customers`

Unique `Phone`. Loyalty: `LoyaltyPoints`, `TotalVisits`.

### `suppliers` / `purchases` / `purchase_items`

Purchase receiving; stock movements of type Purchase may be created.

### `expenses`

`Title`, `Category` (Rent, Utilities, Salary, Supplies, Maintenance, Other), `Amount`, `ExpenseDate`.

### `stock_movements`

Audit of stock changes: `MovementType`, `Quantity`, `PreviousStock`, `NewStock`, optional `OrderId` / `PurchaseId`.

### `shop_settings` (usually one row)

`BusinessName`, `AppDisplayName`, `LogoImageUrl`, `Gstin`, `Address`, `PhoneNumber`, `SelectedUiPickupId`, `AllowSellWhenOutOfStock`, `IsGstEnabled`.

### `ui_pickup`

UI theme options. Seeded: `1` First design, `2` Dashboard Pro.

### `activity_logs`

Audit trail: `Module`, `ActionType`, `Description`, `OldValues`/`NewValues` JSON text, `UserId`.

### `employee_attendance`

Login/logout sessions, worked hours, outside-shift flags.

---

## 10. Enums

| Enum | Values |
|------|--------|
| UserRole | Admin=1, Employee=2 |
| OrderStatus | Completed=1, Cancelled=2 |
| OrderType | Counter=1, Parcel=2 |
| PaymentMethod | Cash=1, Upi=2, Card=3 |
| HeldOrderStatus | Hold, Resumed, Cancelled, Completed |
| MovementType | StockIn, StockOut, Adjustment, Sale, Purchase, SaleReversal |

Stored as **strings** in PostgreSQL.

---

## 11. API reference

**Headers for authenticated calls**

```
Authorization: Bearer <accessToken>
X-Shop-Code: PURECANE
Content-Type: application/json
```

Paths are case-insensitive. Controllers map to `/api/{ControllerName}` (e.g. `/api/ShopSettings`, `/api/activitylogs`).

---

### 11.1 Health

| Method | Path | Auth |
|--------|------|------|
| GET | `/health` | None |

Returns `{ status, service, environment }` (not wrapped in `ApiResponseDto`).

---

### 11.2 Auth — `/api/auth`

| Method | Path | Auth | Body | Response `data` |
|--------|------|------|------|-----------------|
| POST | `/login` | No | username, password, shopCode, loginDevice? | LoginResponseDto |
| POST | `/refresh` | No | refreshToken | TokenResponseDto |
| POST | `/logout` | Yes | refreshToken | `{}` |
| POST | `/logout-all` | Yes | — | `{}` |

---

### 11.3 Users — `/api/users`

| Method | Path | Auth | Notes |
|--------|------|------|--------|
| GET | `/me` | Yes | Current profile |
| PUT | `/me` | Yes | email, firstName, lastName, phoneNumber |
| PUT | `/me/password` | Yes | currentPassword, newPassword |
| PUT | `/me/profile-image` | Yes | profileImageUrl |
| GET | `/permissions` | Admin | Catalog of permission definitions |
| GET | `/` | Admin | All users |
| GET | `/deleted` | Admin | Soft-deleted |
| GET | `/{id}` | Admin | |
| POST | `/` | Admin | Create (password, role, appRoleId, shift, …) |
| PUT | `/{id}` | Admin | Update |
| DELETE | `/{id}` | Admin | Soft delete |
| POST | `/{id}/restore` | Admin | |
| POST | `/{id}/force-logout` | Admin | optional reason |

**UserResponseDto (key fields):** `id`, `email`, `username`, `firstName`, `lastName`, `role`, `isActive`, `phoneNumber`, `profileImageUrl`, `permissions[]`, `appRoleId`, `appRoleName`, `shift`, `isOnline`, timestamps.

---

### 11.4 Roles — `/api/roles`

| Method | Path | Auth |
|--------|------|------|
| GET | `/` | Yes (needs `users.manage` for list) |
| GET | `/deleted` | Yes + `roles.manage` |
| GET | `/{id}` | Yes + `roles.manage` |
| POST | `/` | Yes + `roles.manage` — name, description, isActive, permissions[] |
| PUT | `/{id}` | Yes + `roles.manage` |
| DELETE | `/{id}` | Yes + `roles.manage` |
| POST | `/{id}/restore` | Yes + `roles.manage` |

---

### 11.5 Attendance & employee dashboard

| Method | Path | Auth | Notes |
|--------|------|------|--------|
| GET | `/api/attendance` | Yes | Query: from, to, userId — needs `users.manage` |
| GET | `/api/attendance/me` | Yes | Own records |
| GET | `/api/employee-dashboard` | Yes | Logged-in staff + recent activity — `users.manage` |

---

### 11.6 Categories — `/api/categories`

| Method | Path | Auth |
|--------|------|------|
| GET | `/?search=` | Yes |
| GET | `/deleted` | Admin |
| GET | `/{id}` | Yes |
| POST | `/` | Admin — parentCategoryId?, name, description?, imageUrl?, defaultShowOnPos |
| PUT | `/{id}` | Admin — + isActive |
| DELETE | `/{id}` | Admin |
| POST | `/{id}/restore` | Admin |

**Response extras:** `productCount`, `childCount`, `level`, `isSellable`, parent name fields.

---

### 11.7 Products — `/api/products`

| Method | Path | Auth |
|--------|------|------|
| GET | `/?search=&categoryId=&isActive=&showOnPos=` | Yes |
| GET | `/deleted` | Admin |
| GET | `/{id}` | Yes |
| POST | `/` | Admin |
| PUT | `/{id}` | Admin |
| DELETE | `/{id}` | Admin |
| POST | `/{id}/restore` | Admin |

**Body fields:** name, size?, description?, imageUrl?, sku, barcode?, quickCode?, categoryId, price, costPrice, stockQuantity, reorderLevel, unit, showOnPos, hsnCode?, taxRatePercent; update also `isActive`.

---

### 11.8 Billing / POS — `/api/billing`

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | `/checkout` | Yes | Create completed bill |
| GET | `/` | Yes | Recent bills |
| GET | `/{id}` | Yes | Full bill |
| GET | `/by-number/{billNumber}` | Yes | |
| POST | `/{id}/record-print` | Yes | Increment print count |
| PUT | `/{id}` | Admin | Edit completed order |
| DELETE | `/{id}` | Admin | Soft delete |
| GET | `/deleted` | Admin | |
| POST | `/{id}/restore` | Admin | |

**Checkout body (CheckoutRequestDto):**

| Field | Notes |
|-------|--------|
| `items[]` | productId, quantity, discountAmount |
| `amountPaid` | |
| `paymentMethod` | Cash / Upi / Card |
| `paymentReference` | optional |
| `orderType` | Counter / Parcel |
| `packagingCharge`, `discountAmount` | |
| `notes` | optional |
| `heldOrderId` | optional — completes a hold |
| `customerId`, `loyaltyPointsRedeemed` | optional |

**BillResponseDto:** billNumber, cashierName, money breakdown (subTotal, discounts, tax, CGST/SGST, loyalty, total), payment fields, status, printCount, items[].

---

### 11.9 Held orders — `/api/billing/holds`

| Method | Path | Auth |
|--------|------|------|
| GET | `/` | Yes — `?search=` |
| GET | `/active-count` | Yes — returns number |
| GET | `/{id}` | Yes |
| POST | `/` | Yes — items, customerName?, discountAmount |
| POST | `/{id}/resume` | Yes |
| POST | `/{id}/cancel` | Yes |

Requires `pos` permission (under billing prefix).

---

### 11.10 Orders (history search) — `/api/orders`

| Method | Path | Auth |
|--------|------|------|
| GET | `/?search=&fromDate=&toDate=&paymentMethod=&orderType=&page=&pageSize=` | Yes (`orders`) |

Paged `OrderSummaryDto`: id, billNumber, cashierName, totalAmount, paymentMethod, orderType, status, itemCount, createdAt.

---

### 11.11 Reports — `/api/reports`

| Method | Path | Auth | Query |
|--------|------|------|-------|
| GET | `/daily` | Yes | `date?` |
| GET | `/monthly` | Admin | `year?`, `month?` |
| GET | `/yearly` | Admin | `year?` |
| GET | `/profit-loss/daily` | Yes | `date?` |
| GET | `/profit-loss/monthly` | Admin | `year?`, `month?` |
| GET | `/profit-loss/yearly` | Admin | `year?` |
| GET | `/gst` | Yes | **`fromDate`**, **`toDate`** required |

**Daily sales `data`:** totalOrders, totalSales, averageOrderValue, paymentBreakdown[], orderTypeBreakdown[], hourlyBreakdown[] (`hour`, `orderCount`, `totalSales`).

**Monthly:** + dailyBreakdown[]. **Yearly:** monthlyBreakdown[].

**P&L:** revenue, costOfGoodsSold, grossProfit, purchases, expenses, netProfit, orderCount, expenseBreakdown[].

**GST:** totals + rateBreakdown[] by tax %.

UI permission keys `reports.monthly` / `reports.profit` / `reports.tax` are used by the Flutter app for menu gating; API path rules primarily use `reports` + AdminOnly where configured.

---

### 11.12 Inventory — `/api/inventory`

| Method | Path | Auth |
|--------|------|------|
| GET | `/dashboard` | Yes |
| GET | `/movements` | Yes — filters + paging |
| POST | `/movements` | Admin — create StockIn/Out/Adjustment |
| GET | `/low-stock` | Yes — paged |
| GET | `/low-stock/count` | Yes |

**Create movement body:** `movementType`, `productId`, `quantity`, `newQuantity?` (for Adjustment), `reason?`.

---

### 11.13 Suppliers — `/api/suppliers`

CRUD + deleted/restore. Mutating = Admin. Fields: name, contactPerson, phoneNumber, email, address, isActive.

---

### 11.14 Purchases — `/api/purchases`

| Method | Path | Auth |
|--------|------|------|
| GET | `/?search=&supplierId=&fromDate=&toDate=&page=&pageSize=` | Yes |
| GET | `/{id}` | Yes |
| POST | `/` | Admin — supplierId, notes?, items[{ productId, quantity, unitCost }] |

---

### 11.15 Customers — `/api/customers`

| Method | Path | Auth |
|--------|------|------|
| GET | `/?search=&isActive=&page=&pageSize=` | Yes |
| GET | `/lookup?phone=` | Yes — phone required |
| GET | `/{id}` | Yes |
| POST | `/` | Yes — name, phone, email? |
| PUT | `/{id}` | Yes — needs `customers.manage` |

---

### 11.16 Expenses — `/api/expenses`

| Method | Path | Auth |
|--------|------|------|
| GET | `/` | Yes — search/filter/page |
| GET | `/categories` | Yes — fixed string list |
| GET | `/deleted` | Admin |
| GET | `/{id}` | Yes |
| POST / PUT / DELETE / restore | | Admin |

Categories: `Rent`, `Utilities`, `Salary`, `Supplies`, `Maintenance`, `Other`.

---

### 11.17 Shop settings — `/api/ShopSettings`

| Method | Path | Auth |
|--------|------|------|
| GET | `/` | Yes |
| GET | `/branding` | **Anonymous** but **still needs `X-Shop-Code`** — appDisplayName, logoImageUrl |
| PUT | `/` | Admin — update branding, GSTIN, address, phone, UI pickup, sell-when-OOS, GST enabled |

---

### 11.18 UI pickup — `/api/UiPickup`

| Method | Path | Auth |
|--------|------|------|
| GET | `/` | Yes — `{ id, name }[]` |

---

### 11.19 Activity logs — `/api/ActivityLogs` (also `/api/activitylogs`)

| Method | Path | Auth |
|--------|------|------|
| GET | `/?module=&actionType=&userId=&fromDate=&toDate=&page=&pageSize=&search=` | **AdminOnly** + `activity.logs` |

Paged items: userName, actionType, module, description, oldValues, newValues, createdAt.

---

### 11.20 Files — `/api/files`

| Method | Path | Auth | Notes |
|--------|------|------|--------|
| POST | `/upload?folder=` | Yes | multipart field name **`file`**. Folders: `catalog`, `profiles`, `branding`. Catalog/branding uploads Admin-only. Max ~5 MB; jpg/png/webp/gif. Returns `{ url, fileName }` |
| GET | `/media/{folder}/{fileName}` | No | Raw bytes; long cache; no shop header |

---

## 12. Web SPA implementation checklist

1. **Config** — environment variable for API base URL (Canada vs South India vs local).
2. **Shop code** — collect at login; store; send `X-Shop-Code` always.
3. **Auth store** — access + refresh tokens; refresh on 401; clear on force-logout / logout-all.
4. **HTTP client** — attach Bearer + shop header; unwrap `ApiResponseDto`; surface `message` / `errors`.
5. **Route guards** — Admin vs Employee; check `permissions` for menus (mirror Flutter sidebar).
6. **POS / billing** — same checkout & holds contracts as mobile.
7. **Images** — upload via multipart; use returned `url` or `/api/files/media/...`.
8. **Reports** — prefer summary endpoints (`/reports/daily`, etc.); avoid paging all orders for KPIs.
9. **Soft delete UX** — Admin “Deleted items” + restore where API supports it.
10. **Swagger** — generate TypeScript types if desired from OpenAPI.

### Suggested web modules (parity with mobile)

- Login / shop select  
- Dashboard (sales KPIs)  
- POS (optional on web)  
- Categories & products  
- Inventory & low stock  
- Orders / bills / holds  
- Customers  
- Suppliers & purchases  
- Expenses  
- Reports (sales, P&L, GST)  
- Users, roles, attendance  
- Shop settings & branding  
- Activity logs  

---

## 13. Related docs

| File | Purpose |
|------|---------|
| [README.md](../README.md) | Quick start + condensed API list |
| [Auralizz_POS_Lite_Client_User_Guide.md](./Auralizz_POS_Lite_Client_User_Guide.md) | End-user (cashier) guide |
| Swagger UI | Live request/response schemas |

---

## Questions for web kickoff

If anything is unclear for your SPA stack (React/Angular/etc.), start with:

1. Which Azure region URL will production web use?  
2. Will web support POS checkout or admin/reports only?  
3. Same shop codes / login as mobile (recommended: yes).

The **API is the source of truth** — if README and this guide ever diverge from controllers, trust **Swagger + code** under `src/AuralizzPOSLite.API/Controllers`.
