# POS Lite Web — UI/UX Guidelines

**Product:** POS Lite Web  
**Document Version:** 1.0  
**Status:** Draft  
**Last Updated:** August 28, 2026  

---

## 1. Purpose

This document defines the visual, layout, interaction, and usability standards for POS Lite Web.

Its purpose is to ensure that all screens and components follow a consistent design language, especially when features are developed using AI-assisted coding tools.

This document answers:

> **How should POS Lite Web look, feel, and behave?**

The product requirements are defined in `PRD.md`. Backend and API integration details are defined in `WEB_DEVELOPER_GUIDE.md`.

---

# 2. Design Principles

POS Lite Web is designed for small-shop operations. Users should be able to understand the interface quickly and perform common tasks with minimal effort.

The interface should follow these principles:

### 2.1 Simple

Avoid unnecessary complexity, excessive options, and visually crowded screens.

### 2.2 Fast

Common tasks such as billing, searching products, and updating inventory should require minimal clicks.

### 2.3 Consistent

The same action should look and behave the same way throughout the application.

### 2.4 Professional

The interface should feel modern and reliable without becoming overly decorative.

### 2.5 Information First

Business information should be easy to scan. Important numbers, statuses, actions, and warnings should be visually clear.

### 2.6 Desktop First

The primary experience should be optimized for:

1. Desktop
2. Laptop
3. Tablet landscape
4. Tablet portrait
5. Mobile browser

The web application should not simply imitate the Android application's layout.

---

# 3. Overall Visual Direction

The visual style should be:

- Modern
- Clean
- Professional
- Minimal
- Business-focused
- Easy to understand
- Comfortable for extended daily use

Avoid:

- Excessive gradients
- Excessive shadows
- Too many colors
- Decorative animations
- Overly rounded interfaces
- Large empty areas that reduce information density
- Different visual styles between modules

The application should feel like one cohesive product.

---

# 4. Application Layout

The protected application should use a consistent application shell.

## 4.1 Desktop Layout

The standard layout should contain:

```text
┌──────────────────────────────────────────────────────────────┐
│ Sidebar │ Top Header                                         │
│         ├────────────────────────────────────────────────────┤
│         │                                                    │
│         │ Breadcrumb / Page Context                          │
│         │                                                    │
│         │ Page Title                         Primary Action  │
│         │ Description                                        │
│         │                                                    │
│         │ Page Content                                       │
│         │                                                    │
└──────────────────────────────────────────────────────────────┘
```

### Sidebar

The sidebar should contain:

- Product or shop branding
- Main navigation
- Logical menu groups
- Active route indication
- Collapse capability where appropriate
- User or account access near the bottom

### Top Header

The header may contain:

- Page context
- Global search when implemented
- Notifications when implemented
- User menu
- Profile access

Do not overload the header with unnecessary controls.

---

# 5. Navigation Guidelines

Navigation should be grouped by business purpose.

Recommended structure:

```text
Dashboard

SALES
  POS
  Orders
  Customers

CATALOG
  Categories
  Products
  Inventory

PURCHASING
  Suppliers
  Purchases

FINANCE
  Expenses
  Reports

ADMINISTRATION
  Users
  Roles
  Attendance
  Activity Logs

SETTINGS
  Shop Settings
  My Profile
```

Rules:

- Show only menus relevant to the user's permissions.
- Use clear labels.
- Avoid deeply nested navigation.
- Highlight the current active page.
- Keep menu order consistent.
- Do not change navigation structure unnecessarily between versions.

---

# 6. Page Structure

Most management pages should follow a consistent pattern.

## Standard Page Layout

```text
Breadcrumb

Page Title
Short description if useful

[Primary Action]

[Search] [Filters] [Reset]

------------------------------------------------

Data Table / Cards / Main Content

------------------------------------------------

Pagination
```

### Page Header

Each page should normally include:

- Clear title
- Optional short description
- Primary action when applicable

Example:

```text
Products
Manage your shop products and pricing.

                              [+ Add Product]
```

Avoid repeating the page title unnecessarily inside the content area.

---

# 7. Responsive Behavior

## Desktop

Use the full application shell.

- Persistent sidebar
- Comfortable table layouts
- Multi-column forms
- Wide POS layout

