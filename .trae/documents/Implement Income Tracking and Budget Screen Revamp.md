I will implement the "Budget Screen" revamp and Income tracking features.

### 1. Database & Data Model Updates
- **New `incomes` Table**: Create a table in `src/database/db.ts` with fields: `id`, `amount`, `description`, `type` (Salary, Freelance, etc.), `date`, `created_at`.
- **Types**: Add `Income` interface to `src/types/index.ts`.
- **Database Helpers**: Add `addIncome`, `getIncomes`, `deleteIncome` functions to `src/database/db.ts`.

### 2. State Management
- **Expense Store**: Update `src/store/expenseStore.ts` to:
  - State: Add `incomes` array.
  - Actions: Add `loadIncomes`, `addIncome`, `deleteIncome`.
  - Load incomes when initializing data.

### 3. Budget Screen Implementation
- **Revamp `src/screens/BudgetScreen.tsx`**:
  - **Income Section**: Display a list of monthly incomes.
  - **Add Income**: Implement a modal or form to add income (Amount, Type selection from "Salary, Freelance, Gifts, Dividends, Other").
  - **Budget Summary**: Show Total Income vs. Total Spending Limits (Budgets).

### 4. Home Screen Integration
- **Update `src/components/BudgetOverview.tsx`**:
  - Fetch incomes from store.
  - Calculate "Total Monthly Income".
  - Display "Total Income" alongside existing Budget/Spending info to reflect the user's financial capacity for the month.

### 5. Verification
- Verify that incomes can be added and listed.
- Verify that the Home Page reflects the new Income data.
