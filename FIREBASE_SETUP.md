# Firebase Setup Guide

This guide will help you set up Firebase for the Catering Management System with authentication and user management.

## Step 1: Create a Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click "Add project" or "Create a project"
3. Enter your project name (e.g., "Mahakali Caterers")
4. Disable Google Analytics (optional - you can enable it later)
5. Click "Create project"

## Step 2: Register Your Web App

1. In your Firebase project, click the Web icon (</>) to add a web app
2. Enter an app nickname (e.g., "Catering Web App")
3. Click "Register app"
4. Copy the Firebase configuration object - you'll need these values

## Step 3: Configure Firebase in Your Project

1. Open `plugins/firebase.client.ts`
2. Replace the placeholder values with your actual Firebase config:

```typescript
const firebaseConfig = {
  apiKey: "YOUR_ACTUAL_API_KEY",
  authDomain: "your-project-id.firebaseapp.com",
  projectId: "your-project-id",
  storageBucket: "your-project-id.appspot.com",
  messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
  appId: "YOUR_APP_ID"
};
```

## Step 4: Enable Authentication

1. In Firebase Console, go to "Build" → "Authentication"
2. Click "Get started"
3. Click on "Sign-in method" tab
4. Enable "Email/Password" provider
5. Click "Save"

## Step 5: Create Firestore Database

1. In Firebase Console, go to "Build" → "Firestore Database"
2. Click "Create database"
3. Choose "Start in production mode" (we'll add security rules later)
4. Select a location (choose closest to your users)
5. Click "Enable"

## Step 6: Set Up Firestore Security Rules

1. In Firestore Database, go to "Rules" tab
2. Replace the default rules with the updated rules from `firestore.rules` file:

**Option 1: Copy from firestore.rules file**
- Copy the entire content from `firestore.rules` in your project root
- Paste it into the Firebase Console Rules editor

**Option 2: Deploy using Firebase CLI**
```bash
firebase deploy --only firestore:rules
```

**Option 3: Manual Copy - Use these rules:**

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {

    // Helper function to check if user is authenticated
    function isAuthenticated() {
      return request.auth != null;
    }

    // Helper function to check if user is admin
    function isAdmin() {
      return isAuthenticated() &&
             get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin';
    }

    // Helper function to check if user owns the resource
    function isOwner(userId) {
      return isAuthenticated() && request.auth.uid == userId;
    }

    // Users collection rules
    match /users/{userId} {
      allow read: if isAuthenticated() && (isAdmin() || isOwner(userId));
      allow create: if isAdmin();
      allow update: if isAdmin() || isOwner(userId);
      allow delete: if isAdmin();
    }

    // Categories collection rules
    match /categories/{categoryId} {
      allow read: if isAuthenticated();
      allow write: if isAdmin();
    }

    // Saved Reports collection rules
    match /savedReports/{reportId} {
      allow read: if isAuthenticated() &&
                     (isAdmin() || resource.data.userId == request.auth.uid);
      allow create: if isAuthenticated() &&
                       request.resource.data.userId == request.auth.uid;
      allow update: if isAuthenticated() &&
                       (isAdmin() || resource.data.userId == request.auth.uid);
      allow delete: if isAuthenticated() &&
                       (isAdmin() || resource.data.userId == request.auth.uid);
    }
  }
}
```

3. Click "Publish"

**Important:** Make sure to publish the rules, or your app won't be able to save reports!

## Step 7: Create Admin Account

### Option 1: Using Firebase Console

1. Go to "Authentication" → "Users"
2. Click "Add user"
3. Enter email: `admin@mahakali.com` (or your preferred admin email)
4. Enter a secure password
5. Click "Add user"

### Option 2: Using the Login Page (After Setup)

1. Temporarily modify the security rules to allow user creation
2. Use the app's login page to create the admin account
3. Restore the security rules

## Step 8: Add Admin User to Firestore

1. Go to "Firestore Database"
2. Click "Start collection"
3. Collection ID: `users`
4. Click "Next"
5. Document ID: Use the UID from Authentication (copy from Authentication → Users)
6. Add fields:
   - `email` (string): `admin@mahakali.com`
   - `name` (string): `Admin`
   - `role` (string): `admin`
   - `isActive` (boolean): `true`
   - `createdAt` (timestamp): Click "Add field" → Select "timestamp" → Use server timestamp
7. Click "Save"

## Step 9: Test Your Setup

1. Run your development server: `npm run dev`
2. Navigate to `http://localhost:3000/login`
3. Login with admin credentials
4. You should be redirected to `/admin` dashboard
5. Try creating a new user from the admin panel

## Important Notes

### Admin Email

The admin email is hardcoded in `composables/useAuth.ts`:

```typescript
const ADMIN_EMAIL = 'admin@mahakali.com';
```

To change it, update this constant in the file.

### User Creation Limitation

The current implementation uses Firebase Client SDK to create users, which has a limitation: you'll be logged out when creating a new user. This is expected behavior.

**For production**, you should implement user creation using Firebase Admin SDK through a backend API. This would allow creating users without affecting the admin's session.

### Security

- Never commit your Firebase config with real credentials to a public repository
- Use environment variables for sensitive data in production
- Enable Firebase App Check for additional security
- Regularly review Firebase security rules

## Troubleshooting

### "Firebase: Error (auth/invalid-credential)"
- Check if email and password are correct
- Verify the user exists in Authentication

### "Missing or insufficient permissions"
- Check Firestore security rules
- Verify user document exists in `users` collection
- Ensure user has correct `role` field

### "Firebase: Error (auth/network-request-failed)"
- Check internet connection
- Verify Firebase config is correct
- Check if Firebase services are enabled

## Next Steps

After setup:
1. Create regular user accounts through admin panel
2. Test login with different user accounts
3. Configure additional Firebase features (Storage, etc.) if needed
4. Set up environment variables for production deployment

## Firestore Collections Structure

### users
```javascript
{
  uid: "firebase_auth_uid",
  email: "user@example.com",
  userName: "username",
  password: "stored_password", // For re-authentication
  role: "admin" | "user",
  isActive: true,
  businessName: "Business Name",
  phoneNumber: "Phone Number",
  createdAt: timestamp,
  updatedAt: timestamp
}
```

### categories
```javascript
{
  id: 1,
  name: "કોલ્ડ ડ્રિંક",
  items: [
    {
      id: 1,
      name: "Item Name"
    }
  ],
  createdAt: timestamp,
  updatedAt: timestamp
}
```

### savedReports
```javascript
{
  userId: "user_uid",
  userName: "username",
  reportData: {
    name: "Customer Name",
    address: "Customer Address",
    phone: "Phone Number",
    date: "Event Date",
    noOfPeople: "Number of People",
    shift: "Morning/Evening",
    price: "Price"
  },
  selectedCategories: [
    {
      id: 1,
      name: "Category Name",
      items: [
        {
          id: 1,
          name: "Item Name",
          categoryId: 1
        }
      ]
    }
  ],
  selectedTable: {
    id: 1,
    name: "Table Decoration Name"
  } | null,
  createdAt: timestamp,
  updatedAt: timestamp
}
```

## Support

If you encounter issues:
1. Check Firebase Console for error messages
2. Review browser console for errors
3. Verify all setup steps were completed
4. Check Firebase documentation: https://firebase.google.com/docs

---

Happy coding! 🚀