## Laptop

Maintain the desktop structure with reduced spacing where necessary.

## Tablet

- Sidebar may collapse.
- Tables may scroll horizontally when necessary.
- Complex forms may reduce to fewer columns.
- POS layout may adapt to available width.

## Mobile Browser

The web application should remain usable but does not need to replace the dedicated Android experience.

Use:

- Collapsible navigation
- Single-column forms
- Bottom sheets or dialogs where appropriate
- Simplified table presentation where necessary

Do not remove critical functionality purely because the screen is smaller.

---

# 8. Spacing and Layout Rules

Use a consistent spacing system.

Recommended approach:

- Small gaps for related controls
- Medium gaps between sections
- Larger gaps between major content blocks

Do not use arbitrary spacing values throughout the project.

Components should align consistently.

Example:

```text
Page
  ├── Header
  │     └── Title + Action
  │
  ├── Filters
  │
  ├── Main Content
  │
  └── Pagination
```

Avoid excessive nesting of cards and containers.

---

# 9. Typography

Typography should establish a clear hierarchy.

## Hierarchy

### Page Title

Used once at the top of the page.

### Section Title

Used for major sections.

### Card Title

Used for summaries and grouped information.

### Body Text

Used for descriptions and normal information.

### Secondary Text

Used for metadata, timestamps, hints, and less important information.

Rules:

- Do not use too many font sizes.
- Do not use bold text excessively.
- Keep labels readable.
- Use clear contrast between primary and secondary information.

---

# 10. Colors and Theme

The actual color palette should follow the approved application theme.

Rules:

- Use semantic colors for success, warning, error, and information.
- Do not hardcode random colors inside feature components.
- Use design tokens, CSS variables, or the approved theme system.
- Maintain sufficient contrast for text and controls.

Status colors should communicate meaning consistently.

Example:

```text
Success / Active
Warning / Low Stock
Error / Out of Stock or Failed
Neutral / Inactive or Informational
```

Do not rely only on color to communicate important status.

---

# 11. Buttons

Use a limited and consistent button hierarchy.

## Primary Button

Use for the main action of a page.

Examples:

- Add Product
- Create Purchase
- Checkout
- Save Changes

There should normally be one visually dominant primary action in a local context.

## Secondary Button

Use for alternative actions.

Examples:

- Cancel
- Back
- View Details

## Destructive Action

Use for:

- Delete
- Permanently Remove
- Other irreversible operations

Destructive actions should not visually resemble normal primary actions.

### Button Rules

- Use clear action labels.
- Prefer verbs.
- Avoid vague labels such as "Submit" when a more specific label is available.
- Show loading state during async actions.
- Prevent duplicate submission while an operation is in progress.
- Do not disable a button without explaining why when the reason is not obvious.

---

# 12. Forms

Forms should be simple, structured, and easy to validate.

## General Rules

- Group related fields.
- Use clear labels.
- Mark required fields clearly.
- Provide helpful placeholders only when useful.
- Keep field order logical.
- Avoid excessively long forms without sections.

## Desktop Forms

Use multiple columns when it improves readability.

Example:

```text
Basic Information
------------------------------------------------
Product Name          Category
SKU                   Barcode

Pricing
------------------------------------------------
Selling Price         Cost Price
Tax Rate

Inventory
------------------------------------------------
Opening Stock         Reorder Level
Unit
```

## Validation

Validation errors should:

- Appear close to the affected field.
- Use clear language.
- Explain what the user needs to correct.
- Not disappear unexpectedly.

Do not rely only on a generic error toast for field validation.

---

# 13. Data Tables

Data-heavy management screens should generally use a consistent table pattern.

## Standard Table Features

Where applicable:

- Search
- Filters
- Sorting
- Pagination
- Loading state
- Empty state
- Row actions

Example:

```text
┌──────────────────────────────────────────────────────────────┐
│ Search products...        [Category] [Status] [Reset]       │
├──────────────────────────────────────────────────────────────┤
│ Image │ Product │ SKU │ Category │ Price │ Stock │ Actions │
├──────────────────────────────────────────────────────────────┤
│       │         │     │          │       │       │          │
├──────────────────────────────────────────────────────────────┤
│                    Pagination                               │
└──────────────────────────────────────────────────────────────┘
```

