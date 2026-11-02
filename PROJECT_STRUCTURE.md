# Project Structure & Architecture Guide for AI & Developers

This document serves as the comprehensive architectural reference and learning guide for AI assistants and engineers working on this codebase.

---

## 1. Application Overview

**FamilyApp - All-in-One Family & Household Life Organizer Platform**

FamilyApp is a modern progressive web and mobile application designed to manage personal, household, and special occasion workflows seamlessly:

- **Main Dashboard (`MainDashboard.vue`)**: Real-time spending health, net cash flow, event budget allocation, pending tasks overview, quick actions, and interactive SVG Donut charts.
- **Expenses Management (`Expenses.vue`)**: Categorized expenses (`Groceries`, `Utilities`, `Dining`, etc.), custom event tags (`Brother Marriage`, `Haldi`, `Sangeet`, etc.), contributor splits, payment tracking, and status filtering.
- **Income Tracking (`Incomes.vue`)**: Income sources (`Salary`, `Business`, `Investments`, `Gift/Shagun`, etc.), earner tracking, contributor allocation, and net savings analytics.
- **Guests & Occasions Hub (`Guestlist.vue`)**: Top-level tab orchestrator delegating to:
  - **Guests Directory (`Guests.vue`)**: Party contacts directory, phone/email, party sizes (`+N` extra persons), and group/VIP classification.
  - **Events Planner (`Events.vue`)**: Occasions tracker (date, time, venue, category, countdowns, budget allocations, and invite summaries).
  - **Invites Management (`Invites.vue`)**: Per-event invitation tracker with RSVP states (`invited`, `confirmed`, `pending`, `declined`), accompanying person details, and return gift allocations.
- **Family Squad (`FamilyMembers.vue`)**: Monthly budget allocations per member, real-time spent vs. remaining progress, and active profile impersonation.
- **Recurring Commitments (`RecurringExpenses.vue`)**: Repeating commitments (monthly, quarterly, yearly), next due dates, billing cycle calculations, and active toggles.
- **Shopping List (`ShoppingList.vue`)**: Items checklist with quantity, unit prices, category tags, priority levels (`urgent`, `high`, `medium`, `low`), quick-pick product catalog presets, and purchased states.
- **Todo Tasks (`TodoList.vue`)**: Priority-ranked tasks (`high`, `medium`, `low`), due dates, assignee tagging, category filters, and quick completion toggles.
- **Tag & Gifts Managers (`TagsManager.vue`, `ReturnGiftsManager.vue`)**: Centralized management for reusable custom tags and return gift inventory.
- **Authentication & User Profiles (`LoginView.vue`, `AuthModal.vue`, `UserProfileModal.vue`, `ProfileSwitcher.vue`)**: Supabase user authentication with email/password, session storage, avatar pickers, role mapping, and family impersonation.

---

## 2. Technology Stack

| Layer | Technology | Details |
|---|---|---|
| **Framework** | **Vue 3** | Composition API with `<script setup lang="ts">` |
| **Build Tool** | **Vite 5** | Rolldown / Vite bundler with fast HMR (build target: `Publish/`) |
| **UI Library** | **Vuetify 3** | Material Design component framework with custom color palettes |
| **Mobile / Native** | **Capacitor / Android** | Android wrapper assets and configuration in `android/` |
| **Icons** | **@mdi/font** | Material Design Icons (`mdi-*`) |
| **State Management** | **Pinia 2** | Modular reactive stores with getters, actions, and dual persistence |
| **Database & Sync** | **Supabase Edge Functions** | `edgeCrud` protocol with automatic `localStorage` fallback |
| **Styles & SCSS** | **SASS / SCSS** | Centralized component rules in `src/scss/_app-components.scss` |
| **Typography** | **Public Sans** | `@fontsource/public-sans` (weights 400, 500, 600, 700) |
| **Language** | **TypeScript** | Strict domain typings in `src/types/` and `src/services/service.d.ts` |

---

## 3. Directory Layout & File Map

