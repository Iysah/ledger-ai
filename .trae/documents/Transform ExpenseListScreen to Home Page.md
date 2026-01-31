I will transform the `ExpenseListScreen.tsx` into a comprehensive Home Page by implementing the following steps:

## 1. Data Model & Store Updates
*   **Types**: Update `src/types/index.ts` to include a `Budget` interface.
*   **Database**: Add `getAllBudgets()` and `getAllCategorySpends()` (or `getMonthlyExpenses`) to `src/database/db.ts` to efficiently fetch budget and spending data.
*   **Store**: Update `src/store/expenseStore.ts` to manage `budgets` state and add a `loadBudgets` action. This will allow the UI to display real-time budget vs. actuals.

## 2. Component Creation
I will create modular components in `src/components/` to keep the code clean and reusable:
*   **`HomeHeader.tsx`**: A sticky header displaying the current day (e.g., "Monday") and a profile icon that navigates to Settings.
*   **`BudgetOverview.tsx`**: A prominent card showing the Total Budget, Amount Spent, Remaining Budget, and a visual progress bar with color-coding (Green/Yellow/Red).
*   **`CategoryList.tsx`**: A list of categories displaying the icon, name, and "Spent / Budget" details for each.

## 3. Screen Implementation
*   **Refactor `ExpenseListScreen.tsx`**:
    *   Replace the current simple list with a `SafeAreaView` containing the new `HomeHeader`, `BudgetOverview`, and `CategoryList`.
    *   Implement `useEffect` to fetch budget and expense data on mount.
    *   Add `RefreshControl` to reload data on pull-to-refresh.
    *   Ensure responsive layout and proper styling matching the provided reference (rounded corners, shadows, typography).

## 4. Testing & Validation
*   **Unit Tests**: Create `src/screens/__tests__/ExpenseListScreen.test.tsx` to verify budget calculations (e.g., correct remaining amount, percentage).
*   **Manual Verification**: Verify that the header is sticky, the progress bar updates correctly, and navigation to Settings works.

I will start by updating the types and database layer, then move to the store, and finally build the UI components and assemble the screen.