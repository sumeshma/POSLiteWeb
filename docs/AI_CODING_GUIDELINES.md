# POS Lite Web — AI Coding Guidelines

**Product:** POS Lite Web  
**Document Version:** 1.0  
**Status:** Draft  
**Last Updated:** August 28, 2026  

---

# 1. Purpose

POS Lite Web is being developed primarily with AI-assisted coding using Cursor.

This document defines how AI should analyze, plan, implement, modify, test, and report changes to the codebase.

The objective is not simply to generate working code. The objective is to develop a maintainable, consistent, production-ready application without:

- Unnecessary architectural changes
- Duplicate implementations
- Unapproved dependencies
- Accidental modification of unrelated code
- Broken API contracts
- Inconsistent UI patterns
- Regression of existing functionality

This document answers:

> **How should AI-assisted development be performed for POS Lite Web?**

These rules apply to every feature, bug fix, refactor, and implementation task unless explicitly overridden by an approved project decision.

---

# 2. Required Context Before Coding

Before making changes, AI must identify the relevant project context.

The following documents must be consulted when applicable:

| Question | Source |
|---|---|
| What are we building? | `PRD.md` |
| How should it look and behave? | `UI_UX_GUIDELINES.md` |
| Which technologies are approved? | `TECH_STACK.md` |
| How does the backend/API work? | `WEB_DEVELOPER_GUIDE.md` |
| What is included in the current version? | `VERSION_MANAGEMENT.md` |
| How should AI implement changes? | This document |

AI must not blindly begin coding based only on a short prompt when relevant project documentation already exists.

---

# 3. Golden Rule: Analyze Before Changing

Before modifying code, AI must:

1. Read the user's requested change carefully.
2. Identify the relevant module and files.
3. Inspect existing implementations of similar functionality.
4. Check whether reusable components, hooks, services, or utilities already exist.
5. Review relevant project documentation.
6. Identify API contracts and permission requirements.
7. Check the current working tree for existing uncommitted changes when possible.
8. Make a minimal, focused implementation plan.

AI should understand the existing code before replacing or restructuring it.

Do not rewrite functioning code merely because another implementation style appears cleaner.

---

# 4. Working Tree Safety

The repository may contain work from previous development tasks.

Before beginning a significant implementation:

- Inspect existing modified files.
- Identify unrelated changes.
- Do not overwrite them.
- Do not revert them.
- Do not reformat unrelated files.
- Do not include unrelated cleanup in the requested feature.

If existing changes overlap with the requested work:

1. Understand what has already been changed.
2. Preserve working changes.
3. Integrate carefully.
4. Report the overlap if it creates uncertainty.

AI must treat existing uncommitted work as potentially intentional.

---

# 5. Scope Discipline

Implement only what the current request or approved version requires.

Do not silently add:

- Extra modules
- New technologies
- New dependencies
- Unrequested backend changes
- Large refactors
- New abstractions without a clear need
- UI redesigns outside the requested scope

Avoid "while I am here" development.

A good implementation is focused.

If a larger architectural issue is discovered, report it separately instead of silently expanding the scope.

---

# 6. Follow the Approved Technology Stack

All implementation must follow `TECH_STACK.md`.

The approved stack includes:

- Next.js
- React
- TypeScript
- Tailwind CSS
- shadcn/ui
- Lucide React
- TanStack Query
- React Hook Form
- Zod
- TanStack Table
- Recharts
- date-fns
- Existing POS Lite ASP.NET Core API

AI must not independently introduce major alternatives.

Examples that require approval:

- Redux
- Zustand
- Another UI framework
- Another CSS framework
- Another icon library
- Another HTTP architecture
- Another charting library
- Another form library
- Another table framework
- Direct database access
- A duplicate backend

Before proposing a new dependency, first check whether the approved stack already solves the problem.

---

# 7. Read Existing Patterns Before Creating New Ones

Before creating a new component, hook, service, or utility, search for similar existing implementations.

Examples:

Before creating:

- A modal → check existing dialogs.
- A data table → check the existing table pattern.
- An API service → check other domain services.
- A mutation → check existing mutation hooks.
- A loading state → check existing loading patterns.
- A toast → check the approved notification mechanism.
- A form → check similar forms.
- A permission check → check the centralized permission utilities.

Prefer:

> Reuse → Extend → Create

Do not create a second pattern when the first pattern can be extended cleanly.

---

# 8. Architecture Principles

Maintain separation between:

- UI components
- Feature logic
- API services
- Server state
- Local UI state
- Shared utilities
- Types and models