## Table Rules

- Do not overload tables with unnecessary columns.
- Important information should appear first.
- Secondary information may be hidden or moved into details on smaller screens.
- Numeric values should be consistently formatted.
- Actions should be predictable.

---

# 14. Search and Filters

Search and filtering should be placed near the top of data-driven pages.

Recommended pattern:

```text
[ Search........................ ] [ Filter ] [ Filter ] [ Reset ]
```

Rules:

- Search should have a clear purpose.
- Filters should only be shown when useful.
- Reset should appear when filters are active or when the page has multiple filters.
- Avoid requiring users to manually clear every filter.
- Preserve filter state during simple UI interactions where practical.

---

# 15. Dialogs and Side Sheets

Use dialogs and side sheets intentionally.

## Use a Dialog When

- The task is short.
- Only a small number of fields are required.
- The user needs quick confirmation.
- The operation should not require leaving the current context.

Examples:

- Confirm Delete
- Add Small Category
- Change Status

## Use a Side Sheet When

- A moderate form is required.
- The user benefits from keeping the main page visible.
- The operation is related to the current page.

Examples:

- Add Product
- Edit Customer
- Quick Purchase Details

## Use a Full Page When

- The workflow is complex.
- Multiple sections are required.
- The user needs significant workspace.

Examples:

- POS
- Complex settings
- Detailed reports

Do not use a dialog for every form.

---

# 16. Confirmation for Destructive Actions

Actions such as delete should require confirmation.

The confirmation should clearly communicate:

- What will happen.
- Which item is affected.
- Whether the action can be reversed.

Example:

```text
Delete Product?

Are you sure you want to delete "Orange Juice"?

[Cancel] [Delete Product]
```

Do not use vague confirmation messages such as:

> Are you sure?

---

# 17. Loading States

Every asynchronous operation should provide feedback.

## Page Loading

Use:

- Skeletons
- Structured loading placeholders

Avoid showing a blank page while data is loading.

## Button Loading

When saving:

```text
[ Saving... ]
```

Prevent duplicate submission.

## Local Loading

If only a table is loading, do not block the entire application.

## Full Workspace Loading

Use an overlay only when the user cannot safely interact with the affected area while loading.

Loading indicators should not unnecessarily block the entire page.

---

# 18. Empty States

Empty states should explain what is missing and what the user can do next.

Example:

```text
No products found

You haven't added any products yet.

[+ Add Product]
```

For filtered results:

```text
No products match your filters.

[Reset Filters]
```

Avoid showing only:

> No Data

---

# 19. Error States

Errors should be understandable and actionable.

## Form Errors

Show the error near the relevant field.

## API Errors

Display a meaningful message using the backend response where appropriate.

## Page Errors

Provide:

- Brief explanation
- Retry action where useful

Example:

```text
Unable to load products.

Please check your connection and try again.

[Try Again]
```

Do not expose raw technical error messages to normal users.

---

# 20. Toast Notifications

Use toast notifications for temporary feedback.

Examples:

### Success

- Product created successfully.
- Purchase saved successfully.

### Error

- Unable to save changes.
- Something went wrong.

### Information

- Order placed on hold.

Do not use a toast as the only feedback for critical failures requiring user action.

Avoid excessive notifications.

---

# 21. Status Badges

Use consistent badges for common states.

Examples:

- Active
- Inactive
- Low Stock
- Out of Stock
- Held
- Completed
- Cancelled

Rules:

- Keep badge wording short.
- Use the same status wording throughout the application.
- Combine color with text or icons when necessary.

---

# 22. POS Screen Guidelines

The POS screen is one of the most important screens in the product. It should prioritize speed, clarity, and fast billing operations.

POS Lite Web shall support **two distinct POS interface modes**:

1. **Standard Web POS**
2. **POS Machine Mode**

Both modes should share the same business logic, cart behavior, API integration, checkout flow, validation, and core POS components where practical. However, each mode must have its own layout optimized for its intended environment.

---

## 22.1 POS Mode Selection

The POS interface should support an approved mode-selection mechanism:

```text
POS Interface

○ Standard Web POS
● POS Machine Mode
```

The preference may later be stored per shop, user, or device depending on available backend support. The frontend must not assume a persistence model without approval.

---

## 22.2 Standard Web POS

Standard Web POS is intended for:

- Desktop computers
- Laptops
- Tablets
- Normal browser windows

It should work naturally within the standard POS Lite Web application shell.

### Recommended Layout

```text
┌──────────────────────────────────┬──────────────────────────┐
│ PRODUCT AREA                     │ CURRENT BILL             │
│                                  │                          │
│ 🔍 Search Products               │ Product A        ₹100    │
│                                  │ [-]  2  [+]              │
│ Categories                       │                          │
│ [All] [Food] [Drinks]            │ Product B        ₹200    │
│                                  │ [-]  1  [+]              │
│ Product Grid                     │                          │
│ [Product] [Product]              │ ──────────────────────   │
│ [Product] [Product]              │ Subtotal         ₹400    │
│                                  │ Discount          ₹20    │
│                                  │ Tax               ₹19    │
│                                  │                          │
│                                  │ TOTAL            ₹399    │
│                                  │                          │
│                                  │ [Hold] [Checkout]        │
└──────────────────────────────────┴──────────────────────────┘
```

### Rules

- Checkout must remain highly visible.
- The current total must be prominent.
- Product search must be immediately accessible.
- Quantity controls must be easy to use.
- Product cards should display only billing-relevant information.
- The layout should work with mouse, keyboard, and touch.
- Normal application navigation remains available.

---

## 22.3 POS Machine Mode

POS Machine Mode is intended for dedicated billing terminals and touchscreen systems primarily used for POS operations.

It should provide a **distraction-free, full-workspace billing experience**. The standard persistent application sidebar should not consume billing space in this mode.

### Recommended Layout

```text
┌─────────────────────────────────────────────────────────────────────┐
│ ☰ POS Lite     🏪 Shop Name                  User       ⏻ Logout   │
├───────────────────────────────────────┬─────────────────────────────┤
│ 🔍 Search Product / Scan Barcode      │ CURRENT ORDER               │
├───────────────────────────────────────┤                             │
│ [ ALL ] [ DRINKS ] [ FOOD ] [ ... ]   │ Product A          ₹100    │
│                                       │ [-]        2        [+]     │
│ ┌──────────┐ ┌──────────┐ ┌──────────┐│                             │
│ │ PRODUCT  │ │ PRODUCT  │ │ PRODUCT  ││ Product B          ₹200    │
│ │ IMAGE    │ │ IMAGE    │ │ IMAGE    ││ [-]        1        [+]     │
│ │ ₹100     │ │ ₹150     │ │ ₹200     ││                             │
│ └──────────┘ └──────────┘ └──────────┘│ ──────────────────────────  │
│                                       │ Subtotal            ₹400    │
│ ┌──────────┐ ┌──────────┐ ┌──────────┐│ Discount             ₹20    │
│ │ PRODUCT  │ │ PRODUCT  │ │ PRODUCT  ││ Tax                   ₹19   │
│ │ ₹250     │ │ ₹300     │ │ ₹350     ││                             │
│ └──────────┘ └──────────┘ └──────────┘│ TOTAL               ₹399    │
│                                       │                             │
│                                       │ [ HOLD ] [ PAY ₹399 ]       │
└───────────────────────────────────────┴─────────────────────────────┘
```

### POS Machine Mode Requirements

The interface should:

- Prioritize billing over general navigation.
- Use the available screen space efficiently.
- Keep product search and barcode scanning readily accessible.
- Keep the current order visible.
- Keep the grand total visible.
- Keep the primary payment action fixed and prominent.
- Use larger touch-friendly controls.
- Minimize unnecessary navigation and visual distractions.
- Support fast repetitive billing operations.
- Be optimized primarily for landscape orientation.

### Navigation

POS Machine Mode should not display the normal persistent sidebar.

A compact navigation or menu control may provide access to:

- Return to the main application
- Permitted quick actions
- User controls
- Logout

Navigation must not interfere with the primary billing workflow.

---

## 22.4 Touch-Friendly Controls

POS Machine Mode must assume that touch may be the primary input method.

