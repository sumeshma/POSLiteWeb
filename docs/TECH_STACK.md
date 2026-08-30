# POS Lite Web — Technology Stack

**Product:** POS Lite Web  
**Document Version:** 1.0  
**Status:** Draft  
**Last Updated:** August 28, 2026  

---

# 1. Purpose

This document defines the approved technology stack for POS Lite Web.

Its purpose is to ensure that development remains consistent, maintainable, and free from unnecessary technology duplication, especially because the application will be developed primarily using Cursor AI.

This document answers:

> **Which technologies, libraries, and implementation patterns are approved for POS Lite Web?**

Any significant technology addition or replacement should be approved before implementation.

---

# 2. Technology Stack Overview

POS Lite Web will be developed as a modern React-based web application that communicates with the existing POS Lite backend.

```text
┌───────────────────────────────────────────────────────────────┐
│                        USER BROWSER                           │
│                                                               │
│  Desktop / Laptop / Tablet / POS Machine / Touchscreen       │
└───────────────────────────────┬───────────────────────────────┘
                                │ HTTPS
                                ▼
┌───────────────────────────────────────────────────────────────┐
│                         POS LITE WEB                          │
│                                                               │
│  Next.js + React + TypeScript                                │
│                                                               │
│  UI: Tailwind CSS + shadcn/ui                                │
│  Server State: TanStack Query                                │
│  Forms: React Hook Form + Zod                                │
│  Tables: TanStack Table                                      │
│  Charts: Recharts                                            │
│  Icons: Lucide React                                         │
└───────────────────────────────┬───────────────────────────────┘
                                │ HTTPS / REST API
                                ▼
┌───────────────────────────────────────────────────────────────┐
│                    EXISTING POS LITE BACKEND                  │
│                                                               │
│  ASP.NET Core API                                             │
│  JWT Authentication                                           │
│  Role / Permission Authorization                              │
│  Multi-Tenant Shop Context                                    │
└───────────────────────────────┬───────────────────────────────┘
                                │
                                ▼
┌───────────────────────────────────────────────────────────────┐
│                     EXISTING DATA LAYER                       │
│                                                               │
│  PostgreSQL / Existing POS Lite Databases                     │
└───────────────────────────────────────────────────────────────┘
```

The web application must not directly access the PostgreSQL databases.

All business data operations must go through the existing POS Lite backend API.

---

# 3. Core Frontend Framework

## 3.1 Next.js

**Approved framework:** Next.js

Next.js will be used as the application framework for POS Lite Web.

### Responsibilities

- Application routing
- Page and layout structure
- Build and production optimization
- Environment configuration
- Asset handling
- Application deployment support

### Rules

- Use the current approved Next.js project structure.
- Prefer the App Router unless the project is intentionally initialized with a different approved structure.
- Do not introduce another frontend framework.
- Do not create a second application architecture inside the repository.

---

# 4. Programming Language

## TypeScript

**Approved language:** TypeScript

All application code should use TypeScript.

### Rules

- Do not add new JavaScript files for application logic unless there is a specific technical requirement.
- Avoid `any`.
- Define reusable types and interfaces for API models.
- Keep frontend models aligned with API contracts.
- Do not duplicate the same type definitions across multiple features unnecessarily.

The project should use strict TypeScript settings where compatible with the approved project setup.

---

# 5. UI and Styling

## 5.1 Tailwind CSS

**Approved styling system:** Tailwind CSS

Tailwind CSS will be used for application styling.

### Rules

- Use the project's established design tokens and utility patterns.
- Avoid introducing another CSS framework.
- Avoid large amounts of inline style objects.
- Do not create arbitrary one-off visual patterns when an existing component or utility can be reused.
- Centralize theme-related values.

---

## 5.2 shadcn/ui

**Approved component foundation:** shadcn/ui

shadcn/ui components will be used as the base for common interface elements.

Typical components may include:

- Button
- Input
- Select
- Dialog
- Sheet
- Dropdown Menu
- Table primitives
- Tabs
- Tooltip
- Toast
- Alert Dialog
- Skeleton
- Popover
- Command

### Rules

- Reuse approved components before creating new primitives.
- Customize components to match `UI_UX_GUIDELINES.md`.
- Do not install a second general-purpose component library without approval.
- Keep component behavior consistent across the application.

---

# 6. Icons

## Lucide React

**Approved icon library:** Lucide React

Use Lucide React for application icons.

### Rules

- Do not introduce multiple icon libraries.
- Use icons consistently.
- Use text or tooltips for actions that are not immediately obvious.
- Do not rely only on unfamiliar icons for critical operations.

---

# 7. Server State and API Data

## TanStack Query

**Approved server-state library:** TanStack Query

TanStack Query will manage server data such as:

- API queries
- Loading states
- Error states
- Caching
- Refetching
- Mutation state
- Query invalidation

