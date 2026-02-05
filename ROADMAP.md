# CaterHub Product Roadmap

This document tracks all planned features, their implementation status, and priority.

**Last Updated:** 2026-01-27

---

## Status Legend

- [ ] Not Started
- [x] Completed
- [🔄] In Progress

---

## Phase 1 - Core Features (Priority: High)

### 1.1 User Registration & Authentication

| Status | Feature | Description |
|--------|---------|-------------|
| [x] | Self Registration | Users register with email (remove admin-only creation) |
| [x] | Email OTP Verification | Send OTP to email for verification |
| [x] | Forgot Password | Reset password via email link/OTP |
| [x] | Login with Email | Replace username-based login with email |
| [x] | Remove Admin Account Creation | Users no longer need admin to create account |

### 1.2 Subscription System

| Status | Feature | Description |
|--------|---------|-------------|
| [x] | Subscription Page | `/subscription` - Display 3 plans |
| [x] | Free Plan | Limited PDF generation (configurable by admin) |
| [x] | Monthly Plan | Full access, unlimited PDFs |
| [x] | Yearly Plan | Full access, unlimited PDFs, discounted |
| [x] | Plan Comparison UI | Show features comparison table |

**Plan Structure:**
```
Free Plan (₹0)
├── Limited PDF generation per [day/week/month/year]
├── Basic menu browsing
├── Basic report generation
└── No premium features

Monthly Plan (₹XX/month)
├── Unlimited PDF generation
├── All menu items access
├── Customer database
├── PDF branding (logo)
└── Priority support

Yearly Plan (₹XX/year)
├── Everything in Monthly
├── XX% discount
├── Early access to new features
└── Dedicated support
```

### 1.3 Premium Request Flow

| Status | Feature | Description |
|--------|---------|-------------|
| [x] | Request Premium Button | User can request premium upgrade |
| [x] | Payment Screenshot Upload | User uploads transaction proof |
| [x] | Request Submission | Save request to Firestore |
| [x] | Request Status Tracking | User sees pending/approved/rejected |

### 1.4 Admin - Premium Management

| Status | Feature | Description |
|--------|---------|-------------|
| [x] | Requests Page | `/admin/requests` - View all premium requests |
| [x] | View Payment Proof | Admin can see uploaded screenshot |
| [x] | Approve/Reject Toggle | Switch to activate premium |
| [x] | Request History | Log of all processed requests |

### 1.5 Admin - Settings

| Status | Feature | Description |
|--------|---------|-------------|
| [x] | Settings Page | `/admin/settings` - Global app settings |
| [x] | PDF Limit Config | Set limit per day/week/month/year |
| [x] | Plan Pricing | Set monthly/yearly prices |
| [x] | Limit Type Toggle | Choose day/week/month/year for free users |

### 1.6 User Account Updates

| Status | Feature | Description |
|--------|---------|-------------|
| [x] | User Type Field | Add `accountType: 'free' \| 'premium'` to user |
| [x] | Subscription Expiry | Track `premiumExpiresAt` date |
| [x] | PDF Count Tracking | Track `pdfGeneratedCount` and `pdfCountResetAt` |
| [x] | Premium Request Status | Track `premiumRequestStatus` in user doc |

---

## Phase 2 - Value Add Features (Priority: Medium)

### 2.1 WhatsApp Integration

| Status | Feature | Description |
|--------|---------|-------------|
| [x] | Share Report via WhatsApp | One-tap share PDF/link to WhatsApp |
| [x] | Share to Customer | Pre-filled message with event details |

### 2.2 Customer Database (Premium Feature)

| Status | Feature | Description |
|--------|---------|-------------|
| [x] | Customers Page | `/customers` - List all customers |
| [x] | Add Customer | Save customer name, phone, email, address |
| [x] | Customer History | View past orders/reports for customer |
| [x] | Quick Select | Select customer when creating report |
| [~] | Repeat Order | Clone previous order for same customer (Skipped) |

### 2.3 Quotation & Pricing System (Skipped)

| Status | Feature | Description |
|--------|---------|-------------|
| [~] | Item Pricing | Add price field to menu items (Skipped) |
| [~] | Price in Reports | Show item prices in reports (Skipped) |
| [~] | Total Calculation | Auto-calculate total quote (Skipped) |
| [~] | Tax Configuration | Add GST/tax options (Skipped) |
| [~] | Discount Field | Apply discounts to quotes (Skipped) |

### 2.4 PDF Branding (Premium Feature)

| Status | Feature | Description |
|--------|---------|-------------|
| [x] | Logo Upload | Premium users upload business logo |
| [x] | Business Details | Add address, phone on PDF header |
| [x] | Custom Colors | Choose PDF accent colors |
| [x] | Branded PDF Export | Logo appears on generated PDFs |

