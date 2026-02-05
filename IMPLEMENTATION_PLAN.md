# CaterHub Phase 1 Implementation Plan

## Status: COMPLETE ✅
Last Updated: 2026-02-05

---

## Overview
Implement user self-registration, subscription system, and premium request flow for CaterHub.

## Decisions Made
- **Email Verification**: Firebase Email Link (no server setup)
- **Payment**: Manual screenshot upload with admin approval
- **Default Pricing**: Monthly ₹99, Yearly ₹999
- **PDF Limit**: Dynamic - admin configurable (count + period: day/week/month/year)

---

## Implementation Progress

### All Steps Completed ✅

| Step | Description | Status |
|------|-------------|--------|
| 1 | Add Firebase Storage to firebase.ts | ✅ Complete |
| 2 | Create stores/appSettings.ts | ✅ Complete |
| 3 | Update stores/user.ts with subscription fields | ✅ Complete |
| 4 | Create composables/useSubscription.ts | ✅ Complete |
| 5 | Update composables/useAuth.ts | ✅ Complete |
| 6 | Create pages/register.vue | ✅ Complete |
| 7 | Create pages/verify-email.vue | ✅ Complete |
| 8 | Create pages/forgot-password.vue | ✅ Complete |
| 9 | Update pages/login.vue | ✅ Complete |
| 10 | Create composables/usePremiumRequests.ts | ✅ Complete |
| 11 | Create stores/premiumRequests.ts | ✅ Complete |
| 12-13 | Create pages/subscription.vue with upgrade flow | ✅ Complete |
| 14 | Create pages/admin/settings.vue | ✅ Complete |
| 15 | Create pages/admin/requests.vue | ✅ Complete |
| 16 | Update pages/admin/index.vue | ✅ Complete |
| 17 | Update pages/item-report/index.vue with PDF limit check | ✅ Complete |
| 18 | Update firestore.rules | ✅ Complete |
| 19 | Update middleware for public routes | ✅ Complete |

---

## Database Schema Updates

### Update `users` Collection
```typescript
// Add new fields to existing user documents
{
  // Existing fields remain...
  uid: string;
  userName: string;
  email: string;
  role: 'admin' | 'user';
  isActive: boolean;
  businessName?: string;
  phoneNumber?: string;

  // NEW FIELDS
  emailVerified: boolean;           // Email verification status
  subscription: {
    plan: 'free' | 'monthly' | 'yearly';
    startDate: Timestamp | null;
    endDate: Timestamp | null;
    status: 'active' | 'expired' | 'pending';
  };
  pdfUsage: {
    count: number;                  // PDFs generated in current period
    periodStart: Timestamp;         // Start of current period
  };
  registrationSource: 'admin' | 'self';
}
```

### New `appSettings` Collection
```typescript
// Document ID: 'config'
{
  pdfLimits: {
    count: number;                  // e.g., 5
    period: 'day' | 'week' | 'month' | 'year';
  };
  pricing: {
    monthly: number;                // 99
    yearly: number;                 // 999
    currency: 'INR';
  };
  updatedAt: Timestamp;
  updatedBy: string;
}
```

### New `premiumRequests` Collection
```typescript
{
  userId: string;
  userName: string;
  userEmail: string;
  requestedPlan: 'monthly' | 'yearly';
  paymentScreenshotUrl: string;
  paymentScreenshotPath: string;
  transactionId?: string;           // Optional user input
  status: 'pending' | 'approved' | 'rejected';
  adminNotes?: string;
  createdAt: Timestamp;
  reviewedAt?: Timestamp;
  reviewedBy?: string;
}
```

---

## Detailed Implementation Steps

### Step 1: Firebase Storage Setup
**File:** `plugins/firebase.client.ts` and `firebase.ts`

Add Firebase Storage initialization:
```typescript
import { getStorage } from 'firebase/storage';

// Add after other initializations
const storage = getStorage(app);

// Export storage
export { storage }; // or provide via plugin
```

### Step 2: App Settings Store
**New File:** `stores/appSettings.ts`

```typescript
import { defineStore } from 'pinia';
import { doc, getDoc, setDoc, Timestamp } from 'firebase/firestore';
import { db } from '~/firebase';

export interface AppSettings {
  pdfLimits: {
    count: number;
    period: 'day' | 'week' | 'month' | 'year';
  };
  pricing: {
    monthly: number;
    yearly: number;
    currency: 'INR';
  };
  updatedAt: Timestamp | null;
  updatedBy: string | null;
}

const DEFAULT_SETTINGS: AppSettings = {
  pdfLimits: { count: 5, period: 'month' },
  pricing: { monthly: 99, yearly: 999, currency: 'INR' },
  updatedAt: null,
  updatedBy: null,
};

export const useAppSettingsStore = defineStore('appSettings', {
  state: () => ({
    settings: DEFAULT_SETTINGS as AppSettings,
    isLoading: false,
    lastFetched: null as Date | null,
  }),

  getters: {
    pdfLimit: (state) => state.settings.pdfLimits.count,
    limitPeriod: (state) => state.settings.pdfLimits.period,
    monthlyPrice: (state) => state.settings.pricing.monthly,
    yearlyPrice: (state) => state.settings.pricing.yearly,
  },

  actions: {
    async fetchSettings(force = false) {
      // Cache for 5 minutes
      if (!force && this.lastFetched) {
        const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
        if (this.lastFetched > fiveMinutesAgo) {
          return this.settings;
        }
      }

      this.isLoading = true;
      try {
        const docRef = doc(db, 'appSettings', 'config');
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          this.settings = docSnap.data() as AppSettings;
        }
        this.lastFetched = new Date();
        return this.settings;
      } finally {
        this.isLoading = false;
      }
    },

    async updateSettings(updates: Partial<AppSettings>, updatedBy: string) {
      const docRef = doc(db, 'appSettings', 'config');
      const newSettings = {
        ...this.settings,
        ...updates,
        updatedAt: Timestamp.now(),
        updatedBy,
      };
      await setDoc(docRef, newSettings);
      this.settings = newSettings;
      this.lastFetched = new Date();
    },
  },
});
```

### Step 3: Update User Store
**File:** `stores/user.ts`

Add new fields to UserData interface:
```typescript
export interface UserData {
  uid: string;
  username?: string;
  role: 'admin' | 'user';
  isActive: boolean;
  businessName?: string;
  phoneNumber?: string;
  // NEW FIELDS
  emailVerified?: boolean;
  subscription?: {
    plan: 'free' | 'monthly' | 'yearly';
    startDate: any;
    endDate: any;
    status: 'active' | 'expired' | 'pending';
  };
  pdfUsage?: {
    count: number;
    periodStart: any;
  };
  registrationSource?: 'admin' | 'self';
}
```

### Step 4: Subscription Composable
**New File:** `composables/useSubscription.ts`

