# 🛡️ React Native Insurance Management App (Expo + Firebase)

A **React Native (Expo)** mobile application that enables users to **log in and manage insurance policies** for **Car, Van, Motorbike, and House**, with data stored securely in **Firebase Firestore**.  

Built with TypeScript, Redux Toolkit, and a modular architecture — designed for **clarity, scalability, reliability, and testability**.

---

## 🎥 Demo

🎬 **Video Walkthrough:** [Watch here](https://youtube.com/shorts/sfPQR5cbSQI?feature=share)

---

## ▶️ Running the App

1. **Install dependencies**
   ```bash
   npm install
   ```
2. **Prebuild the project** (required for native modules and Firebase setup)
   ```bash
   npx expo prebuild
   ```
3. **Start the development server**
   ```bash
   npx expo start --dev-client
   ```
4. **Open on device/simulator**
   - iOS Simulator ✅ (tested)
   - Android Emulator ⚠️ (configured but untested)

---

## 🧪 Testing

Run test suite:
```bash
npm run test
```


## 🚀 Features

### 🔐 Authentication
- Email & Password authentication using **Firebase Authentication**

### 🧾 Policy Management
- Create and **edit** insurance policies (for authenticated user)
- Fields: **Type**, **Provider**, **Policy Number**, **Start Date**, **End Date**, **Premium**
- Firestore-backed persistence with offline-read via local cache

### 🚗 Supported Insurance Types
- Car  
- Van  
- Motorbike  
- House

### 💾 Data & Offline
- **Firestore SDK** as the source of truth
- Local cache for offline access and seamless sync when online


## 🧱 Project Structure

```
src/
├── __tests__/                        # Global test files
│   ├── auth/                         # Auth-related tests
│   │   └── LoginScreen.test.tsx
│   ├── home/                         # Home and policy screen tests
│   │   ├── HomeScreen.test.tsx
│   │   └── ManagePolicyScreen.test.tsx
│   └── SplashScreen.test.tsx
├── app/                              # Expo Router-based app entry
│   ├── _layout.tsx
│   ├── auth/                         # Auth flow screens
│   │   ├── _layout.tsx
│   │   └── login.tsx
│   ├── home/                         # Main home and policy management screens
│   │   ├── _layout.tsx
│   │   ├── index.tsx
│   │   └── manage-policy.tsx
│   └── index.tsx
├── components/                       # Reusable UI components
│   ├── policy/                       # Policy-specific UI components
│   │   ├── policy-card.tsx
│   │   ├── policy-empty-state.tsx
│   │   ├── policy-error-display.tsx
│   │   └── policy-loading-indicator.tsx
│   ├── themed-text.tsx
│   ├── themed-view.tsx
│   └── ui/                           # General UI components
│       ├── __tests__/
│       ├── icon-symbol.ios.tsx
│       ├── icon-symbol.tsx
│       ├── themed-date-display.tsx
│       └── themed-text-input.tsx
├── constants/                        # Theme and global constants
│   └── theme.ts
├── features/                         # Core app features (business logic)
│   ├── auth/                         # Firebase authentication utilities
│   │   ├── getCurrentUser.ts
│   │   ├── isNativeFirebaseError.ts
│   │   ├── signInWithEmailPassword.ts
│   │   └── subscribeToAuthState.ts
│   ├── data/                         # Firestore operations
│   │   ├── firestore/
│   │   ├── getPolicies.ts
│   │   └── savePolicy.ts
│   └── Result.ts
├── hooks/                            # Custom React hooks
│   ├── hooks.ts
│   ├── useThemeColor.ts
│   └── useUnmountSignal.ts
├── state/                            # Redux store and slices
│   ├── slices/
│   │   ├── authSlice.ts
│   │   └── policySlice.ts
│   └── store.ts
├── test-utils/                       # Helper utilities for testing
│   ├── mocks/
│   │   └── expo-router.tsx
│   └── renderWithProvider.tsx
├── types/                            # Shared TypeScript types
│   ├── FirestorePolicyType.ts
│   ├── LoginType.ts
│   ├── PolicyType.ts
│   ├── PolicyTypeWithId.ts
│   ├── SaveError.ts
│   └── User.ts
├── utils/                            # Utility functions
│   ├── addYears.ts
│   ├── convertFirestorePolicyToPolicy.ts
│   ├── formatDateToShortMonth.ts
│   ├── getEndOfDay.ts
│   └── getStartOfDay.ts

└── validation/                       # Form validation schemas
    ├── loginSchema.ts
    └── policySchema.ts
```

---

## 🧰 Tech Stack

| Category | Technology |
|---------|------------|
| Framework | React Native (Expo) |
| Language | TypeScript |
| State Management | Redux Toolkit |
| Navigation | Expo Router |
| Authentication | **Firebase Auth (Email/Password)** |
| Database | **Firebase Firestore SDK** |
| Testing | Jest + React Native Testing Library |

---

## 🔐 Firebase Configuration

### 1) Create Firebase project
- In [Firebase Console](https://console.firebase.google.com), create a new project.
- Add **iOS** (bundle id e.g., `com.yourcompany.insurance`) and **Android** (package e.g., `com.yourcompany.insurance`).

### 2) Enable Authentication (Email/Password)
- Console → **Build → Authentication → Sign-in method**  
- Enable **Email/Password**. (add a test user in the **Users** tab.)

### 3) Enable Firestore
- Console → **Build → Firestore Database** → **Create database**  
- Start in **test mode** for development; tighten rules for production.

### 4) Platform config files
- Place the files in your project folder:
  - iOS: `GoogleService-Info.plist`
  - Android (untested): `google-services.json`

### 5) Expo app config
update **app.json**
```json
{
  "expo": {
    "ios": {
      "bundleIdentifier": "com.yourcompany.insurance",
    },
    "android": {
      "package": "com.yourcompany.insurance",
    }
  }
}
```

**Test Results:**
```
> mypolicies@1.0.0 test
> jest

 PASS  src/features/data/__tests__/getPolicies.test.ts
 PASS  src/features/data/__tests__/savePolicy.test.ts
 PASS  src/utils/__tests__/formatDateToShortMonth.test.ts
 PASS  src/state/slices/__tests__/policySlice.test.ts
 PASS  src/utils/__tests__/getStartOfDay.test.ts
 PASS  src/features/auth/__tests__/subscribeToAuthState.test.ts
 PASS  src/features/auth/__tests__/signInWithEmailPassword.test.ts
 PASS  src/features/auth/__tests__/isNativeFirebaseError.test.ts
 PASS  src/utils/__tests__/convertFirestorePolicyToPolicy.test.ts
 PASS  src/utils/__tests__/getEndOfDay.test.ts
 PASS  src/features/auth/__tests__/getCurrentUser.test.ts
 PASS  src/utils/__tests__/addYears.test.ts
 PASS  src/components/ui/__tests__/themed-date-display.test.tsx
 PASS  src/__tests__/SplashScreen.test.tsx
 PASS  src/__tests__/home/HomeScreen.test.tsx
 PASS  src/__tests__/auth/LoginScreen.test.tsx
 PASS  src/__tests__/home/ManagePolicyScreen.test.tsx (5.801 s)

Test Suites: 17 passed, 17 total
Tests:       146 passed, 146 total
Snapshots:   0 total
Time:        6.805 s
Ran all test suites.
```

---
