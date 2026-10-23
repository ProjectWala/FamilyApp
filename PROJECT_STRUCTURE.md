# Project Structure & Architecture Guide for AI & Developers

This document serves as the comprehensive architectural reference and learning guide for AI assistants and engineers working on this codebase.

---

## 1. Application Overview

**Personal & Event Management Platform (Wedding / Event Budget, Todos, Family Squad, Recurring Bills & Guest Return Gifts)**

The application is an all-in-one organizer designed for tracking:
- **Main Dashboard**: Real-time spending health, event budget allocation (e.g. Brother Marriage), pending high-priority todos, and interactive SVG Donut charts.
- **Expenses Management**: Categorized expenses, custom event tags (`Brother Marriage`, `Haldi`, `Sangeet`, etc.), contributor splits, and status filtering.
- **Guest List & Return Gifts**: Guest party tracker (name + additional persons `+N`), RSVP status chips, contact details, and an array of return gifts (`name`, `price`).
- **Family Squad**: Budget allocations per member, real-time spent vs remaining progress, and active profile impersonation.
- **Recurring Expenses**: Repeating commitments (monthly, quarterly, yearly), next due dates, and cycle calculations.
- **Todo Tasks**: Priority-ranked tasks (`high`, `medium`, `low`), due dates, assignee tagging, and quick completion toggles.

---

## 2. Technology Stack

| Layer | Technology | Details |
|---|---|---|
| **Framework** | **Vue 3** | Composition API with `<script setup lang="ts">` |
| **Build Tool** | **Vite 5** | Rolldown / Vite bundler with fast HMR |
| **UI Library** | **Vuetify 3** | Material Design component framework |
| **Icons** | **@mdi/font** | Material Design Icons (`mdi-*`) |
| **State Management** | **Pinia** | Modular stores with reactive getters and actions |
| **Database & Sync** | **Supabase Edge Functions** | `edgeCrud` protocol with automatic `localStorage` fallback |
| **Styles & SCSS** | **SASS / SCSS** | Centralized in `src/scss/_app-components.scss` |
| **Typography** | **Public Sans** | `@fontsource/public-sans` (400, 500, 600, 700) |
| **Language** | **TypeScript** | Strict typings in `src/types/` and `src/services/service.d.ts` |

---

## 3. Directory Layout & File Map

```
todo/
├── AGENTS.md                   # AI Assistant agent rules & guidelines
├── PROJECT_STRUCTURE.md        # This architectural knowledge document
├── README.md                   # General project setup instructions
├── index.html                  # HTML entry point (title, viewport, fonts)
├── package.json                # Project dependencies & npm scripts
├── tsconfig.json               # Root TypeScript configuration
├── tsconfig.app.json           # Application TypeScript compiler options
├── vite.config.mts             # Vite plugins and alias configuration (`@` -> `/src`)
│
├── public/                     # Static assets (favicons, SVG badges, etc.)
│
└── src/
    ├── main.ts                 # App bootstrap: plugins, Public Sans fonts, SCSS
    ├── App.vue                 # App root wrapper (<v-app><router-view /></v-app>)
    │
    ├── types/
    │   └── index.ts            # Central TypeScript domain interfaces
    │
    ├── lib/
    │   └── supabase.ts         # Supabase client & edgeCrud helper
    │
    ├── services/
    │   ├── service.js          # Pure business logic, helpers, math & sanitizers
    │   └── service.d.ts        # TypeScript declarations for service.js
    │
    ├── stores/
    │   ├── todos.ts            # Todo tasks store & edge synchronization
    │   ├── expenses.ts         # Expense records & contributor calculations
    │   ├── family.ts           # Family members & active profile store
    │   ├── recurring.ts        # Recurring bills & subscription store
    │   └── guests.ts           # Guest party & return gifts store
    │
    ├── components/
    │   ├── MainDashboard.vue   # Summary metrics, donut charts, quick actions
    │   ├── Expenses.vue        # Expense items list, filters & create/edit dialog
    │   ├── GuestsList.vue      # Guest list, RSVP chips, +N party & return gifts
    │   ├── FamilyMembers.vue   # Family member budget cards & spend tracking
    │   ├── RecurringExpenses.vue # Recurring bills, cycle cards & dialog
    │   ├── TodoList.vue        # Task list, priority badges & toggle actions
    │   └── ProfileSwitcher.vue # App bar profile impersonation selector
    │
    ├── pages/
    │   └── index.vue           # Main SPA layout with tab navigation & header
    │
    ├── plugins/
    │   ├── index.ts            # Vuetify, Pinia, Router registration
    │   └── vuetify.ts          # Custom color palettes, dark/light themes
    │
    ├── router/
    │   └── index.ts            # Vue Router route configuration
    │
    └── scss/
        ├── style.scss          # Root SCSS import manifest
        ├── _variables.scss     # Global Vuetify variable overrides
        ├── _app-components.scss# CENTRALIZED component styles, utilities & fonts
        └── components/         # Granular Vuetify overrides (VCard, VBtn, etc.)
```

---

## 4. Architectural Rules & Guidelines for AI