```typescript
import { doc, getDoc, updateDoc, Timestamp } from 'firebase/firestore';
import { useUserStore } from '~/stores/user';
import { useAppSettingsStore } from '~/stores/appSettings';

export function useSubscription() {
  const { $db } = useNuxtApp();
  const userStore = useUserStore();
  const appSettingsStore = useAppSettingsStore();

  const isPremium = computed(() => {
    const sub = userStore.user?.subscription;
    if (!sub) return false;
    if (sub.plan === 'free') return false;
    if (sub.status !== 'active') return false;
    if (sub.endDate && sub.endDate.toDate() < new Date()) return false;
    return true;
  });

  const getPeriodStart = (period: string): Date => {
    const now = new Date();
    switch (period) {
      case 'day':
        return new Date(now.getFullYear(), now.getMonth(), now.getDate());
      case 'week':
        const dayOfWeek = now.getDay();
        return new Date(now.getFullYear(), now.getMonth(), now.getDate() - dayOfWeek);
      case 'month':
        return new Date(now.getFullYear(), now.getMonth(), 1);
      case 'year':
        return new Date(now.getFullYear(), 0, 1);
      default:
        return new Date(now.getFullYear(), now.getMonth(), 1);
    }
  };

  const canGeneratePdf = async (): Promise<boolean> => {
    if (isPremium.value) return true;

    await appSettingsStore.fetchSettings();
    const limit = appSettingsStore.pdfLimit;
    const period = appSettingsStore.limitPeriod;

    const pdfUsage = userStore.user?.pdfUsage;
    if (!pdfUsage) return true;

    const periodStart = getPeriodStart(period);
    const usagePeriodStart = pdfUsage.periodStart?.toDate?.() || new Date(0);

    // Reset if new period
    if (usagePeriodStart < periodStart) {
      return true;
    }

    return pdfUsage.count < limit;
  };

  const getRemainingPdfs = async (): Promise<number> => {
    if (isPremium.value) return -1; // Unlimited

    await appSettingsStore.fetchSettings();
    const limit = appSettingsStore.pdfLimit;
    const period = appSettingsStore.limitPeriod;

    const pdfUsage = userStore.user?.pdfUsage;
    if (!pdfUsage) return limit;

    const periodStart = getPeriodStart(period);
    const usagePeriodStart = pdfUsage.periodStart?.toDate?.() || new Date(0);

    if (usagePeriodStart < periodStart) {
      return limit;
    }

    return Math.max(0, limit - pdfUsage.count);
  };

  const incrementPdfCount = async (): Promise<void> => {
    if (!userStore.user?.uid) return;
    if (isPremium.value) return;

    await appSettingsStore.fetchSettings();
    const period = appSettingsStore.limitPeriod;
    const periodStart = getPeriodStart(period);

    const pdfUsage = userStore.user?.pdfUsage;
    const usagePeriodStart = pdfUsage?.periodStart?.toDate?.() || new Date(0);

    let newCount = 1;
    let newPeriodStart = Timestamp.fromDate(periodStart);

    if (usagePeriodStart >= periodStart) {
      newCount = (pdfUsage?.count || 0) + 1;
      newPeriodStart = pdfUsage?.periodStart || Timestamp.fromDate(periodStart);
    }

    const userRef = doc($db, 'users', userStore.user.uid);
    await updateDoc(userRef, {
      pdfUsage: {
        count: newCount,
        periodStart: newPeriodStart,
      },
    });
  };

  return {
    isPremium,
    canGeneratePdf,
    getRemainingPdfs,
    incrementPdfCount,
  };
}
```

### Step 5: Update useAuth Composable
**File:** `composables/useAuth.ts`

Add these new functions:
```typescript
import {
  createUserWithEmailAndPassword,
  sendEmailVerification,
  sendPasswordResetEmail,
  isSignInWithEmailLink,
  signInWithEmailLink,
} from 'firebase/auth';
import { doc, setDoc, Timestamp } from 'firebase/firestore';

// Add to useAuth function:

const registerWithEmail = async (email: string, password: string, businessName?: string, phoneNumber?: string) => {
  try {
    const userCredential = await createUserWithEmailAndPassword($auth, email, password);

    // Send verification email
    await sendEmailVerification(userCredential.user);

    // Create user document
    const userRef = doc($db, 'users', userCredential.user.uid);
    await setDoc(userRef, {
      uid: userCredential.user.uid,
      userName: email.split('@')[0],
      email: email,
      role: 'user',
      isActive: true,
      emailVerified: false,
      businessName: businessName || '',
      phoneNumber: phoneNumber || '',
      subscription: {
        plan: 'free',
        startDate: null,
        endDate: null,
        status: 'active',
      },
      pdfUsage: {
        count: 0,
        periodStart: Timestamp.now(),
      },
      registrationSource: 'self',
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    });

    return { success: true, message: 'Registration successful! Please check your email to verify your account.' };
  } catch (error: any) {
    let message = 'Registration failed. Please try again.';
    if (error.code === 'auth/email-already-in-use') {
      message = 'This email is already registered.';
    } else if (error.code === 'auth/weak-password') {
      message = 'Password should be at least 6 characters.';
    } else if (error.code === 'auth/invalid-email') {
      message = 'Please enter a valid email address.';
    }
    return { success: false, error: message };
  }
};

const requestPasswordReset = async (email: string) => {
  try {
    await sendPasswordResetEmail($auth, email);
    return { success: true, message: 'Password reset email sent! Check your inbox.' };
  } catch (error: any) {
    let message = 'Failed to send reset email.';
    if (error.code === 'auth/user-not-found') {
      message = 'No account found with this email.';
    }
    return { success: false, error: message };
  }
};

// Update login to support both username and email:
const login = async (identifier: string, password: string) => {
  try {
    // Check if it's an email or username
    let email = identifier;
    if (!identifier.includes('@')) {
      // Username login - use old format
      email = `${identifier}@caterhub.app`;
    }

    // ... rest of existing login logic
  } catch (error) {
    // ... existing error handling
  }
};
```

### Step 6: Registration Page
**New File:** `pages/register.vue`

Create a registration page with:
- Email input field
- Password + confirm password fields
- Business name (optional)
- Phone number (optional)
- Register button
- Link to login page
- Success message after registration

### Step 7: Verify Email Page
**New File:** `pages/verify-email.vue`

Handle Firebase email verification callback.

### Step 8: Forgot Password Page
**New File:** `pages/forgot-password.vue`

Simple form with email input and reset button.

### Step 9: Update Login Page
**File:** `pages/login.vue`

- Change label from "Username" to "Email or Username"
- Add "Create Account" link → /register
- Add "Forgot Password?" link → /forgot-password
- Update validation message

### Step 10: Premium Requests Composable
**New File:** `composables/usePremiumRequests.ts`