Avoid placing large amounts of:

- API logic
- Business logic
- Permission logic
- Data transformation
- Complex state management

directly inside page components.

Pages should primarily compose layouts and features.

---

# 9. API Integration Rules

The existing POS Lite backend is the source of truth for backend business operations.

Before integrating an API:

1. Check `WEB_DEVELOPER_GUIDE.md`.
2. Verify the endpoint against Swagger or the running API contract when available.
3. Confirm the request method.
4. Confirm required headers.
5. Confirm request body structure.
6. Confirm response structure.
7. Confirm authentication requirements.
8. Confirm permission requirements.

Do not guess API contracts.

---

# 10. Centralized API Client

All API communication must use the approved centralized API client.

Individual components must not:

- Hardcode API base URLs.
- Manually attach authorization headers.
- Manually attach Shop Code headers.
- Create independent fetch/axios instances.

The centralized API layer should be responsible for common concerns such as:

- API base URL
- Authentication
- Shop context
- Common headers
- Token refresh
- Standard response handling
- Standard error handling

If a shared API behavior is missing, improve the centralized implementation rather than duplicating logic across features.

---

# 11. Authentication Rules

Use the existing POS Lite authentication model.

AI must not create:

- A separate user database
- A separate login system
- A custom authentication flow that bypasses the backend
- Fake production authentication

The application must follow the existing flow for:

- Shop Code
- Username
- Password
- Access token
- Refresh token where supported
- Logout
- Forced logout

Protected screens must use the approved project authentication strategy.

---

# 12. Shop Context and Multi-Tenancy

POS Lite Web operates within a shop-based tenant context.

The required Shop Code or equivalent context must be handled centrally.

Rules:

- Never hardcode a Shop Code.
- Do not manually add tenant headers in individual page components.
- Do not allow unrelated features to implement their own shop context.
- Preserve the correct tenant context during user sessions.
- Handle shop context safely during logout.

When uncertain, follow `WEB_DEVELOPER_GUIDE.md` and the verified backend contract.

---

# 13. Authorization and Permissions

The backend is the final authority for authorization.

The frontend should:

- Show relevant navigation based on permissions.
- Hide unauthorized actions where appropriate.
- Protect route access according to the approved application pattern.
- Handle `403` responses gracefully.

The frontend must not assume:

> "If a button is hidden, the action is secure."

Backend authorization remains mandatory.

Do not invent new permission names. Use the permission model exposed by the existing backend.

---

# 14. TypeScript Rules

All application logic should use TypeScript.

AI should:

- Avoid `any`.
- Prefer explicit and reusable types.
- Type API request and response models.
- Avoid unsafe type assertions.
- Keep shared domain types centralized.
- Reuse existing types before creating duplicates.

Do not silence TypeScript errors using:

```text
any
@ts-ignore
@ts-nocheck
```

unless there is an exceptional, documented reason.

Fix the underlying type issue whenever possible.

---

# 15. Component Rules

Components should have a clear responsibility.

Prefer smaller focused components over one massive component containing:

- API calls
- Complex state
- Layout
- Form logic
- Data transformations
- Permissions
- Business rules

At the same time, avoid over-componentizing trivial markup.

Create a new component when it:

- Is reused.
- Has meaningful internal logic.
- Represents a meaningful UI unit.
- Improves readability.

Do not create components only to move five lines of static markup into another file.

---

# 16. UI Consistency Rules

All UI work must follow `UI_UX_GUIDELINES.md`.

Before creating a new screen, inspect similar screens.

Maintain consistency for:

- Page headers
- Primary actions
- Forms
- Tables
- Filters
- Dialogs
- Side sheets
- Buttons
- Loading states
- Empty states
- Error states
- Permission states
- Toast notifications
- Status badges

Do not redesign shared UI patterns independently for each module.

---

# 17. Standard Screen Requirements

For a typical data-driven screen, consider the following states:

- Initial loading
- Loaded with data
- Empty state
- Filtered empty state
- Error state
- Permission denied state where applicable

A feature is not complete simply because the happy path works.

---

# 18. Forms and Validation

Use:

- React Hook Form
- Zod where appropriate

Rules:

- Reuse schemas when practical.
- Keep validation close to the relevant domain.
- Show errors near affected fields.
- Prevent duplicate submission.
- Show loading state while saving.
- Disable or protect repeated submission during async operations.
- Reset or close forms only after successful completion where appropriate.

Client-side validation improves usability.

Backend validation remains the final authority.

---