### 4.1. Centralized Service Layer (`src/services/service.js` & `service.d.ts`)
- **Rule**: **Do NOT write pure business logic, calculations, data sanitization, or SVG geometry directly inside Vue component script blocks.**
- **Implementation**:
  - Implement functions in `src/services/service.js`.
  - Provide complete TypeScript typings in `src/services/service.d.ts`.
  - Export both named exports (`export function foo()`) and add to the `default export` object.
  - Import into components via `import { foo } from '@/services/service.js'`.

#### Key Service Modules in `service.js`:
1. **Family & Squad**: Budget summaries, member spend percent, remaining/overspent math.
2. **Dashboard**: Date formatting, Brother Marriage budget metrics, pending tasks.
3. **Todos**: Priority color mapping, progress percentage calculations.
4. **Expenses**: Category icons/colors, tag filters, contributor splits.
5. **Recurring**: Frequency labels, next due date calculation, recurring payloads.
6. **Guests & Return Gifts**:
   - `getInitials(name)`: Produces 1-2 uppercase avatar initials.
   - `sanitizeAccompanyingPersons(persons)`: Filters empty rows and assigns default relations.
   - `sanitizeReturnGifts(gifts)`: Validates names and parses numerical prices.
   - `syncAccompanyingPersons(current, count)`: Auto-adjusts accompanying person rows when count changes.
   - `buildGuestPayload(form)`: Builds sanitized payloads for store actions.
   - `buildReturnGift(name, price)`: Factory for return gift items.
   - `calculateGuestGiftsTotal(gifts)`: Sums return gift prices.
7. **SVG Geometry**: Trigonometric math for custom SVG donut and arc slices (`polarToCartesian`, `createArcPath`, `computePieSlices`).

---

### 4.2. Centralized Stylesheet Architecture (`src/scss/_app-components.scss`)
- **Rule**: **Do NOT place `<style scoped>` blocks inside Vue component files (`.vue`).**
- **Rationale**:
  - Centralizing styles avoids CSS fragmentation, prevents style duplication, and ensures consistent cross-component theming (light/dark mode compatibility).
  - All component-specific styling, hover states, scrollbar hides (`.no-scrollbar`), card borders (`.card-hover-border`), and transitions must reside in `src/scss/_app-components.scss`.

---

### 4.3. Typography & Font Uniformity
- **Rule**: **Public Sans is the mandatory font across the entire application.**
- **Enforcement**:
  - Font weights 400, 500, 600, and 700 are imported in `src/main.ts`.
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

### 4.4. State Management & Data Persistence Pattern
- Each domain has a dedicated Pinia store in `src/stores/`.
- Stores follow the dual-persistence model:
  1. **Primary Persistence**: Supabase Edge Function via `edgeCrud` in `src/lib/supabase.ts`.
  2. **Fallback Persistence**: `localStorage` cache with a dedicated storage key (e.g. `guests_store_v1`, `expenses_store_v1`).
- Mutations update local reactive state immediately (optimistic UI), persist to `localStorage`, and asynchronously sync with Supabase.

---

### 4.5. Windows Command Execution
- On Windows systems with restricted PowerShell execution policies for `.ps1` scripts, run npm scripts using `cmd.exe /c`:
  ```powershell
  cmd.exe /c npm run build-only
  cmd.exe /c npm run dev
  ```

---

## 5. Domain Data Models Reference

### 5.1. Guest Item (`GuestItem`)
```typescript
interface GuestItem {
  id: string
  name: string
  phone?: string
  email?: string
  group: string // "Groom's Family" | "Bride's Family" | "College Friends" | "VIP" | etc.
  tags: string[] // e.g. ["Brother Marriage", "VIP", "Outstation"]
  rsvpStatus: 'confirmed' | 'pending' | 'declined'
  additionalGuests: number // Extra persons (e.g., 2 means guest + 2 = party of 3)
  accompanyingPersons: AccompanyingPerson[] // [{ name: string, relation: string }]
  returnGifts: ReturnGift[] // [{ name: string, price: number }]
  notes?: string
  createdAt: string
}
```

### 5.2. Return Gift (`ReturnGift`)
```typescript
interface ReturnGift {
  name: string
  price: number
}
```

### 5.3. Expense Item (`ExpenseItem`)
```typescript
interface ExpenseItem {
  id: string
  title: string
  amount: number
  category: ExpenseCategory
  date: string
  paidBy: string // Family member name
  tags: string[]
  notes?: string
  createdAt: string
}
```

### 5.4. Family Member (`FamilyMember`)
```typescript
interface FamilyMember {
  id: string
  name: string
  relation: string
  budget: number
  avatar?: string
  color: string
}
```

---

## 6. Quick Checklist for Adding New Features
1. **Types**: Define new interfaces in `src/types/index.ts`.
2. **Business Logic**: Add pure calculation/formatting/cleaning functions in `src/services/service.js` and types in `src/services/service.d.ts`.
3. **Store**: Add state, getters, and CRUD actions in `src/stores/`.
4. **Styles**: Add CSS rules in `src/scss/_app-components.scss` (never scoped in `.vue`).
5. **Component**: Consume store and service helpers using `<script setup lang="ts">`.
6. **Build Verification**: Validate with `cmd.exe /c npm run build-only` ensuring 0 compilation errors.