```typescript
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { collection, addDoc, query, where, getDocs, doc, updateDoc, Timestamp } from 'firebase/firestore';

export function usePremiumRequests() {
  const { $db, $storage } = useNuxtApp();

  const uploadPaymentScreenshot = async (file: File, userId: string): Promise<{ url: string; path: string }> => {
    const path = `payment-screenshots/${userId}/${Date.now()}_${file.name}`;
    const storageRef = ref($storage, path);
    await uploadBytes(storageRef, file);
    const url = await getDownloadURL(storageRef);
    return { url, path };
  };

  const submitPremiumRequest = async (
    userId: string,
    userName: string,
    userEmail: string,
    requestedPlan: 'monthly' | 'yearly',
    screenshotUrl: string,
    screenshotPath: string,
    transactionId?: string
  ) => {
    const requestData = {
      userId,
      userName,
      userEmail,
      requestedPlan,
      paymentScreenshotUrl: screenshotUrl,
      paymentScreenshotPath: screenshotPath,
      transactionId: transactionId || null,
      status: 'pending',
      createdAt: Timestamp.now(),
    };

    await addDoc(collection($db, 'premiumRequests'), requestData);
    return { success: true };
  };

  const fetchUserRequests = async (userId: string) => {
    const q = query(collection($db, 'premiumRequests'), where('userId', '==', userId));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  };

  const fetchAllRequests = async () => {
    const snapshot = await getDocs(collection($db, 'premiumRequests'));
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  };

  const approveRequest = async (requestId: string, adminId: string, userId: string, plan: 'monthly' | 'yearly') => {
    // Update request status
    const requestRef = doc($db, 'premiumRequests', requestId);
    await updateDoc(requestRef, {
      status: 'approved',
      reviewedAt: Timestamp.now(),
      reviewedBy: adminId,
    });

    // Calculate subscription dates
    const startDate = Timestamp.now();
    const endDate = plan === 'monthly'
      ? Timestamp.fromDate(new Date(Date.now() + 30 * 24 * 60 * 60 * 1000))
      : Timestamp.fromDate(new Date(Date.now() + 365 * 24 * 60 * 60 * 1000));

    // Update user subscription
    const userRef = doc($db, 'users', userId);
    await updateDoc(userRef, {
      subscription: {
        plan,
        startDate,
        endDate,
        status: 'active',
      },
      updatedAt: Timestamp.now(),
    });

    return { success: true };
  };

  const rejectRequest = async (requestId: string, adminId: string, notes?: string) => {
    const requestRef = doc($db, 'premiumRequests', requestId);
    await updateDoc(requestRef, {
      status: 'rejected',
      adminNotes: notes || null,
      reviewedAt: Timestamp.now(),
      reviewedBy: adminId,
    });
    return { success: true };
  };

  return {
    uploadPaymentScreenshot,
    submitPremiumRequest,
    fetchUserRequests,
    fetchAllRequests,
    approveRequest,
    rejectRequest,
  };
}
```

### Step 11: Premium Requests Store
**New File:** `stores/premiumRequests.ts`

Similar pattern to other stores with 2-minute cache.

### Step 12-13: Subscription Page
**New File:** `pages/subscription.vue`

- Display 3 plans (Free, Monthly ₹99, Yearly ₹999)
- Feature comparison table
- Current plan indicator
- Upgrade flow with payment screenshot upload

### Step 14: Admin Settings Page
**New File:** `pages/admin/settings.vue`

- PDF Limit configuration (count + period)
- Pricing configuration
- Save button

### Step 15: Admin Premium Requests Page
**New File:** `pages/admin/requests.vue`

- List pending/approved/rejected requests
- View payment screenshots
- Approve/Reject buttons

### Step 16: Update Admin Dashboard
**File:** `pages/admin/index.vue`

Add navigation cards for:
- Settings
- Premium Requests (with pending count badge)

### Step 17: PDF Limit Check
**File:** `pages/item-report/index.vue`

Before `getPDF` function generates PDF:
```typescript
const { canGeneratePdf, getRemainingPdfs, incrementPdfCount, isPremium } = useSubscription();

const getPDF = async () => {
  // Check PDF limit for free users
  const canGenerate = await canGeneratePdf();
  if (!canGenerate) {
    const remaining = await getRemainingPdfs();
    showToast(`PDF limit reached (${remaining} remaining). Upgrade to premium for unlimited PDFs.`, 'warning', 4000);
    // Optionally navigate to subscription page
    setTimeout(() => navigateTo('/subscription'), 2000);
    return;
  }

  // ... existing PDF generation code ...

  // After successful PDF generation, increment count
  await incrementPdfCount();
};
```

### Step 18: Update Firestore Rules
**File:** `firestore.rules`

Add:
```
// App Settings rules
match /appSettings/{docId} {
  allow read: if isAuthenticated();
  allow write: if isAdmin();
}

// Premium Requests rules
match /premiumRequests/{requestId} {
  allow read: if isAuthenticated() &&
    (isAdmin() || resource.data.userId == request.auth.uid);
  allow create: if isAuthenticated() &&
    request.resource.data.userId == request.auth.uid;
  allow update: if isAdmin();
  allow delete: if isAdmin();
}
```

### Step 19: Update Middleware
**File:** `middleware/02-redirect-login.global.ts`

Update public routes:
```typescript
const publicRoutes = ['/login', '/register', '/forgot-password', '/verify-email'];
```

---

## Files to Create

| File | Purpose |
|------|---------|
| `stores/appSettings.ts` | App settings with caching |
| `stores/premiumRequests.ts` | Premium requests store |
| `composables/useSubscription.ts` | PDF limits and subscription logic |
| `composables/usePremiumRequests.ts` | Premium request operations |
| `pages/register.vue` | User self-registration |
| `pages/forgot-password.vue` | Password reset |
| `pages/verify-email.vue` | Email link verification |
| `pages/subscription.vue` | Plans display and upgrade flow |
| `pages/admin/settings.vue` | Admin settings page |
| `pages/admin/requests.vue` | Admin premium requests |

## Files to Modify

| File | Changes |
|------|---------|
| `plugins/firebase.client.ts` | Add Storage export |
| `firebase.ts` | Add Storage export |
| `stores/user.ts` | Add subscription/pdfUsage fields |
| `composables/useAuth.ts` | Add register, password reset |
| `pages/login.vue` | Email input, add links |
| `pages/admin/index.vue` | Add settings/requests cards |
| `pages/item-report/index.vue` | PDF limit check |
| `firestore.rules` | New collection rules |
| `middleware/02-redirect-login.global.ts` | Public routes |

---

## Existing Code Patterns (Reference)

### Store Pattern (from categories.ts)
- 5-minute cache with lastFetched
- fetchX(force = false) pattern
- refreshX() calls fetchX(true)
- clearX() resets state

### Composable Pattern (from useAuth.ts)
- Access Firebase via `const { $auth, $db } = useNuxtApp()`
- Return object with functions and computed refs

### Page Pattern (from admin/users.vue)
- Use Ionic Vue components
- definePageMeta for middleware
- gradient-toolbar class for modal headers
- Consistent form styling with input-group, input-wrapper classes

### Firebase Plugin Pattern (from firebase.client.ts)
- Initialize in defineNuxtPlugin
- Provide via return { provide: { ... } }

---

## Resume Instructions

To resume implementation, tell Claude:
"Please continue implementing the CaterHub Phase 1 plan. Read IMPLEMENTATION_PLAN.md for context and continue from where we left off."

Claude will:
1. Read this file for full context
2. Check which steps are completed
3. Continue with the next pending step

---
---

# CaterHub Phase 2 Implementation Plan

## Status: MOSTLY COMPLETE (83%)
**Priority:** Medium
**Prerequisites:** Phase 1 Complete ✅

---

## Overview
Implement value-add features including WhatsApp integration, customer database, quotation system, PDF branding, event calendar, and user profile page.

---

## Implementation Steps

### Step 1: WhatsApp Integration

#### 1.1 Create WhatsApp Composable
**New File:** `composables/useWhatsApp.ts`