```
FamilyApp/
├── AGENTS.md                   # AI Assistant agent rules & guidelines
├── PROJECT_STRUCTURE.md        # This architectural knowledge document
├── README.md                   # General project setup and run instructions
├── index.html                  # HTML entry point (title, viewport, fonts)
├── package.json                # Project dependencies & npm scripts
├── tsconfig.json               # Root TypeScript configuration
├── tsconfig.app.json           # Application TypeScript compiler options
├── tsconfig.node.json          # Node/Vite TypeScript compiler options
├── vite.config.mts             # Vite plugins, auto-imports, and alias (`@` -> `/src`)
│
├── android/                    # Capacitor Android native project & gradle wrapper
├── public/                     # Static assets (favicons, SVG badges, etc.)
├── Publish/                    # Production distribution output folder
│
└── src/
    ├── main.ts                 # App bootstrap: plugins, Public Sans fonts, SCSS
    ├── App.vue                 # App root wrapper (<v-app><router-view /></v-app>)
    ├── env.d.ts                # Vite client type references
    │
    ├── assets/                 # Brand images and logos (`logo.png`, `logo.svg`)
    │
    ├── types/
    │   └── index.ts            # Central TypeScript domain interfaces
    │
    ├── lib/
    │   └── supabase.ts         # Supabase client & edgeCrud helper
    │
    ├── composables/
    │   └── useModalBack.ts     # Mobile browser popstate & back button handling
    │
    ├── services/
    │   ├── service.js          # Pure business logic, helpers, math & sanitizers
    │   └── service.d.ts        # TypeScript declarations for service.js
    │
    ├── stores/
    │   ├── app.ts              # Global UI state (leftDrawer, navigation)
    │   ├── auth.ts             # Supabase user authentication & active session
    │   ├── events.ts           # Events planner store (CRUD, categories, dates)
    │   ├── expenses.ts         # Expense records & contributor calculations
    │   ├── family.ts           # Family members & active profile impersonation store
    │   ├── guests.ts           # Guest party & return gifts store
    │   ├── incomes.ts          # Income records & contributor tracking store
    │   ├── recurring.ts        # Recurring bills & subscription store
    │   ├── shopping.ts         # Shopping list checklist & product catalog store
    │   └── todos.ts            # Todo tasks store & edge synchronization
    │
    ├── components/
    │   ├── AuthModal.vue           # Compact login/register dialog
    │   ├── Events.vue              # Occasions & event planner (date, venue, budget, countdown)
    │   ├── Expenses.vue            # Expense items list, category filters & add/edit modal
    │   ├── FamilyMembers.vue       # Family member budget cards & spend tracking
    │   ├── Guestlist.vue           # Tab orchestrator for Guests, Events, and Invites
    │   ├── Guests.vue              # Dedicated guest directory, contacts & party size
    │   ├── HelloWorld.vue          # Template starter component
    │   ├── Incomes.vue             # Income records list, category cards & modal
    │   ├── Invites.vue             # Event invitation manager, RSVP chips, +N party & return gifts
    │   ├── LoginView.vue           # Standalone full-page login/register view
    │   ├── MainDashboard.vue       # Summary metrics, donut charts & quick actions
    │   ├── ProfileSwitcher.vue     # Family profile switcher modal
    │   ├── RecurringExpenses.vue   # Recurring bills, billing cycle cards & dialog
    │   ├── ReturnGiftsManager.vue  # Return gifts catalog & distribution tracker
    │   ├── ShoppingList.vue        # Shopping checklist with presets & priority tags
    │   ├── TagsManager.vue         # Custom tags manager modal
    │   ├── TodoList.vue            # Task list, priority badges & toggle actions
    │   ├── UserProfileModal.vue    # Account settings, avatar customization & logout dialog
    │   └── shared/
    │       ├── BaseBreadcrumb.vue  # Reusable page breadcrumbs
    │       ├── DonutPieChart.vue   # Reusable SVG donut/pie chart component
    │       ├── EventDetail.vue     # Reusable single event details card & RSVP/invite info
    │       ├── UiParentCard.vue    # Base styled card container
    │       └── UiTitleCard.vue     # Styled card with header title slot
    │
    ├── pages/
    │   └── index.vue           # Mobile-first shell layout, sidebar drawer, app bar & bottom nav
    │
    ├── plugins/
    │   ├── index.ts            # Vuetify, Pinia, Router registration
    │   └── vuetify.ts          # Custom color palettes, light/dark themes
    │
    ├── router/
    │   └── index.ts            # Vue Router route configuration
    │
    └── scss/
        ├── style.scss          # Root SCSS import manifest
        ├── settings.scss       # Vuetify SASS variables configuration
        ├── _variables.scss     # Global Vuetify variable overrides
        ├── _override.scss      # Theme overrides
        ├── _app-components.scss# CENTRALIZED component styles, utilities & fonts
        ├── components/         # Granular Vuetify overrides (VCard, VBtn, etc.)
        ├── grid/               # Grid layout styling
        ├── layout/             # App shell layout styling
        └── page/               # Page-specific styling
```

---

## 4. Architectural Rules & Guidelines for AI

### 4.1. Centralized Service Layer (`src/services/service.js` & `service.d.ts`)
- **Rule**: **Do NOT write pure business logic, calculations, data sanitization, or SVG geometry directly inside Vue component script blocks.**
- **Implementation**:
  - Implement helper functions in `src/services/service.js`.
  - Provide complete TypeScript typings in `src/services/service.d.ts`.
  - Export both named exports (`export function foo()`) and add to the `default export` object.
  - Import into components via `import { foo } from '@/services/service.js'`.