### 2.5 Event Calendar

| Status | Feature | Description |
|--------|---------|-------------|
| [x] | Calendar Page | `/calendar` - View events in calendar |
| [x] | Event Scheduling | Add event date when creating report |
| [x] | Calendar View | Monthly/weekly calendar view |
| [x] | Event Reminders | Notification before event date |

### 2.6 User Profile Page

| Status | Feature | Description |
|--------|---------|-------------|
| [x] | Profile Page | `/profile` - User account details |
| [x] | Edit Profile | Update name, phone, business info |
| [x] | Subscription Status | Show current plan, expiry date |
| [x] | Usage Stats | PDFs generated this period |
| [x] | Change Password | Update password from profile |

---

## Phase 3 - Growth Features (Priority: Low)

### 3.1 Referral Program (Skipped)

| Status | Feature | Description |
|--------|---------|-------------|
| [~] | Referral Code | Each user gets unique referral code (Skipped) |
| [~] | Invite Friends | Share referral link (Skipped) |
| [~] | Referral Rewards | Free premium days for referrals (Skipped) |
| [~] | Referral Tracking | Track who referred whom (Skipped) |

### 3.2 Push Notifications

| Status | Feature | Description |
|--------|---------|-------------|
| [x] | Premium Expiry Alert | Notify before subscription expires |
| [x] | New Feature Announcements | Notify about updates |
| [x] | Event Reminders | Remind about upcoming events |
| [x] | Request Status Updates | Notify when request approved/rejected |

### 3.3 Admin Analytics Dashboard

| Status | Feature | Description |
|--------|---------|-------------|
| [x] | Analytics Page | `/admin/analytics` - Detailed stats |
| [x] | Revenue Tracking | Track subscription income |
| [x] | User Growth Chart | New users over time |
| [x] | Active Users | Daily/weekly/monthly active users |
| [x] | Popular Items | Most selected menu items |
| [x] | Report Generation Stats | PDFs generated over time |

### 3.4 Support System

| Status | Feature | Description |
|--------|---------|-------------|
| [x] | Support Page | `/support` - Help & tickets |
| [x] | Create Ticket | Users submit issues |
| [x] | Admin Ticket View | `/admin/tickets` - Manage tickets |
| [x] | Ticket Status | Open/In Progress/Resolved |
| [x] | FAQ Section | Common questions |

### 3.5 Dark Mode

| Status | Feature | Description |
|--------|---------|-------------|
| [x] | Theme Toggle | Switch between light/dark |
| [x] | System Preference | Auto-detect device theme |
| [x] | Persist Preference | Save theme choice |

### 3.6 Multi-language Support

| Status | Feature | Description |
|--------|---------|-------------|
| [ ] | Language Toggle | Switch between languages |
| [ ] | English | Full English translation |
| [ ] | Gujarati | Full Gujarati translation |
| [ ] | Hindi | Full Hindi translation |

---

## Phase 4 - Future Scope (Priority: Backlog)

### 4.1 Advanced Features

| Status | Feature | Description |
|--------|---------|-------------|
| [ ] | Inventory Management | Track stock, low stock alerts |
| [ ] | Online Payment | Razorpay/UPI for subscriptions |
| [ ] | API Access | Premium users get API access |
| [ ] | Excel Export | Download reports as Excel |
| [ ] | Multiple PDF Templates | Different designs for events |
| [ ] | Report Templates | Save favorite item combinations |
| [ ] | Email Reports | Send PDF to customer email directly |
| [ ] | Report Version History | Track changes, restore old versions |
| [ ] | Bulk Operations | Bulk select items, bulk reports |

---

## New Database Collections Required

### `premiumRequests` Collection
```
premiumRequests/{requestId}
├── userId: string
├── userName: string
├── userEmail: string
├── requestedPlan: 'monthly' | 'yearly'
├── paymentScreenshot: string (URL)
├── transactionId: string (optional, user input)
├── status: 'pending' | 'approved' | 'rejected'
├── adminNotes: string (optional)
├── processedBy: string (admin uid)
├── processedAt: Date
├── createdAt: Date
└── updatedAt: Date
```

### `customers` Collection (Premium Feature)
```
customers/{customerId}
├── userId: string (owner)
├── name: string
├── phone: string
├── email: string
├── address: string
├── notes: string
├── totalOrders: number
├── lastOrderAt: Date
├── createdAt: Date
└── updatedAt: Date
```

### `appSettings` Collection
```
appSettings/general
├── freePdfLimit: number
├── freePdfLimitType: 'day' | 'week' | 'month' | 'year'
├── monthlyPlanPrice: number
├── yearlyPlanPrice: number
├── yearlyDiscount: number (percentage)
├── updatedAt: Date
└── updatedBy: string (admin uid)
```