```typescript
export function useWhatsApp() {
  const shareToWhatsApp = (phone: string, message: string) => {
    // Format phone number (remove spaces, add country code if needed)
    const formattedPhone = phone.replace(/\s+/g, '').replace(/^0/, '91');
    const encodedMessage = encodeURIComponent(message);
    const url = `https://wa.me/${formattedPhone}?text=${encodedMessage}`;
    window.open(url, '_blank');
  };

  const shareReportToWhatsApp = (
    customerName: string,
    customerPhone: string,
    eventDate: string,
    businessName: string
  ) => {
    const message = `Hello ${customerName},

Thank you for choosing ${businessName}!

Your event details:
Date: ${eventDate}

We look forward to serving you.

Best regards,
${businessName}`;

    shareToWhatsApp(customerPhone, message);
  };

  const sharePdfLink = (pdfUrl: string, customerPhone: string) => {
    const message = `Here is your catering report: ${pdfUrl}`;
    shareToWhatsApp(customerPhone, message);
  };

  return {
    shareToWhatsApp,
    shareReportToWhatsApp,
    sharePdfLink,
  };
}
```

#### 1.2 Add WhatsApp Button to Item Report
**File:** `pages/item-report/index.vue`

Add a "Share via WhatsApp" button next to Generate PDF button.

---

### Step 2: Customer Database (Premium Feature)

#### 2.1 Database Schema
**New Collection:** `customers`

```typescript
// customers/{customerId}
{
  userId: string;           // Owner user ID
  name: string;
  phone: string;
  email?: string;
  address?: string;
  notes?: string;
  totalOrders: number;
  lastOrderAt: Timestamp | null;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}
```

#### 2.2 Customer Store
**New File:** `stores/customers.ts`

```typescript
import { defineStore } from 'pinia';
import { collection, query, where, getDocs, addDoc, updateDoc, deleteDoc, doc, Timestamp } from 'firebase/firestore';
import { db } from '~/firebase';