# 19. Server State Rules

Use TanStack Query for backend/server data.

AI should:

- Use consistent query keys.
- Reuse query patterns.
- Invalidate or update affected queries after mutations.
- Avoid manually synchronizing the same server data across many local states.
- Avoid unnecessary refetching.

Do not use global client state to duplicate server data without a clear reason.

---

# 20. Error Handling

Handle errors according to their type.

Consider:

- Validation errors
- Authentication errors
- Authorization errors
- Not found
- Backend business-rule errors
- Network failures
- Unexpected server errors

Rules:

- Do not expose raw stack traces to normal users.
- Use meaningful backend messages where appropriate.
- Provide retry when useful.
- Handle `401` consistently.
- Handle `403` consistently.
- Do not silently swallow errors.

Every mutation should provide understandable success or failure feedback.

---

# 21. Loading and Async Behavior

Every meaningful asynchronous operation must provide feedback.

Examples:

- Page loading → skeleton or structured loading state.
- Table loading → local table loading state.
- Save → loading button.
- Checkout → protected processing state.
- Critical blocking operation → localized overlay when interaction would be unsafe.

Do not:

- Leave users guessing whether an action is processing.
- Freeze the entire application for a small local request.
- Allow duplicate POS checkout while a transaction is in progress.

---

# 22. Data and Pagination

If the backend supports:

- Pagination
- Filtering
- Searching
- Sorting

Use those capabilities instead of downloading entire datasets unnecessarily.

AI must not:

- Fetch thousands of records and paginate them only in the browser.
- Calculate large reports from raw transaction data when summary endpoints exist.
- Introduce expensive client-side processing without a requirement.

---

# 23. Business Logic Boundaries

The frontend should manage presentation and user interaction.

The existing backend should remain responsible for business operations and validation.

Do not duplicate backend logic such as:

- Order processing rules
- Inventory transaction rules
- Financial calculations
- Permission enforcement
- Tenant isolation
- Purchase processing

The frontend may calculate temporary display values, previews, and UI summaries where necessary, but the final transaction must follow backend behavior.

---

# 24. POS Implementation Rules

The POS module is business-critical.

Before changing POS behavior:

1. Inspect the existing POS implementation.
2. Identify shared business logic.
3. Preserve existing billing behavior unless explicitly changing it.
4. Verify the API contract.
5. Test the full checkout flow.

POS Lite Web supports:

- Standard Web POS
- POS Machine Mode

These modes must share:

- Cart behavior
- Product lookup
- Barcode handling
- Customer selection
- Discounts
- Held orders
- Checkout
- API integration
- Validation

Do not duplicate POS transaction logic for each UI mode.

Layout differences should remain separate from core POS behavior.

---

# 25. POS Machine Mode Rules

POS Machine Mode is optimized for dedicated billing terminals.

AI must follow the approved UI requirements:

- Distraction-free workspace
- No normal persistent sidebar
- Touch-friendly controls
- Prominent current order
- Prominent grand total
- Fixed and highly visible payment action
- Immediate product search
- Barcode scanner workflow
- Efficient repeated billing
- Primary landscape optimization

Do not treat POS Machine Mode as merely a CSS media query version of Standard Web POS.

It is a separate UI layout using shared POS logic.

---

# 26. Barcode Scanner Behavior

Where barcode scanners act as keyboard input:

- Support rapid input.
- Avoid unnecessary focus changes.
- Keep scanning workflow efficient.
- Handle repeated scans safely.
- Avoid adding specialized hardware dependencies unless approved.

Do not assume browser APIs can access proprietary scanner functionality.

---

# 27. Currency, Dates, and Formatting

Use centralized utilities for:

- Currency
- Numbers
- Dates
- Time
- Display formatting

Do not manually format currency differently across components.

Do not introduce multiple date libraries.

Keep:

- API formats
- Internal values
- Display formats

clearly separated.

---

# 28. Images and File Uploads

Follow existing backend upload contracts.

Rules:

- Do not create a separate file storage system.
- Do not store business images in browser-only storage.
- Use approved upload endpoints.
- Handle multipart requests correctly.
- Reuse centralized image URL or upload utilities when available.
- Show appropriate upload progress or loading feedback when useful.

---

# 29. Printing

Initial bill printing should use the approved browser-printing approach.

AI should:

- Create a print-friendly layout where required.
- Keep print-specific styling separate from normal application layout when practical.
- Avoid adding printer drivers or specialized hardware integrations without approval.

---

# 30. Dependency Management

Before adding any dependency:

1. Check whether it already exists in the project.
2. Check whether the approved stack already solves the requirement.
3. Check whether the implementation can be reasonably completed without it.
4. If a new dependency is genuinely needed, explain why.

AI must not silently install libraries for convenience.

Examples of poor behavior:

- Installing a library for one simple utility function.
- Installing another UI library for one component.
- Installing a global state library for a small local state problem.
- Installing another date library when `date-fns` already exists.

---

# 31. Refactoring Rules

Refactor only when:

- Required to implement the requested feature.
- Necessary to fix a defect.
- Necessary to remove meaningful duplication.
- Explicitly requested.

Avoid broad refactors during feature work.

Do not:

- Rename unrelated files.
- Move large parts of the project for style preferences.
- Reformat unrelated code.
- Replace established patterns without approval.

If a larger improvement is discovered, report it separately.

---

# 32. Database and Backend Boundaries

The web application must not:

- Connect directly to PostgreSQL.
- Execute SQL.
- Embed database credentials.
- Bypass backend authorization.
- Reimplement multi-tenancy.

If the existing API cannot support a required product feature:

1. Identify the missing capability.
2. Document the required backend change.
3. Do not invent a client-side workaround that compromises business correctness.

---

# 33. Security Rules

AI must never:

- Commit secrets.
- Hardcode passwords.
- Hardcode production tokens.
- Expose private backend credentials.
- Put secret values into public frontend environment variables.
- Disable authentication to simplify development.
- Bypass authorization checks.
- Log sensitive tokens unnecessarily.

Treat any `NEXT_PUBLIC_*` value as publicly visible to browser users.

---

# 34. Environment Configuration

Use environment variables for environment-specific configuration.

Examples may include:

```text
NEXT_PUBLIC_API_BASE_URL
NEXT_PUBLIC_APP_ENV
```

Rules:

- Keep secrets outside the frontend bundle.
- Maintain `.env.example` when useful.
- Do not commit environment-specific secrets.
- Do not hardcode development or production URLs inside feature components.

---

# 35. Code Quality Rules

Before considering work complete, run the available validation steps.

At minimum, when supported by the project:

1. Type check.
2. Lint.
3. Production build.

Fix errors introduced by the implementation.

Do not disable checks simply to obtain a successful build.

If an existing unrelated failure prevents full validation:

- Identify it clearly.
- Do not claim the project fully passes validation.
- Report which validation was completed and which was blocked.

---

# 36. Testing Rules

Every completed feature should be tested against its acceptance criteria.

Testing should include relevant:

- Happy paths
- Validation failures
- API errors
- Permission restrictions
- Loading behavior
- Empty states
- Responsive behavior where relevant

For critical workflows, especially POS:

- Test adding products.
- Test quantity changes.
- Test customer selection where applicable.
- Test hold/resume.
- Test checkout.
- Test duplicate submission protection.
- Test success and failure behavior.

Do not claim testing was completed unless it was actually performed.

---

# 37. Documentation Updates

Update documentation only when the implementation changes documented behavior.

Examples:

Update `VERSION_MANAGEMENT.md` when:

- Version scope changes.
- A version is completed.
- Acceptance criteria status changes.
- A significant implementation note must be recorded.

Update `TECH_STACK.md` when:

- An approved technology decision changes.

Update `UI_UX_GUIDELINES.md` when:

- A reusable design pattern or product-wide UI rule changes.

Update `WEB_DEVELOPER_GUIDE.md` only when the relevant backend documentation is owned and updated as part of the project process.

Do not update documentation merely to create noise.

---

# 38. Implementation Workflow

For a normal feature, follow this workflow.

## Step 1 — Understand

Read:

- The requested task
- Relevant version scope
- Relevant PRD section
- Relevant UI/UX rules
- Relevant API documentation

## Step 2 — Inspect

Identify:

- Existing feature structure
- Similar screens/components
- Existing services
- Existing hooks
- Existing types
- Existing permission handling

## Step 3 — Plan

Create a concise internal implementation plan:

1. Files to modify.
2. Reusable code to use.
3. API endpoints involved.
4. UI states to handle.
5. Validation required.

Do not begin a large feature with an undefined implementation direction.

## Step 4 — Implement

Implement the smallest coherent solution.

Rules:

- Reuse existing patterns.
- Keep concerns separated.
- Avoid unrelated changes.
- Avoid unapproved dependencies.

## Step 5 — Validate

Run available:

- Type checking
- Lint
- Build
- Relevant functional tests

## Step 6 — Review

