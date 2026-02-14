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

## 💡 Recommended Suggestions

### Data Security & Synchronization
**3. Cloud Sync & Backup**
- **Why**: Currently, all data is stored locally (SQLite/MMKV). If a user loses their device, they lose their financial data.
- **Plan**: Sync local SQLite data with a cloud database (e.g., Firestore or a PostgreSQL instance) after authentication.

**4. Biometric Security (App Lock)**
- **Why**: Financial data is sensitive.
- **Plan**: Use `expo-local-authentication` to require FaceID/TouchID when opening the app.

### Enhanced Financial Features
**5. Recurring Transactions**
- **Why**: Many expenses (Rent, Subscriptions) and incomes (Salary) are repetitive.
- **Plan**: Add a "Recurring" flag to the transaction model to automatically generate entries for future dates.

**6. Multi-Currency Support**
- **Why**: Essential for users who travel or hold assets in different currencies.
- **Plan**: Store a base currency and exchange rates, allowing transactions to be entered in any currency but visualized in the base currency.

**7. Receipt Scanning (OCR)**
- **Why**: Reduces friction in adding expenses.
- **Plan**: Use on-device AI (Executorch) or a cloud API to analyze images attached to expenses and auto-fill the form.

### Data Portability
**8. CSV/JSON Export & Import**
- **Why**: Users often want to perform their own analysis in Excel or migrate data.
- **Plan**: Implement file system sharing to export the database tables as CSV files.
