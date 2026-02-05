# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Build Commands

```bash
npm run dev          # Start development server on localhost:3000
npm run build        # Build for production
npm run generate     # Generate static site
npm run preview      # Preview production build locally
npm run seed         # Seed Firestore data from useData composable
```

## Architecture Overview

**CaterHub** is a full-stack catering management application built with:
- **Nuxt 3** (SPA mode, SSR disabled)
- **Firebase** (Authentication + Firestore)
- **Ionic Vue** for cross-platform UI
- **Capacitor** for native iOS/Android builds
- **Pinia** for state management with caching

### Key Directories

- `pages/` - Nuxt auto-routing (index, login, admin/, create-report, reports, calendar, preview-report, customers, profile, subscription)
- `stores/` - Pinia stores with caching (user, users, categories, report, savedReports)
- `composables/` - Business logic (useAuth, useUsers, useDeviceSessions, useSavedReports, useData)
- `middleware/` - Route guards (numbered prefixes control execution order: 01-auth-init, 02-redirect-login, 03-redirect-admin-users)
- `plugins/` - Firebase and Ionic initialization

### Authentication Pattern

- Username-based login converted to email format: `username@caterhub.app`
- Firebase Auth handles authentication
- User document fetched from Firestore `users/` collection
- Role-based access: `admin` or `user`
- Device sessions tracked in `activeSessions/` collection

### State Management

Pinia stores implement caching with TTL:
- Categories: 5-minute cache
- Users: 5-minute cache
- Reports: 2-minute cache

localStorage persists working report data (selectedData, selectedTable, userData).

### Firestore Collections

```
users/{uid}           - User profiles (userName, email, role, isActive, businessName)
categories/{docId}    - Menu categories with nested items array
activeSessions/{id}   - Device login tracking
savedReports/{id}     - Persisted user reports
```

### Middleware Execution Order

Middleware files run in prefix order:
1. `01-auth-init.global.ts` - Wait for Firebase auth (3s timeout)
2. `02-redirect-login.global.ts` - Redirect unauthenticated to /login
3. `03-redirect-admin-users.global.ts` - Block non-admins from /admin routes

### Composables Access Pattern

```typescript
const { $auth, $db } = useNuxtApp(); // Access Firebase from plugins
```

### Mobile Build

Capacitor configured with:
- App ID: `com.caterhub.mobile`
- Web directory: `.output/public`
- PWA support enabled

## Important Patterns

- All Firestore writes should update `updatedAt` timestamp
- Admin operations require re-authentication (password stored in user doc)
- Menu items are Gujarati cuisine - `utils/transliterate.ts` for text handling
- Use existing Ionic components for UI consistency