Check:

- Requested scope is complete.
- No unrelated code was changed unnecessarily.
- Error states exist.
- Loading states exist.
- Permission behavior is handled.
- UI follows guidelines.

## Step 7 — Report

Provide a concise implementation summary.

---

# 39. Required Completion Report

After implementing a meaningful feature, the final development report should include:

## Summary

What was implemented.

## Files Changed

List important files created or modified.

## API Integration

List relevant endpoints or backend capabilities used.

## Validation

Clearly state what was actually run, for example:

```text
✓ Type check passed
✓ ESLint passed
✓ Production build passed
✓ POS checkout manually tested
```

If something was not run:

```text
⚠ Production build not run: existing unrelated build issue
```

## Known Limitations

List any known limitations, assumptions, or follow-up work.

Do not claim:

- "Fully tested"
- "Production ready"
- "Build passes"

unless those statements are actually supported by the validation performed.

---

# 40. How AI Should Handle Ambiguity

When requirements are unclear:

- Use existing documentation.
- Inspect similar implementations.
- Prefer established project patterns.
- Avoid inventing major behavior.

If a decision materially affects:

- Product behavior
- API contracts
- Data correctness
- Security
- Architecture
- Technology choices

AI should not silently make an arbitrary decision.

Instead, identify the ambiguity and request or recommend a decision.

For small implementation details, use reasonable judgment consistent with existing project patterns.

---

# 41. How AI Should Handle Existing Problems

If AI discovers an existing bug unrelated to the requested work:

Do not silently expand the task.

Instead:

1. Preserve the current task scope.
2. Avoid making the unrelated problem worse.
3. Report the issue separately if relevant.

If the issue blocks the requested implementation, explain the dependency clearly.

---

# 42. No Fake Implementation

AI must not create the appearance of a completed feature without implementing the actual behavior.

Examples to avoid:

- Static UI that does not call required APIs.
- Buttons with placeholder handlers presented as complete.
- Mock data silently used in production flows.
- Fake success messages without backend confirmation.
- Hardcoded permission behavior.
- Hardcoded report data.
- Dummy authentication.

Temporary mock data may be used only when explicitly requested or clearly identified as temporary.

---

# 43. No Silent API Assumptions

Never invent:

- Endpoint URLs
- Request fields
- Response fields
- Permission names
- Pagination parameters
- Authentication behavior

When documentation is incomplete, verify against available API sources.

If verification is impossible, clearly identify the missing information rather than implementing a fictional contract.

---

# 44. Git and Change Management

AI should preserve a clean and understandable change set.

Rules:

- Do not revert unrelated work.
- Do not overwrite previous uncommitted changes.
- Do not modify generated or lock files unnecessarily.
- Do not perform broad formatting changes.
- Keep implementation changes focused.

When a task is complete, clearly summarize the files affected.

---

# 45. Preferred Decision Order

When deciding how to implement something, use this priority order:

1. Correctness
2. Existing API contract
3. Security and tenant safety
4. Existing project architecture
5. Reusability
6. UI/UX consistency
7. Simplicity
8. Performance
9. Developer convenience

Do not sacrifice correctness or data safety for a faster implementation.

---

# 46. Relationship to Other Documents

This document defines the operational rules for AI-assisted implementation.

Other documents define different responsibilities:

- `PRD.md` — What POS Lite Web must do.
- `UI_UX_GUIDELINES.md` — How the product should look and behave.
- `TECH_STACK.md` — Which technologies and implementation tools are approved.
- `WEB_DEVELOPER_GUIDE.md` — How the existing backend, authentication, API, permissions, and integration work.
- `VERSION_MANAGEMENT.md` — What is included in each development version and its acceptance criteria.

When documents conflict, resolve based on responsibility:

- Product requirements → `PRD.md`
- UI/UX decisions → `UI_UX_GUIDELINES.md`
- Technology choices → `TECH_STACK.md`
- Backend/API contracts → `WEB_DEVELOPER_GUIDE.md` and verified backend behavior
- Current implementation scope → `VERSION_MANAGEMENT.md`
- AI development process → `AI_CODING_GUIDELINES.md`

---

# 47. Final AI Development Principle

AI should behave like a careful senior developer working inside an existing product.

Before making changes, understand the system.

While making changes, preserve consistency.

After making changes, validate honestly.

The goal is:

> **Small, correct, maintainable changes that fit naturally into POS Lite Web.**

Do not optimize for the largest possible code change.

Optimize for the safest and clearest implementation that fully satisfies the approved requirement.