export interface Customer {
  id?: string;
  userId: string;
  name: string;
  phone: string;
  email?: string;
  address?: string;
  notes?: string;
  totalOrders: number;
  lastOrderAt: Timestamp | null;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export const useCustomersStore = defineStore('customers', {
  state: () => ({
    customers: [] as Customer[],
    isLoading: false,
    lastFetched: null as Date | null,
  }),

  getters: {
    allCustomers: (state) => state.customers,
    getCustomerById: (state) => (id: string) => state.customers.find(c => c.id === id),
    totalCustomers: (state) => state.customers.length,
  },

  actions: {
    async fetchCustomers(userId: string, force = false) {
      if (!force && this.customers.length > 0 && this.lastFetched) {
        const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
        if (this.lastFetched > fiveMinutesAgo) {
          return this.customers;
        }
      }

      this.isLoading = true;
      try {
        const q = query(collection(db, 'customers'), where('userId', '==', userId));
        const snapshot = await getDocs(q);
        this.customers = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Customer));
        this.lastFetched = new Date();
        return this.customers;
      } finally {
        this.isLoading = false;
      }
    },

    async addCustomer(customer: Omit<Customer, 'id' | 'createdAt' | 'updatedAt'>) {
      const docRef = await addDoc(collection(db, 'customers'), {
        ...customer,
        totalOrders: 0,
        lastOrderAt: null,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
      });
      return docRef.id;
    },

    async updateCustomer(id: string, updates: Partial<Customer>) {
      const docRef = doc(db, 'customers', id);
      await updateDoc(docRef, { ...updates, updatedAt: Timestamp.now() });
    },

    async deleteCustomer(id: string) {
      await deleteDoc(doc(db, 'customers', id));
      this.customers = this.customers.filter(c => c.id !== id);
    },

    async incrementOrderCount(id: string) {
      const customer = this.customers.find(c => c.id === id);
      if (customer) {
        await this.updateCustomer(id, {
          totalOrders: (customer.totalOrders || 0) + 1,
          lastOrderAt: Timestamp.now(),
        });
      }
    },
  },
});
```

#### 2.3 Customers Page
**New File:** `pages/customers.vue`

Features:
- List all customers with search/filter
- Add new customer modal
- Edit customer modal
- Delete customer with confirmation
- View customer order history
- Quick select for reports
- Premium-only access check

#### 2.4 Customer Composable
**New File:** `composables/useCustomers.ts`

```typescript
export function useCustomers() {
  const { $db } = useNuxtApp();
  const customersStore = useCustomersStore();
  const userStore = useUserStore();
  const { isPremium } = useSubscription();

  const canAccessCustomers = computed(() => isPremium.value);

  const getCustomerHistory = async (customerId: string) => {
    // Fetch saved reports for this customer
    const q = query(
      collection($db, 'savedReports'),
      where('userId', '==', userStore.user?.uid),
      where('customerId', '==', customerId)
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  };

  return {
    canAccessCustomers,
    getCustomerHistory,
  };
}
```

#### 2.5 Update Saved Reports Schema
Add `customerId` field to savedReports collection for linking reports to customers.

---

### Step 3: Quotation & Pricing System

#### 3.1 Update Categories Schema
Add price field to items:

```typescript
// In categories/{docId}
{
  // ... existing fields
  items: [
    {
      id: number;
      name: string;
      image: string | null;
      price?: number;        // NEW: Item price
      unit?: string;         // NEW: 'per plate', 'per kg', etc.
    }
  ]
}
```

#### 3.2 Create Pricing Composable
**New File:** `composables/usePricing.ts`

```typescript
export function usePricing() {
  const calculateTotal = (
    items: Array<{ price?: number; quantity?: number }>,
    taxRate: number = 0,
    discount: number = 0
  ) => {
    const subtotal = items.reduce((sum, item) => {
      return sum + (item.price || 0) * (item.quantity || 1);
    }, 0);

    const taxAmount = subtotal * (taxRate / 100);
    const discountAmount = subtotal * (discount / 100);
    const total = subtotal + taxAmount - discountAmount;

    return {
      subtotal,
      taxAmount,
      discountAmount,
      total,
    };
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  return {
    calculateTotal,
    formatCurrency,
  };
}
```

#### 3.3 Update Report Store
Add pricing fields to report data:

```typescript
// In stores/report.ts - add to userData
{
  // ... existing fields
  taxRate?: number;
  discount?: number;
  showPricing?: boolean;
}
```

#### 3.4 Update Event Details Page
**File:** `pages/event-details/index.vue`

Add optional fields:
- Tax rate input
- Discount percentage input
- Toggle to show/hide pricing in PDF

#### 3.5 Update PDF Template
**File:** `pages/item-report/index.vue`

Add pricing table to PDF section (conditional based on `showPricing`).

---

### Step 4: PDF Branding (Premium Feature)

#### 4.1 Update User Schema
Add branding fields:

```typescript
// In users/{uid}
{
  // ... existing fields
  branding?: {
    logoUrl?: string;
    logoPath?: string;
    primaryColor?: string;
    secondaryColor?: string;
    address?: string;
    tagline?: string;
  };
}
```

#### 4.2 Create Branding Composable
**New File:** `composables/useBranding.ts`

```typescript
import { ref as storageRef, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';

export function useBranding() {
  const { $storage, $db } = useNuxtApp();
  const userStore = useUserStore();

  const uploadLogo = async (file: File): Promise<{ url: string; path: string }> => {
    if (!userStore.user?.uid) throw new Error('Not authenticated');

    const path = `logos/${userStore.user.uid}/${Date.now()}_${file.name}`;
    const logoRef = storageRef($storage, path);

    // Compress image before upload (optional - use browser-image-compression)
    await uploadBytes(logoRef, file);
    const url = await getDownloadURL(logoRef);

    return { url, path };
  };

  const deleteLogo = async (path: string) => {
    const logoRef = storageRef($storage, path);
    await deleteObject(logoRef);
  };

  const updateBranding = async (branding: any) => {
    if (!userStore.user?.uid) return;

    const userRef = doc($db, 'users', userStore.user.uid);
    await updateDoc(userRef, {
      branding,
      updatedAt: Timestamp.now(),
    });
  };

  return {
    uploadLogo,
    deleteLogo,
    updateBranding,
  };
}
```

#### 4.3 Create Branding Settings Page
**New File:** `pages/settings/branding.vue`

Features:
- Logo upload with preview
- Color picker for primary/secondary colors
- Business address input
- Tagline input
- Preview of branded PDF header

#### 4.4 Update PDF Generation
**File:** `pages/item-report/index.vue`

Update PDF header to use branding settings:
- Show logo if available
- Use custom colors
- Show business address and tagline

---

### Step 5: Event Calendar

#### 5.1 Install Calendar Library
```bash
npm install @ionic/vue @fullcalendar/vue3 @fullcalendar/core @fullcalendar/daygrid
```

#### 5.2 Create Calendar Store
**New File:** `stores/calendar.ts`

```typescript
import { defineStore } from 'pinia';

export interface CalendarEvent {
  id: string;
  title: string;
  date: string;
  reportId?: string;
  customerId?: string;
  customerName?: string;
  notes?: string;
}

export const useCalendarStore = defineStore('calendar', {
  state: () => ({
    events: [] as CalendarEvent[],
    isLoading: false,
  }),

  actions: {
    async fetchEvents(userId: string, startDate: Date, endDate: Date) {
      // Fetch from savedReports collection based on event date
    },
  },
});
```

#### 5.3 Create Calendar Page
**New File:** `pages/calendar.vue`

Features:
- Monthly/weekly calendar view
- Events shown on their dates
- Click event to view report details
- Color-coded by status (upcoming, past, today)

#### 5.4 Update Saved Reports
Ensure saved reports have proper date fields for calendar integration.

---

### Step 6: User Profile Page

#### 6.1 Create Profile Page
**New File:** `pages/profile.vue`

Sections:
- Account Information
  - Display name
  - Email
  - Phone number
  - Business name
- Subscription Status
  - Current plan
  - Expiry date (if premium)
  - Upgrade button (if free)
- Usage Statistics
  - PDFs generated this period
  - Total reports saved
  - Total customers (if premium)
- Actions
  - Edit profile button
  - Change password
  - Logout

#### 6.2 Create Edit Profile Modal
Features:
- Update display name
- Update phone number
- Update business name
- Save button

#### 6.3 Create Change Password Component
**New File:** `components/ChangePassword.vue`

```typescript
// Use Firebase reauthenticateWithCredential and updatePassword
import {
  reauthenticateWithCredential,
  EmailAuthProvider,
  updatePassword
} from 'firebase/auth';

const changePassword = async (currentPassword: string, newPassword: string) => {
  const user = $auth.currentUser;
  if (!user || !user.email) throw new Error('Not authenticated');

  const credential = EmailAuthProvider.credential(user.email, currentPassword);
  await reauthenticateWithCredential(user, credential);
  await updatePassword(user, newPassword);
};
```

---

## Phase 2 - Files Summary

### New Files to Create

| File | Purpose |
|------|---------|
| `composables/useWhatsApp.ts` | WhatsApp sharing functionality |
| `composables/useCustomers.ts` | Customer management logic |
| `composables/usePricing.ts` | Pricing calculations |
| `composables/useBranding.ts` | PDF branding management |
| `stores/customers.ts` | Customer data store |
| `stores/calendar.ts` | Calendar events store |
| `pages/customers.vue` | Customer database page |
| `pages/calendar.vue` | Event calendar page |
| `pages/profile.vue` | User profile page |
| `pages/settings/branding.vue` | PDF branding settings |
| `components/ChangePassword.vue` | Password change component |

### Files to Modify

| File | Changes |
|------|---------|
| `pages/item-report/index.vue` | Add WhatsApp button, pricing table, branding |
| `pages/event-details/index.vue` | Add pricing fields |
| `stores/user.ts` | Add branding fields |
| `stores/report.ts` | Add pricing fields |
| `firestore.rules` | Add customers collection rules |

### New Database Collections

| Collection | Purpose |
|------------|---------|
| `customers` | Customer database (premium) |

---

## Phase 2 - Firestore Rules Update

```
// Customers collection rules
match /customers/{customerId} {
  allow read: if isAuthenticated() &&
    (isAdmin() || resource.data.userId == request.auth.uid);
  allow create: if isAuthenticated() &&
    request.resource.data.userId == request.auth.uid;
  allow update, delete: if isAuthenticated() &&
    resource.data.userId == request.auth.uid;
}
```

---
---

# CaterHub Phase 3 Implementation Plan

## Status: NOT STARTED
**Priority:** Low
**Prerequisites:** Phase 1 & 2 Complete

---

## Overview
Implement growth features including referral program, push notifications, admin analytics, support system, dark mode, and multi-language support.

---

## Implementation Steps

### Step 1: Referral Program

#### 1.1 Update User Schema
```typescript
// In users/{uid}
{
  // ... existing fields
  referralCode: string;           // Unique code for this user
  referredBy?: string;            // UID of referrer
  referralCount: number;          // Number of successful referrals
  referralRewards: {
    totalDaysEarned: number;
    lastRewardAt?: Timestamp;
  };
}
```

#### 1.2 New Collection: `referrals`
```typescript
// referrals/{referralId}
{
  referrerId: string;             // Who referred
  referredUserId: string;         // Who was referred
  referralCode: string;
  status: 'pending' | 'completed';
  rewardGiven: boolean;
  createdAt: Timestamp;
  completedAt?: Timestamp;
}
```

#### 1.3 Referral Composable
**New File:** `composables/useReferral.ts`

```typescript
export function useReferral() {
  const generateReferralCode = (userId: string): string => {
    // Generate unique code from userId + random string
    const random = Math.random().toString(36).substring(2, 6).toUpperCase();
    return `CH${userId.substring(0, 4).toUpperCase()}${random}`;
  };

  const applyReferralCode = async (code: string, newUserId: string) => {
    // Find referrer by code
    // Create referral record
    // Mark as pending until new user completes first action
  };

  const completeReferral = async (referralId: string) => {
    // Mark referral as completed
    // Add reward days to both users
  };

  const getReferralStats = async (userId: string) => {
    // Get referral count, pending referrals, rewards earned
  };

  return {
    generateReferralCode,
    applyReferralCode,
    completeReferral,
    getReferralStats,
  };
}
```

#### 1.4 Referral Page
**New File:** `pages/referral.vue`

Features:
- Display user's referral code
- Share referral link button
- Referral statistics
- List of referred users
- Rewards earned

---

### Step 2: Push Notifications

#### 2.1 Install Firebase Cloud Messaging
```bash
npm install firebase
# FCM is included in firebase package
```

#### 2.2 Create Notification Composable
**New File:** `composables/useNotifications.ts`

```typescript
import { getMessaging, getToken, onMessage } from 'firebase/messaging';

export function useNotifications() {
  const { $firebase } = useNuxtApp();

  const requestPermission = async () => {
    const permission = await Notification.requestPermission();
    if (permission === 'granted') {
      const messaging = getMessaging($firebase);
      const token = await getToken(messaging, {
        vapidKey: 'YOUR_VAPID_KEY'
      });
      return token;
    }
    return null;
  };

  const saveToken = async (userId: string, token: string) => {
    // Save FCM token to user document
  };

  const setupMessageListener = () => {
    const messaging = getMessaging($firebase);
    onMessage(messaging, (payload) => {
      // Handle foreground messages
      // Show toast or in-app notification
    });
  };

  return {
    requestPermission,
    saveToken,
    setupMessageListener,
  };
}
```

#### 2.3 Update User Schema
```typescript
// In users/{uid}
{
  // ... existing fields
  fcmTokens: string[];            // Array of FCM tokens (multiple devices)
  notificationPreferences: {
    premiumExpiry: boolean;
    newFeatures: boolean;
    eventReminders: boolean;
    requestUpdates: boolean;
  };
}
```

#### 2.4 Create Service Worker
**New File:** `public/firebase-messaging-sw.js`

```javascript
importScripts('https://www.gstatic.com/firebasejs/9.0.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/9.0.0/firebase-messaging-compat.js');

firebase.initializeApp({
  // Firebase config
});

const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
  const notificationTitle = payload.notification.title;
  const notificationOptions = {
    body: payload.notification.body,
    icon: '/icon.png'
  };
  self.registration.showNotification(notificationTitle, notificationOptions);
});
```

#### 2.5 Notification Settings Page
**New File:** `pages/settings/notifications.vue`

Features:
- Toggle for each notification type
- Test notification button
- Permission status indicator

---

### Step 3: Admin Analytics Dashboard

#### 3.1 Create Analytics Store
**New File:** `stores/analytics.ts`

```typescript
import { defineStore } from 'pinia';

export interface AnalyticsData {
  totalUsers: number;
  activeUsers: {
    daily: number;
    weekly: number;
    monthly: number;
  };
  revenue: {
    total: number;
    monthly: number;
    yearly: number;
  };
  subscriptions: {
    free: number;
    monthly: number;
    yearly: number;
  };
  pdfsGenerated: {
    today: number;
    thisWeek: number;
    thisMonth: number;
  };
  popularItems: Array<{ name: string; count: number }>;
  userGrowth: Array<{ date: string; count: number }>;
}

export const useAnalyticsStore = defineStore('analytics', {
  state: () => ({
    data: null as AnalyticsData | null,
    isLoading: false,
    lastFetched: null as Date | null,
  }),

  actions: {
    async fetchAnalytics() {
      // Aggregate data from various collections
      // This would ideally use Cloud Functions for complex aggregations
    },
  },
});
```

#### 3.2 Create Analytics Page
**New File:** `pages/admin/analytics.vue`

Sections:
- Overview cards (total users, revenue, PDFs)
- User growth chart (line chart)
- Subscription breakdown (pie chart)
- Revenue trend (bar chart)
- Popular menu items (list)
- Active users metrics

#### 3.3 Install Chart Library
```bash
npm install chart.js vue-chartjs
```

#### 3.4 Create Chart Components
**New Files:**
- `components/charts/LineChart.vue`
- `components/charts/PieChart.vue`
- `components/charts/BarChart.vue`

---

### Step 4: Support System

#### 4.1 New Collection: `tickets`
```typescript
// tickets/{ticketId}
{
  userId: string;
  userName: string;
  userEmail: string;
  subject: string;
  description: string;
  category: 'bug' | 'feature' | 'billing' | 'other';
  priority: 'low' | 'medium' | 'high';
  status: 'open' | 'in_progress' | 'resolved' | 'closed';
  assignedTo?: string;
  messages: Array<{
    senderId: string;
    senderName: string;
    message: string;
    timestamp: Timestamp;
    isAdmin: boolean;
  }>;
  createdAt: Timestamp;
  updatedAt: Timestamp;
  resolvedAt?: Timestamp;
}
```

#### 4.2 Support Composable
**New File:** `composables/useSupport.ts`

```typescript
export function useSupport() {
  const createTicket = async (data: {
    subject: string;
    description: string;
    category: string;
    priority: string;
  }) => {
    // Create new ticket
  };

  const addMessage = async (ticketId: string, message: string) => {
    // Add message to ticket
  };

  const getUserTickets = async (userId: string) => {
    // Get user's tickets
  };

  const getAllTickets = async () => {
    // Admin: get all tickets
  };

  const updateTicketStatus = async (ticketId: string, status: string) => {
    // Admin: update status
  };

  return {
    createTicket,
    addMessage,
    getUserTickets,
    getAllTickets,
    updateTicketStatus,
  };
}
```

#### 4.3 Support Page
**New File:** `pages/support.vue`

Features:
- Create new ticket form
- View my tickets list
- Ticket detail view with chat
- FAQ section

#### 4.4 Admin Tickets Page
**New File:** `pages/admin/tickets.vue`

Features:
- All tickets list with filters
- Ticket status management
- Reply to tickets
- Assign tickets
- Priority indicators

---

### Step 5: Dark Mode

#### 5.1 Create Theme Store
**New File:** `stores/theme.ts`

```typescript
import { defineStore } from 'pinia';

type ThemeMode = 'light' | 'dark' | 'system';

export const useThemeStore = defineStore('theme', {
  state: () => ({
    mode: 'system' as ThemeMode,
  }),

  getters: {
    isDark: (state) => {
      if (state.mode === 'system') {
        return window.matchMedia('(prefers-color-scheme: dark)').matches;
      }
      return state.mode === 'dark';
    },
  },

  actions: {
    setMode(mode: ThemeMode) {
      this.mode = mode;
      localStorage.setItem('theme-mode', mode);
      this.applyTheme();
    },

    initTheme() {
      const saved = localStorage.getItem('theme-mode') as ThemeMode;
      if (saved) {
        this.mode = saved;
      }
      this.applyTheme();

      // Listen for system preference changes
      window.matchMedia('(prefers-color-scheme: dark)')
        .addEventListener('change', () => {
          if (this.mode === 'system') {
            this.applyTheme();
          }
        });
    },

    applyTheme() {
      const isDark = this.isDark;
      document.documentElement.classList.toggle('dark', isDark);
      // For Ionic
      document.body.classList.toggle('dark', isDark);
    },
  },
});
```

#### 5.2 Update CSS Variables
**File:** `assets/css/theme.css`

```css
:root {
  --color-background: #ffffff;
  --color-surface: #f8f9fa;
  --color-text-primary: #333333;
  --color-text-secondary: #666666;
  --color-border: #e0e0e0;
  /* ... more variables */
}

.dark {
  --color-background: #1a1a1a;
  --color-surface: #2a2a2a;
  --color-text-primary: #ffffff;
  --color-text-secondary: #999999;
  --color-border: #444444;
  /* ... more variables */
}
```

#### 5.3 Theme Toggle Component
**New File:** `components/ThemeToggle.vue`

```vue
<template>
  <div class="theme-toggle">
    <ion-segment :value="themeStore.mode" @ionChange="onChange">
      <ion-segment-button value="light">
        <ion-icon :icon="sunnyOutline"></ion-icon>
      </ion-segment-button>
      <ion-segment-button value="system">
        <ion-icon :icon="phonePortraitOutline"></ion-icon>
      </ion-segment-button>
      <ion-segment-button value="dark">
        <ion-icon :icon="moonOutline"></ion-icon>
      </ion-segment-button>
    </ion-segment>
  </div>
</template>
```

#### 5.4 Add to Settings Page
Add theme toggle to user settings/profile page.

---

### Step 6: Multi-language Support

#### 6.1 Install i18n
```bash
npm install @nuxtjs/i18n
```

#### 6.2 Configure Nuxt i18n
**File:** `nuxt.config.ts`

```typescript
export default defineNuxtConfig({
  modules: ['@nuxtjs/i18n'],
  i18n: {
    locales: [
      { code: 'en', name: 'English', file: 'en.json' },
      { code: 'gu', name: 'ગુજરાતી', file: 'gu.json' },
      { code: 'hi', name: 'हिंदी', file: 'hi.json' },
    ],
    defaultLocale: 'en',
    lazy: true,
    langDir: 'locales/',
    strategy: 'no_prefix',
  },
});
```

#### 6.3 Create Language Files
**New Files:**
- `locales/en.json`
- `locales/gu.json`
- `locales/hi.json`

```json
// locales/en.json
{
  "common": {
    "save": "Save",
    "cancel": "Cancel",
    "delete": "Delete",
    "edit": "Edit",
    "loading": "Loading..."
  },
  "auth": {
    "login": "Login",
    "logout": "Logout",
    "register": "Register",
    "email": "Email",
    "password": "Password"
  },
  "subscription": {
    "free": "Free Plan",
    "monthly": "Monthly Plan",
    "yearly": "Yearly Plan",
    "upgrade": "Upgrade Now"
  }
  // ... more translations
}
```

#### 6.4 Language Selector Component
**New File:** `components/LanguageSelector.vue`

```vue
<template>
  <ion-select :value="$i18n.locale" @ionChange="changeLanguage">
    <ion-select-option v-for="locale in $i18n.locales" :key="locale.code" :value="locale.code">
      {{ locale.name }}
    </ion-select-option>
  </ion-select>
</template>

<script setup>
const { setLocale } = useI18n();

const changeLanguage = (event) => {
  setLocale(event.detail.value);
  localStorage.setItem('language', event.detail.value);
};
</script>
```

#### 6.5 Update All Pages
Replace hardcoded strings with `$t('key')` calls.

---

## Phase 3 - Files Summary

### New Files to Create

| File | Purpose |
|------|---------|
| `composables/useReferral.ts` | Referral program logic |
| `composables/useNotifications.ts` | Push notification handling |
| `composables/useSupport.ts` | Support ticket management |
| `stores/analytics.ts` | Analytics data store |
| `stores/theme.ts` | Theme/dark mode store |
| `pages/referral.vue` | Referral program page |
| `pages/support.vue` | Support/help page |
| `pages/admin/analytics.vue` | Admin analytics dashboard |
| `pages/admin/tickets.vue` | Admin ticket management |
| `pages/settings/notifications.vue` | Notification preferences |
| `components/ThemeToggle.vue` | Dark mode toggle |
| `components/LanguageSelector.vue` | Language switcher |
| `components/charts/*.vue` | Chart components |
| `locales/*.json` | Translation files |
| `public/firebase-messaging-sw.js` | FCM service worker |

### New Database Collections

| Collection | Purpose |
|------------|---------|
| `referrals` | Referral tracking |
| `tickets` | Support tickets |

---
---

# CaterHub Phase 4 Implementation Plan

## Status: NOT STARTED
**Priority:** Backlog
**Prerequisites:** Phase 1, 2 & 3 Complete

---

## Overview
Implement advanced features including inventory management, online payment integration, API access, Excel export, multiple PDF templates, and more.

---

## Implementation Steps

### Step 1: Inventory Management

#### 1.1 New Collection: `inventory`
```typescript
// inventory/{itemId}
{
  userId: string;                 // Admin user ID
  categoryId: string;
  itemName: string;
  currentStock: number;
  unit: 'kg' | 'pieces' | 'liters' | 'packs';
  minimumStock: number;           // Alert threshold
  costPerUnit: number;
  supplier?: string;
  lastRestockedAt?: Timestamp;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}
```

#### 1.2 New Collection: `stockTransactions`
```typescript
// stockTransactions/{transactionId}
{
  inventoryItemId: string;
  type: 'in' | 'out' | 'adjustment';
  quantity: number;
  reason?: string;
  reportId?: string;              // Link to report if stock was used
  performedBy: string;
  createdAt: Timestamp;
}
```

#### 1.3 Inventory Store
**New File:** `stores/inventory.ts`

#### 1.4 Inventory Page
**New File:** `pages/admin/inventory.vue`

Features:
- Stock levels overview
- Low stock alerts
- Add/remove stock
- Stock history
- Link to suppliers

---

### Step 2: Online Payment (Razorpay)

#### 2.1 Install Razorpay
```bash
npm install razorpay
```

#### 2.2 Create Payment Composable
**New File:** `composables/usePayment.ts`

```typescript
export function usePayment() {
  const createOrder = async (amount: number, plan: string) => {
    // Call backend API to create Razorpay order
    // Return order_id
  };

  const verifyPayment = async (
    razorpay_order_id: string,
    razorpay_payment_id: string,
    razorpay_signature: string
  ) => {
    // Verify payment with backend
    // Update user subscription on success
  };

  const initializeRazorpay = () => {
    return new Promise((resolve) => {
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const openPaymentModal = async (options: {
    amount: number;
    orderId: string;
    userEmail: string;
    userName: string;
  }) => {
    const res = await initializeRazorpay();
    if (!res) {
      throw new Error('Razorpay SDK failed to load');
    }

    const paymentOptions = {
      key: 'YOUR_RAZORPAY_KEY',
      amount: options.amount * 100, // In paise
      currency: 'INR',
      name: 'CaterHub',
      description: 'Premium Subscription',
      order_id: options.orderId,
      prefill: {
        email: options.userEmail,
        name: options.userName,
      },
      handler: async (response: any) => {
        await verifyPayment(
          response.razorpay_order_id,
          response.razorpay_payment_id,
          response.razorpay_signature
        );
      },
    };

    const paymentObject = new (window as any).Razorpay(paymentOptions);
    paymentObject.open();
  };

  return {
    createOrder,
    verifyPayment,
    openPaymentModal,
  };
}
```

#### 2.3 Backend API (Cloud Functions)
**New File:** `functions/src/payment.ts`

```typescript
// Firebase Cloud Functions for Razorpay
import * as functions from 'firebase-functions';
import Razorpay from 'razorpay';

const razorpay = new Razorpay({
  key_id: functions.config().razorpay.key_id,
  key_secret: functions.config().razorpay.key_secret,
});

export const createOrder = functions.https.onCall(async (data, context) => {
  // Create Razorpay order
});

export const verifyPayment = functions.https.onCall(async (data, context) => {
  // Verify signature and update subscription
});
```

#### 2.4 Update Subscription Page
Add "Pay Online" option alongside manual screenshot upload.

---

### Step 3: API Access (Premium Feature)

#### 3.1 New Collection: `apiKeys`
```typescript
// apiKeys/{keyId}
{
  userId: string;
  key: string;                    // Hashed API key
  name: string;                   // User-given name
  permissions: string[];          // ['read:reports', 'write:reports']
  lastUsedAt?: Timestamp;
  usageCount: number;
  rateLimit: number;              // Requests per hour
  isActive: boolean;
  createdAt: Timestamp;
  expiresAt?: Timestamp;
}
```

#### 3.2 API Key Management Page
**New File:** `pages/settings/api.vue`

Features:
- Generate API key
- View existing keys
- Revoke keys
- Usage statistics
- API documentation link

#### 3.3 API Endpoints (Cloud Functions)
**New Files:**
- `functions/src/api/reports.ts`
- `functions/src/api/categories.ts`
- `functions/src/api/customers.ts`

---

### Step 4: Excel Export

#### 4.1 Install Excel Library
```bash
npm install xlsx
```

#### 4.2 Create Export Composable
**New File:** `composables/useExport.ts`

```typescript
import * as XLSX from 'xlsx';

export function useExport() {
  const exportToExcel = (data: any[], filename: string) => {
    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Report');
    XLSX.writeFile(workbook, `${filename}.xlsx`);
  };

  const exportReportToExcel = (report: any) => {
    // Format report data for Excel
    const data = report.categories.flatMap((cat: any) =>
      cat.items.map((item: any) => ({
        Category: cat.name,
        Item: item.name,
        Price: item.price || '',
      }))
    );

    // Add header info
    const headerData = [
      { Category: 'Customer', Item: report.userData.name },
      { Category: 'Date', Item: report.userData.date },
      { Category: 'People', Item: report.userData.noOfPeople },
      { Category: '', Item: '' },
    ];

    exportToExcel([...headerData, ...data], `Report_${report.userData.name}`);
  };

  return {
    exportToExcel,
    exportReportToExcel,
  };
}
```

#### 4.3 Add Export Button
Add "Export to Excel" button on item-report page.

---

### Step 5: Multiple PDF Templates

#### 5.1 New Collection: `pdfTemplates`
```typescript
// pdfTemplates/{templateId}
{
  name: string;
  description: string;
  thumbnail: string;
  isDefault: boolean;
  isPremium: boolean;
  styles: {
    headerBackground: string;
    primaryColor: string;
    fontFamily: string;
    layout: 'classic' | 'modern' | 'minimal';
  };
  createdAt: Timestamp;
}
```

#### 5.2 Template Selector Component
**New File:** `components/PdfTemplateSelector.vue`

Features:
- Grid of template previews
- Premium badge on premium templates
- Select and apply template

#### 5.3 Update PDF Generation
Modify PDF generation to apply selected template styles.

---

### Step 6: Report Templates (Saved Combinations)

#### 6.1 New Collection: `reportTemplates`
```typescript
// reportTemplates/{templateId}
{
  userId: string;
  name: string;
  description?: string;
  categories: Array<{
    id: number;
    name: string;
    items: Array<{ id: number; name: string }>;
  }>;
  tableDecoration?: any;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}
```

#### 6.2 Report Templates Page
**New File:** `pages/templates.vue`

Features:
- Save current selection as template
- List saved templates
- Load template into report
- Edit/delete templates

---

### Step 7: Email Reports

#### 7.1 Create Email Composable
**New File:** `composables/useEmail.ts`

```typescript
export function useEmail() {
  const sendReportEmail = async (
    recipientEmail: string,
    recipientName: string,
    pdfBase64: string,
    reportDetails: any
  ) => {
    // Call Cloud Function to send email with PDF attachment
  };

  return {
    sendReportEmail,
  };
}
```

#### 7.2 Cloud Function for Email
**New File:** `functions/src/email.ts`

Use SendGrid or similar service to send emails with PDF attachments.

#### 7.3 Add Email Button
Add "Send via Email" button on item-report page.

---

### Step 8: Report Version History

#### 8.1 Update savedReports Schema
```typescript
// savedReports/{reportId}
{
  // ... existing fields
  versions: Array<{
    versionNumber: number;
    data: any;                    // Snapshot of report data
    createdAt: Timestamp;
    note?: string;
  }>;
  currentVersion: number;
}
```

#### 8.2 Version History Component
**New File:** `components/ReportVersionHistory.vue`

Features:
- View version list
- Compare versions
- Restore previous version
- Add version notes

---

### Step 9: Bulk Operations

#### 9.1 Create Bulk Operations Composable
**New File:** `composables/useBulkOperations.ts`

```typescript
export function useBulkOperations() {
  const bulkSelectItems = (categoryIds: number[], itemIds: number[]) => {
    // Select multiple items at once
  };

  const bulkGenerateReports = async (reports: any[]) => {
    // Generate multiple PDFs
  };

  const bulkExport = async (reportIds: string[]) => {
    // Export multiple reports to ZIP
  };

  return {
    bulkSelectItems,
    bulkGenerateReports,
    bulkExport,
  };
}
```

#### 9.2 Bulk Selection UI
Add checkbox selection mode to item selection pages.

---

## Phase 4 - Files Summary

### New Files to Create

| File | Purpose |
|------|---------|
| `stores/inventory.ts` | Inventory management store |
| `composables/usePayment.ts` | Online payment handling |
| `composables/useExport.ts` | Excel export functionality |
| `composables/useEmail.ts` | Email report sending |
| `composables/useBulkOperations.ts` | Bulk operations |
| `pages/admin/inventory.vue` | Inventory management page |
| `pages/settings/api.vue` | API key management |
| `pages/templates.vue` | Report templates page |
| `components/PdfTemplateSelector.vue` | PDF template selector |
| `components/ReportVersionHistory.vue` | Version history UI |
| `functions/src/payment.ts` | Payment Cloud Functions |
| `functions/src/email.ts` | Email Cloud Functions |
| `functions/src/api/*.ts` | API endpoints |

### New Database Collections

| Collection | Purpose |
|------------|---------|
| `inventory` | Stock management |
| `stockTransactions` | Stock movement history |
| `apiKeys` | API access management |
| `pdfTemplates` | PDF design templates |
| `reportTemplates` | Saved item combinations |

---
---

# Implementation Summary

## All Phases Overview

| Phase | Features | Priority | Status |
|-------|----------|----------|--------|
| Phase 1 | Registration, Subscription, Premium Requests | High | ✅ Complete |
| Phase 2 | WhatsApp, Customers, Pricing, Branding, Calendar, Profile | Medium | 83% Complete |
| Phase 3 | Referrals, Notifications, Analytics, Support, Dark Mode, i18n | Low | Not Started |
| Phase 4 | Inventory, Payment, API, Excel, Templates, Email, Bulk | Backlog | Not Started |

## Total Implementation Items

- **New Files:** 50+
- **Modified Files:** 20+
- **New Collections:** 10+
- **New Composables:** 15+
- **New Stores:** 8+
- **New Pages:** 15+

---

## Resume Instructions

To resume any phase, tell Claude:
```
Please continue implementing CaterHub Phase [X].
Read IMPLEMENTATION_PLAN.md for context and continue from where we left off.
```

Claude will:
1. Read this file for full context
2. Identify which phase to work on
3. Check completed steps
4. Continue with the next pending step
