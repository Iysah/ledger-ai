# Future Features Roadmap

This document outlines the planned features and suggestions for the Monitrac app.

## 🚀 High Priority (User Requested)

### 1. Voice-to-Text Input
**Goal**: Enable users to log expenses and income using voice commands instead of manual typing.

- **Technology**: `react-native-executorch` (specifically `useSpeechToText` with Whisper models).
- **Implementation Strategy**:
  - Integrate the `useSpeechToText` hook as per the [Executorch documentation](https://docs.swmansion.com/react-native-executorch/docs/hooks/natural-language-processing/useSpeechToText).
  - Add a microphone interaction button to the `AddExpenseScreen`.
  - **Smart Parsing**: Feed the transcribed text into the existing AI inference engine to automatically extract:
    - Amount
    - Category
    - Description
    - Date

### 2. Google Sign-in Integration
**Goal**: Provide a secure and convenient way for users to sign in and prepare the app for cloud synchronization.

- **Technology**: Firebase Authentication (`@react-native-firebase/auth`) & Google Sign-In (`@react-native-google-signin/google-signin`).
- **Implementation Strategy**:
  - Set up a Firebase project and configure Android/iOS apps.
  - Implement the Google Sign-In flow.
  - Create an Authentication Context to manage user sessions.
  - (Optional) Link existing local data to the new user account upon first login.

---

## 💎 Pro Plan & Monetization (Premium)

This section outlines the strategy for the "Monitrac Pro" subscription. The goal is to offer core value for free while gating advanced automation, insights, and convenience behind a paywall.

### Paywall Implementation
- **Technology**: `RevenueCat` (Recommended for ease of use) or `expo-in-app-purchases`.
- **Strategy**:
  - **Freemium Model**: Basic manual entry and simple local storage are free.
  - **Hard Gate**: Features below trigger the `PremiumScreen` paywall when accessed.
  - **Soft Gate**: "You've reached your limit of 5 free AI scans this month."

### Proposed Premium Features

#### 1. AI Financial Assistant (Existing & Enhanced)
- **Current State**: `useExpenseAI` uses local LLAMA for basic extraction.
- **Premium Value**: 
  - **Unlimited AI Interactions**: Free users get 5 queries/day; Pro users get unlimited.
  - **Smart Financial Advice**: "How can I save more on groceries?" (Requires RAG on full history).
  - **Voice-to-Text Entry**: The new feature requested above should be a Pro feature due to its convenience.

#### 2. Cloud Sync & Multi-Device Support
- **Why**: The #1 reason users pay is data safety and accessibility across devices.
- **Feature**: Real-time sync between iPhone, iPad, and Android.
- **Tech**: Firestore/PostgreSQL backend (requires the Google Sign-In feature).

#### 3. Advanced Analytics & Charts
- **Current State**: `ReportsScreen` shows basic text summaries.
- **Premium Value**:
  - Interactive Pie/Bar Charts (using `react-native-gifted-charts`).
  - Month-over-Month comparison.
  - Forecasting: "At this rate, you will overspend by $200."

#### 4. Receipt Scanning (OCR)
- **Feature**: Snap a photo of a receipt to auto-fill the expense form.
- **Why**: High utility, saves time.

#### 5. Data Export
- **Feature**: Export data to CSV/Excel/PDF for tax purposes or personal archiving.

---

## 💡 Recommended Suggestions (General)

### Data Security
**6. Biometric Security (App Lock)**
- **Why**: Financial data is sensitive.
- **Plan**: Use `expo-local-authentication` to require FaceID/TouchID when opening the app.

### Enhanced Financial Features
**7. Recurring Transactions**
- **Why**: Many expenses (Rent, Subscriptions) and incomes (Salary) are repetitive.
- **Plan**: Add a "Recurring" flag to the transaction model to automatically generate entries for future dates.

**8. Multi-Currency Support**
- **Why**: Essential for users who travel or hold assets in different currencies.
- **Plan**: Store a base currency and exchange rates, allowing transactions to be entered in any currency but visualized in the base currency.
