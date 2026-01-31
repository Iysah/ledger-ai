I will replace the `Alert.alert` calls with `sonner-native` toasts for notifications, validation errors, and success messages.

**Plan:**

1.  **EditExpenseScreen.tsx**:
    *   Import `toast` from `sonner-native`.
    *   Replace `Alert.alert` with `toast.error` or `toast.warning` for:
        *   Permission denials (Camera/Gallery).
        *   Image picker errors.
        *   Validation errors (Invalid amount, missing description/category).
        *   Update failure.
    *   Replace `Alert.alert` with `toast.success` for successful expense updates.

2.  **SettingsScreen.tsx**:
    *   Import `toast` from `sonner-native`.
    *   Replace `Alert.alert` with `toast.error` or `toast.warning` for:
        *   Category validation (Empty name, Duplicate name).
        *   Add/Delete failure errors.
    *   Replace `Alert.alert` with `toast.info` for:
        *   "Contact Support" and "Share" placeholders.
    *   **Note**: I will *retain* `Alert.alert` for the **"Delete Category" confirmation dialog**, as `sonner-native` is designed for transient notifications, not blocking confirmation prompts.

3.  **ExpenseListScreen.tsx**:
    *   **Note**: I will *retain* `Alert.alert` for the **"Delete Expense" confirmation**, for the same safety reasons as above.

4.  **CategoriesScreen.tsx** (Standalone file):
    *   I will apply similar updates to this file to ensure consistency, even though `SettingsScreen` currently handles categories via a modal.

**Verification:**
*   I will verify that the app compiles and that `toast` is used correctly with the existing `Toaster` in `App.tsx`.