Therefore:

- Product cards must have comfortable touch targets.
- Quantity controls must be easy to tap.
- Payment buttons must be large and clearly separated.
- Category controls must be easy to select.
- Critical actions must not depend on hover.
- Important actions should not use tiny icon-only controls.

Touch optimization should improve usability without making the interface unnecessarily oversized.

---

## 22.5 Barcode Scanner Support

The POS interface should support barcode scanner workflows where the scanner behaves as keyboard input.

The UI should:

- Allow rapid barcode input.
- Avoid requiring unnecessary mouse interaction before scanning.
- Handle repeated scans efficiently.
- Return focus to an appropriate product-search or scan input when practical.

Dedicated hardware integration beyond browser-supported input should not be assumed unless separately approved.

---

## 22.6 Cart Behavior

Both POS modes should provide the same core cart capabilities.

Users should be able to:

- Add products
- Increase quantity
- Decrease quantity
- Remove products
- Apply supported discounts
- Add packaging charges where applicable
- Select a customer
- Review totals
- Hold an order
- Complete checkout

The cart must clearly display:

- Product name
- Quantity
- Relevant item price
- Line totals where useful
- Discount information
- Tax information where applicable
- Grand total

---

## 22.7 Checkout Behavior

Checkout must be optimized for speed.

Available backend-supported payment methods may include:

- Cash
- UPI
- Card

The user should not be forced through unnecessary screens before completing a normal payment.

The final payment action must:

- Clearly communicate the action.
- Clearly show the amount.
- Show a loading state while processing.
- Prevent accidental duplicate submission.

---

## 22.8 Quick Actions

The following actions should be easily accessible when permitted:

- Hold Order
- View Held Orders
- Customer Selection
- Clear or Cancel Current Cart
- Payment
- Return to Main Application

Quick actions should remain secondary to product selection and payment.

---

## 22.9 Keyboard Support

POS Machine Mode should support keyboard workflows where practical.

Examples may include:

- Focusing product search.
- Navigating search results.
- Adjusting quantities.
- Opening checkout.
- Holding an order.

Keyboard shortcuts must remain optional and should not conflict unnecessarily with normal browser behavior.

---

## 22.10 Shared POS Design Rules

Regardless of POS mode:

- The current total must be visually prominent.
- Product search must be quick to access.
- Product selection should require minimal interaction.
- Quantity changes should be easy and reversible.
- Critical billing actions must clearly communicate their state.
- The user must receive clear success or failure feedback after checkout.
- The interface must prevent accidental duplicate billing submissions.
- Held orders should be easy to identify and resume.
- Business logic must remain consistent between the two UI modes.

---

# 23. Dashboard Guidelines

The dashboard should provide an immediate overview rather than trying to display every available metric.

## Recommended Structure

### Top Summary

- Today's Sales
- Total Orders
- Average Order Value
- Held Orders
- Low Stock

### Main Content

- Sales trend
- Payment method distribution
- Order type distribution

### Supporting Information

- Recent orders
- Low-stock products
- Quick actions

Rules:

- Important numbers should be easy to scan.
- Do not overcrowd the dashboard with charts.
- Charts should support decisions, not decoration.
- Use the appropriate visualization for the data.

---

# 24. Chart Guidelines

## Bar Charts

Use for:

- Comparing categories
- Hourly sales
- Monthly comparisons
- GST rate comparisons

## Line Charts

Use for:

- Trends over time
- Daily or monthly sales trends

## Donut or Pie Charts

Use for:

- Payment method distribution
- Order type distribution
- Expense category distribution

Rules:

- Avoid too many chart types on one page.
- Every chart should have a clear title.
- Tooltips should provide useful values.
- Do not use charts when a simple KPI is clearer.

---

# 25. Delete and Restore Experience

Where the backend supports soft deletion:

- Normal lists should not mix deleted and active records unless explicitly requested.
- Deleted items should be clearly identified.
- Restore should be available only to authorized users.
- Restore should require confirmation only when necessary.

The UI should make the current state obvious.

---

# 26. Permission-Aware UI

The interface should respond to the user's permissions.

Examples:

- Hide unavailable navigation.
- Hide unauthorized create actions.
- Hide edit and delete actions where appropriate.
- Display a clear permission-denied state when access is attempted.

However:

> Hiding a button is not a security mechanism. The backend remains responsible for authorization.

The UI must also handle backend `403` responses gracefully.

---

# 27. Accessibility and Usability

The application should support comfortable daily use.

Requirements:

- Readable text.
- Sufficient contrast.
- Keyboard-accessible controls where practical.
- Visible focus states.
- Clear labels.
- Do not rely only on icons for important actions.
- Provide tooltips for unfamiliar icon-only controls.
- Avoid tiny click targets.
- Use semantic HTML where practical.

---

# 28. Icons

Use the approved icon library consistently.

Rules:

- Use icons to support recognition.
- Do not use different icon libraries unnecessarily.
- Use familiar icons for common actions.
- Pair unfamiliar icons with text or tooltips.
- Keep icon sizing consistent.

---

# 29. Animation and Motion

Animation should be subtle and purposeful.

Appropriate uses:

- Dialog appearance
- Sidebar transitions
- Loading indicators
- Small state transitions

Avoid:

- Long animations
- Decorative motion
- Repeated attention-grabbing effects
- Animations that slow down operational workflows

Users should be able to interact with the application quickly.

---

# 30. Dark Mode

If dark mode is included in the approved product scope:

- Every shared component must support it.
- Avoid adding dark-mode styles separately for individual pages.
- Use the centralized theme system.
- Verify contrast and readability.
- Test tables, dialogs, forms, charts, status badges, and loading states.

Dark mode should feel like a complete theme, not a collection of isolated color overrides.

---

# 31. Consistency Rules for Development

When implementing a new screen:

1. Check whether a similar screen already exists.
2. Reuse existing components and patterns.
3. Do not create a new button style without a valid reason.
4. Do not create a new table pattern without a valid reason.
5. Do not introduce new spacing or color conventions casually.
6. Follow the standard loading, empty, error, and permission states.
7. Follow existing page structure unless the workflow requires something different.

Consistency is more important than making every page visually unique.

---

# 32. Screen Implementation Checklist

Before considering a screen complete, verify:

### Layout

- [ ] Uses the standard application shell where applicable.
- [ ] Page title is clear.
- [ ] Primary action is easy to find.
- [ ] Layout works at target screen sizes.

### Data

- [ ] Loading state exists.
- [ ] Empty state exists.
- [ ] Error state exists.
- [ ] Permission-denied state is handled where applicable.

### Forms

- [ ] Labels are clear.
- [ ] Validation is understandable.
- [ ] Save actions show progress.
- [ ] Duplicate submission is prevented.

### Tables

- [ ] Important columns are prioritized.
- [ ] Search and filters are clear.
- [ ] Pagination works where required.
- [ ] Row actions are understandable.

### UX

- [ ] Destructive actions require confirmation.
- [ ] Success and failure feedback is provided.
- [ ] Keyboard and mouse interactions work where applicable.
- [ ] The screen follows existing UI patterns.

---

# 33. Relationship to Other Project Documents

This document defines the visual and interaction standards.

Other documents define different responsibilities:

- `PRD.md` — What the product must do.
- `WEB_DEVELOPER_GUIDE.md` — How the existing backend and API work.
- `TECH_STACK.md` — Approved technologies and libraries.
- `AI_CODING_GUIDELINES.md` — Rules for AI-assisted implementation using Cursor.
- `VERSION_MANAGEMENT.md` — Development versions, scope, progress, and acceptance criteria.

If requirements conflict, resolve them based on the appropriate document:

- Product scope → `PRD.md`
- API behavior → `WEB_DEVELOPER_GUIDE.md` and verified API contract
- Technology decisions → `TECH_STACK.md`
- Implementation behavior → `AI_CODING_GUIDELINES.md`
- Version scope and progress → `VERSION_MANAGEMENT.md`
- Visual and interaction behavior → this document

---

# 34. Final Guiding Principle

Every POS Lite Web screen should aim to answer three questions immediately:

1. **Where am I?**
2. **What information am I looking at?**
3. **What can I do next?**

The interface should help users complete shop operations quickly, confidently, and with minimal training.
