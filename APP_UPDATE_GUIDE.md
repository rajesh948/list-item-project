# CaterHub App Update Release Guide

This guide explains how to release a new version of the CaterHub app and notify users about updates.

---

## Prerequisites

- Android Studio installed
- Access to Google Drive (for APK hosting)
- Admin access to CaterHub app

---

## Step-by-Step Update Process

### Step 1: Make Code Changes

1. Make your code changes/fixes
2. Test locally:
   ```bash
   npm run dev
   ```
3. Verify everything works at `http://localhost:3000`

---

### Step 2: Update Version Numbers

**IMPORTANT:** Update version in these 2 files BEFORE building:

#### File 1: `android/app/build.gradle`

Find the `defaultConfig` section and update `versionCode` and `versionName`:

```gradle
defaultConfig {
    applicationId "com.caterhub.mobile"
    minSdkVersion 22
    targetSdkVersion 34
    versionCode 2              // Increment this (1 → 2 → 3...)
    versionName "1.0.1"        // Update version (1.0.0 → 1.0.1 → 1.0.2...)
}
```

#### File 2: `composables/useAppUpdate.ts`

Find and update the `APP_VERSION` constant:

```typescript
// Current app version (update this when releasing new versions)
const APP_VERSION = '1.0.1';  // Match with versionName in build.gradle
```

---

### Step 3: Build the APK

Run these commands in order:

```bash
# 1. Generate the web build
npm run generate

# 2. Sync with Android (copies web files to Android project)
npx cap sync android

# 3. Open Android Studio
npx cap open android
```

In Android Studio:
1. Wait for Gradle sync to complete
2. Go to **Build** menu → **Build Bundle(s) / APK(s)** → **Build APK(s)**
3. Wait for build to complete
4. Click **"locate"** in the notification to find the APK

APK location: `android/app/build/outputs/apk/debug/app-debug.apk`

---

### Step 4: Upload APK to Google Drive

1. Go to [Google Drive](https://drive.google.com)
2. Upload the new APK file (or replace existing one)
3. Right-click → **Share** → **Anyone with the link**
4. Copy the sharing link

**Convert to Direct Download Link:**

If link is:
```
https://drive.google.com/file/d/FILE_ID/view?usp=sharing
```

Convert to:
```
https://drive.google.com/uc?export=download&id=FILE_ID
```

---

### Step 5: Update Landing Page (If APK Link Changed)

If you uploaded a new file (different link), update the landing page:

Edit `landing/index.html` and find the download button:

```html
<a href="https://drive.google.com/uc?export=download&id=YOUR_NEW_FILE_ID" class="download-btn primary">
```

Then redeploy:

```bash
cd landing
firebase deploy --only hosting:caterhub
```

---

### Step 6: Update Version in Admin Panel

1. Open the app and go to **Admin** → **Settings**
2. Scroll to **"App Version Management"** section
3. Update the fields:

| Field | Description | Example |
|-------|-------------|---------|
| **Latest Version** | New version number | `1.0.1` |
| **Min Required Version** | Minimum version users must have (for force update) | `1.0.0` |
| **Update URL** | Landing page URL | `https://caterhub.web.app` |
| **Release Notes** | What's new in this version | `Bug fixes and new features` |

4. Click **"Update Version Info"**

---

### Step 7: Verify Update Flow

1. Install the OLD APK on a test device
2. Open the app
3. You should see the update modal with:
   - Current version vs Latest version
   - Release notes
   - "Update Now" button
4. Click "Update Now" → should open landing page
5. Download and install new APK

---

## Version Numbering Guide

Use semantic versioning: `MAJOR.MINOR.PATCH`

| Change Type | Example | When to Use |
|-------------|---------|-------------|
| **PATCH** | 1.0.0 → 1.0.1 | Bug fixes, small changes |
| **MINOR** | 1.0.0 → 1.1.0 | New features, improvements |
| **MAJOR** | 1.0.0 → 2.0.0 | Breaking changes, major redesign |

---

## Force Update vs Optional Update

### Optional Update (Default)
- User sees update modal with "Later" option
- They can skip and continue using the app
- Set **Min Required Version** lower than **Latest Version**

### Force Update
- User MUST update to continue
- "Later" button is disabled
- Set **Min Required Version** = **Latest Version**

Example:
- Latest Version: `1.0.2`
- Min Required Version: `1.0.2` ← Forces all users to update

---

## Quick Reference Commands

```bash
# Full build process
npm run generate && npx cap sync android && npx cap open android

# Deploy landing page
cd landing && firebase deploy --only hosting:caterhub

# Check current version in code
grep -r "APP_VERSION" composables/useAppUpdate.ts
grep -r "versionName" android/app/build.gradle
```

---

## Troubleshooting

### Build fails in Android Studio
```bash
# Clean and rebuild
cd android
./gradlew clean
cd ..
npx cap sync android
```

### Users not seeing update
1. Check Firestore `appConfig/version` document has correct values
2. Verify user's app version is lower than `latestVersion`
3. Check internet connectivity

### APK download not working
1. Verify Google Drive link is set to "Anyone with the link"
2. Test the direct download link in browser
3. Check landing page has correct link

---

## Files Reference

| File | Purpose |
|------|---------|
| `composables/useAppUpdate.ts` | Update checking logic, APP_VERSION constant |
| `components/UpdateModal.vue` | Update prompt UI |
| `android/app/build.gradle` | Android version config |
| `landing/index.html` | Landing page with download button |
| `landing/firebase.json` | Firebase hosting config |

---

## Checklist for Each Release

- [ ] Code changes tested locally
- [ ] Version updated in `build.gradle`
- [ ] Version updated in `useAppUpdate.ts`
- [ ] `npm run generate` completed
- [ ] `npx cap sync android` completed
- [ ] APK built in Android Studio
- [ ] APK uploaded to Google Drive
- [ ] Landing page updated (if link changed)
- [ ] Admin panel version info updated
- [ ] Update flow tested on device