### Rules

- API data should not be duplicated unnecessarily in global client state.
- Mutations should invalidate or update the appropriate cached queries.
- Use consistent query key conventions.
- Keep API calls inside the approved API/service layer.
- Do not call backend APIs directly from arbitrary UI components.

---

# 8. API and HTTP Client

## 8.1 HTTP Client

The application should use **one centralized HTTP client**.

The exact client implementation may use the approved project choice, such as:

- Fetch-based client wrapper, or
- Axios

The project must select one approach and use it consistently.

### Required Responsibilities

The centralized API client should handle:

- API base URL
- Authorization token
- Shop context / Shop Code
- Common headers
- Request configuration
- Response handling
- Standard error handling
- Token refresh flow where applicable
- Retry behavior where explicitly appropriate

### Rules

- Do not hardcode API URLs inside page components.
- Do not manually attach authentication headers throughout the application.
- Do not manually attach Shop Code headers throughout individual features.
- Do not create multiple competing API client implementations.

---

## 8.2 API Service Layer

API calls should be organized by business domain.

Example:

```text
src/
  services/
    auth.service.ts
    dashboard.service.ts
    products.service.ts
    categories.service.ts
    inventory.service.ts
    customers.service.ts
    orders.service.ts
    suppliers.service.ts
    purchases.service.ts
    expenses.service.ts
    reports.service.ts
    users.service.ts
    roles.service.ts
    attendance.service.ts
    activity-logs.service.ts
    settings.service.ts
```

Feature structure may evolve, but API integration must remain organized and reusable.

---

# 9. Authentication and Session Handling

POS Lite Web will use the existing POS Lite authentication system.

The frontend must support:

- Shop Code
- Username
- Password
- JWT access token
- Refresh token flow where supported
- Logout
- Forced logout where supported

### Rules

- Authentication logic must be centralized.
- Protected routes must use the approved authentication strategy.
- Unauthorized API responses must be handled consistently.
- The frontend must not invent an alternative authentication model.
- The backend remains the authority for authentication and authorization.

Token storage must follow the approved implementation and security requirements of the project. Do not independently change the token storage strategy during feature development.

---

# 10. Multi-Tenant Shop Context

POS Lite uses shop-based tenant context.

The web application must consistently send the required Shop Code or equivalent shop context with applicable requests.

### Rules

- Shop context handling must be centralized.
- Individual pages must not implement their own Shop Code logic.
- Do not hardcode a shop identifier.
- Do not allow accidental switching of shop context during a transaction.
- The selected shop context must be cleared or handled appropriately during logout.

The exact API behavior must follow `WEB_DEVELOPER_GUIDE.md` and the verified backend contract.

---

# 11. Forms and Validation

## React Hook Form

**Approved form library:** React Hook Form

Use React Hook Form for:

- Form state
- Field registration
- Validation integration
- Submission handling
- Form error management

## Zod

**Approved validation library:** Zod

Use Zod for client-side validation schemas where appropriate.

### Rules

- Reuse validation schemas where practical.
- Keep validation close to the relevant domain.
- Display validation errors near the affected fields.
- Client-side validation must improve usability but must not replace backend validation.

---

# 12. Data Tables

## TanStack Table

**Approved table library:** TanStack Table

Use TanStack Table for complex data-driven screens.

Typical features:

- Column definitions
- Sorting
- Filtering
- Pagination
- Row actions
- Responsive column behavior

### Rules

- Create reusable table patterns where possible.
- Avoid implementing different table architectures for every module.
- Keep backend pagination and filtering aligned with API capabilities.
- Do not fetch entire datasets when the backend provides paginated APIs.

---

# 13. Charts and Data Visualization

## Recharts

**Approved chart library:** Recharts

Use Recharts for:

- Bar charts
- Line charts
- Pie or donut charts
- Sales trends
- Payment distributions
- Business summaries

### Rules

- Use charts only when they improve understanding.
- Use backend summary or report endpoints.
- Do not calculate large business reports entirely in the browser.
- Follow chart rules in `UI_UX_GUIDELINES.md`.

---

# 14. Date and Time Handling

Use the approved project date utility consistently.

Recommended approach:

**date-fns**

Use it for:

- Date formatting
- Date range calculations
- Relative date handling
- Display formatting

### Rules

- Do not introduce multiple date libraries without approval.
- Keep API date formats separate from display formats.
- Handle timezone-sensitive values carefully.
- Follow backend contracts for date parameters.

---

# 15. Utility Functions

Reusable utility functions should be placed in a centralized location.

Examples:

```text
src/
  lib/
    api-client.ts
    auth.ts
    permissions.ts
    formatters.ts
    date.ts
    currency.ts
    utils.ts
```

Typical shared utilities:

- Currency formatting
- Date formatting
- API helpers
- Permission checks
- Class name helpers
- Shared calculations that are strictly presentation-related

Do not place backend business rules in frontend utility functions.

---

# 16. Application State Strategy

The application should distinguish between different types of state.

## Server State

Use TanStack Query.

Examples:

- Products
- Orders
- Customers
- Reports
- Users
- Settings

## Local UI State

Use React state where appropriate.

Examples:

- Open dialog
- Selected tab
- Temporary form state
- Local UI interactions

## Global Client State

Use only when state is genuinely shared across multiple unrelated parts of the application.

Potential examples:

- Authenticated user context
- Shop context
- Application-level UI preferences

A dedicated global state library should not be introduced unless a clear requirement demonstrates that React Context and local state are insufficient.

---

# 17. Recommended Project Structure

The exact structure may evolve, but the project should maintain clear separation of concerns.

Example:

```text
src/
├── app/
│   ├── (auth)/
│   ├── (dashboard)/
│   ├── pos/
│   └── layout.tsx
│
├── components/
│   ├── ui/
│   ├── layout/
│   ├── shared/
│   ├── pos/
│   └── charts/
│
├── features/
│   ├── auth/
│   ├── products/
│   ├── categories/
│   ├── inventory/
│   ├── customers/
│   ├── orders/
│   ├── purchases/
│   ├── expenses/
│   ├── reports/
│   └── administration/
│
├── services/
├── hooks/
├── lib/
├── types/
└── config/
```

### Rules

- Group domain-specific logic together where practical.
- Keep reusable UI separate from business features.
- Avoid putting all application logic inside page files.
- Avoid deeply nested folder structures without a clear benefit.
- Do not reorganize the entire repository merely to implement a feature.

---

# 18. POS Architecture

The two POS UI modes must share core POS behavior.

Recommended conceptual structure:

```text
POS Feature
│
├── POS Business Logic
│   ├── Cart state
│   ├── Product search
│   ├── Barcode input
│   ├── Customer selection
│   ├── Discounts
│   ├── Hold order
│   └── Checkout
│
├── Shared Components
│   ├── Product item
│   ├── Cart item
│   ├── Cart summary
│   └── Payment controls
│
└── UI Layouts
    ├── Standard Web POS
    └── POS Machine Mode
```

### Rules

- Do not duplicate POS API logic for each UI mode.
- Do not create separate cart business logic for each UI mode.
- Keep layout differences separate from transaction logic.
- Both modes must produce the same valid backend transactions.

---

# 19. File and Image Handling

Product, category, and branding images must follow the existing backend API behavior.

### Rules

- Do not implement a separate file storage system.
- Do not store business images directly in the frontend.
- Use the existing upload endpoints.
- Follow backend requirements for multipart requests.
- Centralize image URL handling where necessary.

---

# 20. Printing

The initial printing approach should use browser-supported printing.

### Initial Scope

- Browser print dialog
- Print-friendly bill layout
- Reprint completed bills where supported

### Rules

- Keep print layout separate from the normal POS layout where necessary.
- Do not build custom printer drivers for the initial release.
- Specialized printer integrations can be evaluated as a future enhancement.

---

# 21. Error Handling

Error handling should be consistent across the application.

The API layer should normalize or expose useful error information.

The UI should distinguish between:

- Validation errors
- Authentication errors
- Authorization errors
- Not found
- Business-rule errors returned by the backend
- Network errors
- Unexpected server errors

### Rules

- Do not expose raw technical exceptions to normal users.
- Use meaningful messages where possible.
- Handle `401` responses consistently.
- Handle `403` responses with permission-aware behavior.
- Provide retry actions when appropriate.

---

# 22. Environment Configuration

Environment-specific values must not be hardcoded.

Examples:

```text
NEXT_PUBLIC_API_BASE_URL=
NEXT_PUBLIC_APP_ENV=
```

The exact environment variables may evolve based on deployment requirements.

### Rules

- Do not commit secrets.
- Provide an `.env.example` file when environment variables are required.
- Use separate values for development, staging, and production where applicable.
- Do not place passwords, private keys, or secret tokens in frontend environment variables.

Any value prefixed for public browser access must be treated as public.

---

# 23. Code Quality

The project should use:

## ESLint

For:

- Code quality
- Common mistakes
- Consistency rules

## Prettier

For:

- Consistent formatting

### Rules

- New code should pass the configured lint rules.
- New code should follow project formatting.
- Do not disable lint rules broadly to bypass issues.
- Prefer fixing the underlying issue.

---

# 24. Testing Strategy

The project should not introduce a large testing stack unnecessarily during the initial foundation phase.

Testing requirements should be introduced progressively.

## Minimum Validation

Before a feature is considered complete:

- Type checking should pass.
- Lint should pass.
- Production build should pass.
- Relevant user workflows should be manually tested.