#### Key Service Modules in `service.js`:
1. **Family & Squad**: Budget summaries, member spend percentage, remaining/overspent math, avatar helpers.
2. **Dashboard & Navigation**: Date formatting, Brother Marriage budget metrics, pending tasks preview, tab titles and subtitles.
3. **Todos**: Priority color and icon mapping, progress percentage calculations, filtering.
4. **Expenses**: Category icons/colors, tag filters, contributor splits, payload builders.
5. **Incomes**: Category icons/colors, earner calculations, net cash flow (`totalIncomes - totalExpenses`).
6. **Recurring**: Frequency labels, next due date calculation, recurring payloads.
7. **Guests, Invites & Return Gifts**:
   - `getInitials(name)`: Produces 1-2 uppercase avatar initials.
   - `sanitizeAccompanyingPersons(persons)`: Filters empty rows and assigns default relations.
   - `sanitizeReturnGifts(gifts)`: Validates names and parses numerical prices.
   - `syncAccompanyingPersons(current, count)`: Auto-adjusts accompanying person rows when count changes.
   - `buildGuestPayload(form)`: Builds sanitized payloads for store actions.
   - `buildReturnGift(name, price)`: Factory for return gift items.
   - `calculateGuestGiftsTotal(gifts)`: Sums return gift prices.
   - `formatGuestPartyDisplay(guest)`: Returns formatted party representation (`+N`).
8. **Shopping List**: Priority colors and icons (`urgent`, `high`, `medium`, `low`).
9. **SVG Geometry**: Trigonometric math for custom SVG donut and arc slices (`polarToCartesian`, `createArcPath`, `createSegment`, `computePieSlices`).

---

### 4.2. Centralized Stylesheet Architecture (`src/scss/_app-components.scss`)
- **Rule**: **Do NOT place large `<style scoped>` blocks inside Vue component files (`.vue`).**
- **Rationale**:
  - Centralizing styles avoids CSS fragmentation, prevents style duplication, and ensures consistent cross-component theming (light/dark mode compatibility).
  - All shared component styling, hover states, scrollbar hides (`.no-scrollbar`), card borders (`.card-hover-border`), chip styles, and transitions reside in `src/scss/_app-components.scss`.

---

### 4.3. Typography & Font Uniformity
- **Rule**: **Public Sans is the mandatory font across the entire application.**
- **Enforcement**:
  - Font weights 400, 500, 600, and 700 are imported in `src/main.ts` via `@fontsource/public-sans`.
  - Global CSS in `src/scss/_app-components.scss` enforces:
    ```scss
    html, body, #app, .v-application, .v-application *,
    .text-h1, .text-h2, .text-h3, .text-h4, .text-h5, .text-h6,
    .text-subtitle-1, .text-subtitle-2,
    .text-body-1, .text-body-2,
    .text-button, .text-caption, .text-overline,
    .v-card, .v-btn, .v-chip, .v-list, .v-field, .v-input,
    .v-table, .v-dialog, .v-menu, .v-toolbar,
    input, textarea, select, button {
      font-family: 'Public Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif !important;
    }
    ```

---

### 4.4. Mobile Back Button Interceptor (`src/composables/useModalBack.ts`)
- On mobile devices (Android / PWA), tapping the hardware or gesture back button should dismiss open drawers or modal dialogs rather than navigating away from the app.
- Use `useModalBack(isOpenRef, modalId)` to automatically attach `window.addEventListener('popstate')` and synchronize reactive modal states with browser history.

---

### 4.5. State Management & Data Persistence Pattern
- Each domain has a dedicated Pinia store in `src/stores/`.
- Stores follow the dual-persistence model:
  1. **Primary Persistence**: Supabase Edge Function via `edgeCrud` in `src/lib/supabase.ts`.
  2. **Fallback Persistence**: `localStorage` cache with a dedicated storage key (e.g. `events_store_v1`, `guests_store_v1`, `expenses_store_v1`).
- Mutations update local reactive state immediately (optimistic UI), persist to `localStorage`, and asynchronously sync with Supabase.

---

### 4.6. Windows Command Execution
- On Windows systems with restricted PowerShell execution policies for `.ps1` scripts, run npm scripts using `cmd.exe /c`:
  ```powershell
  cmd.exe /c npm run build-only
  cmd.exe /c npm run dev
  ```

---

## 5. Domain Data Models Reference

### 5.1. Event Item & Invites (`EventItem`, `EventGuestInvite`)
```typescript
export type EventRsvpStatus = 'invited' | 'confirmed' | 'pending' | 'declined'

export interface EventGuestInvite {
  guestId: string
  name: string
  phone?: string
  email?: string
  group?: string
  tags?: string[]
  additionalGuests?: number
  rsvpStatus: EventRsvpStatus
  invitationSent?: boolean
  notes?: string
}

export interface EventItem {
  id: string
  title: string
  description?: string
  date: string
  time?: string
  location?: string
  category?: string
  color?: string
  invitedGuests: EventGuestInvite[]
  notes?: string
  createdAt?: string
  updatedAt?: string
}
```