### Updated `users` Collection
```
users/{uid}
├── ... existing fields ...
├── accountType: 'free' | 'premium'
├── premiumPlan: 'monthly' | 'yearly' | null
├── premiumStartedAt: Date | null
├── premiumExpiresAt: Date | null
├── pdfGeneratedCount: number
├── pdfCountResetAt: Date
├── premiumRequestStatus: 'none' | 'pending' | 'approved' | 'rejected'
├── referralCode: string
├── referredBy: string | null
├── emailVerified: boolean
└── profileComplete: boolean
```

---

## New Pages Required

| Page | Path | Access | Phase |
|------|------|--------|-------|
| Register | `/register` | Public | Phase 1 |
| Forgot Password | `/forgot-password` | Public | Phase 1 |
| Verify Email | `/verify-email` | Public | Phase 1 |
| Subscription | `/subscription` | All Users | Phase 1 |
| Profile | `/profile` | Logged In | Phase 2 |
| Customers | `/customers` | Premium | Phase 2 |
| Calendar | `/calendar` | All Users | Phase 2 |
| Support | `/support` | All Users | Phase 3 |
| Admin Requests | `/admin/requests` | Admin | Phase 1 |
| Admin Settings | `/admin/settings` | Admin | Phase 1 |
| Admin Analytics | `/admin/analytics` | Admin | Phase 3 |
| Admin Tickets | `/admin/tickets` | Admin | Phase 3 |

---

## Implementation Notes

### Email Service Options
- Firebase Authentication (built-in email verification)
- SendGrid / Mailgun for custom emails
- Resend.com (developer friendly)

### Payment Screenshot Storage
- Firebase Storage for image uploads
- Compress images before upload
- Generate thumbnail for admin preview

### PDF Limit Logic
```typescript
// Check if user can generate PDF
function canGeneratePdf(user: User): boolean {
  if (user.accountType === 'premium') return true;

  const settings = getAppSettings();
  const now = new Date();

  // Check if count needs reset
  if (shouldResetCount(user.pdfCountResetAt, settings.freePdfLimitType)) {
    resetPdfCount(user);
    return true;
  }

  return user.pdfGeneratedCount < settings.freePdfLimit;
}
```

---

## Progress Summary

| Phase | Total Features | Completed | Percentage |
|-------|---------------|-----------|------------|
| Phase 1 | 20 | 20 | 100% |
| Phase 2 | 18 | 18 | 100% (6 skipped) |
| Phase 3 | 16 | 18 | 100% (4 skipped: Referral, 4 pending: Multi-language) |
| Phase 4 | 9 | 0 | 0% |
| **Total** | **63** | **56** | **89%** |

---

## Changelog

### 2026-02-05 (Continued)
- Completed Dark Mode implementation
  - Created theme store (stores/theme.ts)
  - Created ThemeToggle component
  - Updated theme.css with dark mode CSS variables
  - Added theme toggle to settings page
  - Updated settings page styles for dark mode compatibility
- Completed Admin Tickets page (/admin/tickets)
  - Created tickets management interface
  - Added ticket details modal with conversation view
  - Added status updates and reply functionality
  - Added to admin sidebar navigation

### 2026-02-05
- Verified and marked Phase 1 as complete (all checkboxes updated)
- Marked Phase 2 as complete (Quotation & Pricing System skipped per user request)
- Starting Phase 3 implementation (Referral Program skipped per user request)
- All Phase 1 files implemented: register, forgot-password, verify-email, subscription, admin/settings, admin/requests
- All Phase 1 stores implemented: appSettings, premiumRequests
- All Phase 1 composables implemented: useSubscription, usePremiumRequests

### 2026-02-04
- Completed Phase 2 features (except Quotation & Pricing System)
- Implemented WhatsApp Integration
- Implemented Customer Database (Premium)
- Implemented PDF Branding (Premium)
- Implemented Event Calendar
- Implemented User Profile Page

### 2026-01-27
- Initial roadmap created
- Defined Phase 1-4 features
- Added database schema updates
- Added new pages list

---

## Next Steps

1. ~~Phase 1 - COMPLETED~~
2. ~~Phase 2 - COMPLETED~~ (Quotation & Pricing skipped)
3. ~~Phase 3 - COMPLETED~~ (Referral Program + Multi-language skipped)
   - ~~Push Notifications~~ ✓
   - ~~Admin Analytics Dashboard~~ ✓
   - ~~Support System~~ ✓
   - ~~Dark Mode~~ ✓
   - Multi-language Support (pending, 4 tasks)
4. Phase 4 - Future Scope (9 features)