Additional automated testing can be introduced for:

- Critical POS calculations
- Authentication flows
- Permission logic
- High-risk business workflows

The exact testing tools should be selected only when automated testing is introduced and should be documented before broad adoption.

---

# 25. Performance Guidelines

The application should:

- Avoid unnecessary API calls.
- Use TanStack Query caching appropriately.
- Use backend pagination.
- Avoid loading large datasets unnecessarily.
- Lazy load or dynamically load heavy features where beneficial.
- Optimize images.
- Avoid unnecessary global state updates.
- Avoid excessive re-renders in the POS workflow.

Performance optimization should be evidence-based. Do not introduce complex optimization patterns without a demonstrated need.

---

# 26. Browser and Device Support

Primary support:

- Google Chrome
- Microsoft Edge
- Mozilla Firefox
- Safari where practical

Primary device priorities:

1. Desktop
2. Laptop
3. Tablet
4. Dedicated POS Machine / Touchscreen
5. Mobile browser

The POS Machine Mode should be optimized primarily for landscape-oriented touch terminals.

---

# 27. Accessibility

The technology implementation must support the accessibility requirements defined in `UI_UX_GUIDELINES.md`.

Important considerations:

- Keyboard navigation
- Focus management
- Semantic HTML
- Accessible labels
- Sufficient color contrast
- Touch-friendly controls
- Dialog focus behavior

Accessibility should be built into shared components instead of being added individually to each page later.

---

# 28. Deployment

Deployment details are intentionally kept lightweight at this stage.

The frontend should be capable of standard production deployment as a Next.js application.

The specific hosting provider, CI/CD pipeline, domains, and release workflow may be documented when the deployment environment is finalized.

Do not make application architecture decisions based on an unapproved hosting assumption.

---

# 29. Approved Dependencies Summary

| Area | Approved Technology |
|---|---|
| Application Framework | Next.js |
| UI Library | React |
| Language | TypeScript |
| Styling | Tailwind CSS |
| UI Components | shadcn/ui |
| Icons | Lucide React |
| Server State | TanStack Query |
| Forms | React Hook Form |
| Validation | Zod |
| Data Tables | TanStack Table |
| Charts | Recharts |
| Date Utilities | date-fns |
| Code Quality | ESLint |
| Formatting | Prettier |
| Backend | Existing POS Lite ASP.NET Core API |
| Database Access | Through backend API only |

---

# 30. Not Approved Without Explicit Decision

Do not introduce the following without explicit approval:

- Redux
- Zustand or another global state library
- A second CSS framework
- A second general-purpose UI component library
- A second icon library
- A second HTTP client architecture
- Another charting library
- Another table framework
- Another form library
- Another date library
- Direct database access
- A separate backend for duplicating existing POS business logic
- A separate authentication system
- A separate multi-tenant implementation
- Large framework or architectural rewrites

This does not mean these technologies are inherently unsuitable. It means they should not be added casually or independently during AI-assisted feature development.

---

# 31. Technology Decision Rules

When a new technical requirement appears:

1. Check whether the approved stack already solves the problem.
2. Check whether an existing project dependency can solve it.
3. Prefer extending existing patterns.
4. Do not add a new library for a small convenience feature.
5. If a new dependency is genuinely required, document:
   - The problem
   - Why existing tools are insufficient
   - The proposed dependency
   - Alternatives considered
   - Expected impact

No AI-generated feature implementation should silently introduce major dependencies.

---

# 32. Relationship to Other Documents

This document defines the approved technology choices.

Other project documents define different responsibilities:

- `PRD.md` — Product scope and functional requirements.
- `UI_UX_GUIDELINES.md` — Visual, interaction, and usability standards.
- `WEB_DEVELOPER_GUIDE.md` — Existing backend, API, authentication, permissions, and integration details.
- `AI_CODING_GUIDELINES.md` — Rules for AI-assisted development using Cursor.
- `VERSION_MANAGEMENT.md` — Version scope, implementation progress, acceptance criteria, and release tracking.

If documents appear to conflict:

- Product requirements → `PRD.md`
- Visual and interaction decisions → `UI_UX_GUIDELINES.md`
- Backend/API behavior → `WEB_DEVELOPER_GUIDE.md` and verified API contracts
- Technology decisions → `TECH_STACK.md`
- AI implementation behavior → `AI_CODING_GUIDELINES.md`
- Current development scope → `VERSION_MANAGEMENT.md`

---

# 33. Final Guiding Principle

POS Lite Web should use a **small, deliberate, and consistent technology stack**.

The goal is not to use the most libraries. The goal is to create a reliable web application that is easy to maintain and predictable for both developers and AI coding tools.

Before adding technology, ask:

> **Can the approved stack solve this problem cleanly?**

If the answer is yes, use the existing stack.