### 5.2. Guest Item (`GuestItem`)
```typescript
export type RsvpStatus = 'confirmed' | 'pending' | 'declined'

export interface AccompanyingPerson {
  id?: string
  name: string
  relation?: string
}

export interface ReturnGift {
  id?: string
  name: string
  price: number
}

export interface GuestItem {
  id: string
  name: string
  phone?: string
  email?: string
  group: string // "Groom's Family" | "Bride's Family" | "College Friends" | "VIP" | etc.
  tags: string[] // e.g. ["Brother Marriage", "VIP", "Outstation"]
  rsvpStatus: RsvpStatus
  additionalGuests: number // Extra persons (e.g., 2 means guest + 2 = party of 3)
  accompanyingPersons?: AccompanyingPerson[]
  returnGifts: ReturnGift[]
  returnGiftGiven?: boolean
  notes?: string
  createdAt?: string
  updatedAt?: string
}
```

### 5.3. Expense Item (`ExpenseItem`)
```typescript
export type ExpenseCategory =
  | 'Groceries'
  | 'Utilities'
  | 'Dining'
  | 'Shopping'
  | 'Entertainment'
  | 'Health'
  | 'Transport'
  | 'Other'

export interface ExpenseItem {
  id: string
  title: string
  amount: number
  category: ExpenseCategory
  memberId: string // Family member identifier
  date: string
  tags?: string[]
  notes?: string
}
```

### 5.4. Income Item (`IncomeItem`)
```typescript
export type IncomeCategory =
  | 'Salary'
  | 'Business'
  | 'Freelance'
  | 'Investments'
  | 'Gift/Shagun'
  | 'Rental'
  | 'Refund'
  | 'Other'

export interface IncomeItem {
  id: string
  title: string
  amount: number
  category: IncomeCategory
  memberId: string
  date: string
  tags?: string[]
  notes?: string
}
```

### 5.5. Shopping List & Products (`ShoppingItem`, `ShoppingProduct`)
```typescript
export type ShoppingPriority = 'urgent' | 'high' | 'medium' | 'low'

export interface ShoppingProduct {
  id?: string
  name: string
  defaultPrice?: number
  defaultQuantity?: number
  defaultTag?: string
}

export interface ShoppingItem {
  id: string
  productName: string
  price: number
  quantity: number
  tags: string[]
  priority: ShoppingPriority
  isPurchased: boolean
  memberId?: string
  notes?: string
}
```

### 5.6. Family Member (`FamilyMember`)
```typescript
export interface FamilyMember {
  id: string
  name: string
  role: string
  avatarColor: string
  monthlyBudget?: number
  avatarIcon?: string
}
```

### 5.7. Todo Task (`TodoItem`)
```typescript
export type Priority = 'low' | 'medium' | 'high'

export interface TodoItem {
  id: string
  title: string
  completed: boolean
  priority: Priority
  category?: string
  dueDate?: string
  memberId?: string
  createdAt: string
}
```

### 5.8. Recurring Expense (`RecurringExpenseItem`)
```typescript
export type Frequency = 'daily' | 'weekly' | 'monthly' | 'yearly'

export interface RecurringExpenseItem {
  id: string
  title: string
  amount: number
  frequency: Frequency
  category: ExpenseCategory
  memberId: string
  billingDay: number // e.g. day 1-31
  nextDueDate: string
  isActive: boolean
  tags?: string[]
  notes?: string
}
```

### 5.9. Authentication & User Profile (`AppUser`, `AuthState`)
```typescript
export interface AppUser {
  id: string
  email: string
  name: string
  mobile?: string
  role?: string
  avatarColor?: string
  avatarIcon?: string
  familyMemberId?: string
  createdAt?: string
}

export interface AuthState {
  user: AppUser | null
  isAuthenticated: boolean
  isLoading: boolean
}
```

---

## 6. Quick Checklist for Adding New Features
1. **Types**: Define new interfaces in `src/types/index.ts`.
2. **Business Logic**: Add pure calculation/formatting/sanitizing functions in `src/services/service.js` and matching types in `src/services/service.d.ts`.
3. **Store**: Add state, getters, and CRUD actions in `src/stores/` with dual persistence (`edgeCrud` + `localStorage`).
4. **Styles**: Add CSS rules in `src/scss/_app-components.scss` (never large scoped blocks in `.vue`).
5. **Component**: Consume store and service helpers using `<script setup lang="ts">`.
6. **Mobile Handling**: Register dialogs/drawers with `useModalBack` for seamless back-button handling.
7. **Build Verification**: Validate with `cmd.exe /c npm run build-only` ensuring 0 compilation errors.
