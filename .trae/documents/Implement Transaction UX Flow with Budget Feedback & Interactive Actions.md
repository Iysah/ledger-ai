
I have analyzed the codebase and identified that while transaction logging and basic AI processing exist, the specific "Remaining Budget" feedback and interactive "Undo/Change Category" features are missing. Additionally, there is no underlying `budgets` table in the database to support the requested budget tracking.

Here is the plan to implement the requested UX flow:

## 1. Database & Schema Updates
- **Update `src/database/schema.ts`**: Create a new `budgets` table to store monthly budget limits per category.
  - Fields: `id`, `category` (unique), `amount`, `period` (default: 'monthly').
- **Update `src/database/db.ts`**:
  - Add table creation logic in `initDatabase`.
  - Implement helper functions: `getCategoryBudget(categoryName)` and `setCategoryBudget(categoryName, amount)`.
  - Add a helper `getMonthlyCategorySpend(categoryName)` to calculate total spend for the current month.

## 2. AI & Business Logic Enhancements
- **Modify `src/services/ai/inference.ts`**:
  - In the transaction extraction flow, after successfully adding an expense:
    - Fetch the budget for the extracted category.
    - Calculate the total spend for the current month (including the new transaction).
    - Determine the "Remaining Budget".
  - Return this extended context (budget limit, remaining amount, spend info) in the `result.data`.
  - Ensure the `expenseId` is returned in `result.data` to allow for Undo/Update operations.

## 3. Chat Interface Improvements
- **Update `src/screens/ChatScreen.tsx`**:
  - **Budget Feedback**: Update the `useEffect` that processes AI results to construct a message that includes the remaining budget (e.g., "Logged $50.00 under Food. Remaining budget for Jan: $450.").
  - **Interactive Actions**:
    - Modify `renderMessage` to display "Undo" and "Change Category" buttons for transaction-type messages.
    - **Undo Action**: Implement a handler that calls `deleteExpense(id)` and updates the chat message to reflect the cancellation.
    - **Change Category Action**: Implement a handler that shows a category selection modal (using `CategoryPicker`) and updates the expense via `updateExpense(id, { category })`.

## 4. Query Flow (Data Querying)
- **Refine Query Logic**:
  - The current RAG implementation is basic. I will enhance the context generation in `inference.ts` to include a summary of "spend this week" vs "spend last week" if the user's query implies a comparison, ensuring the AI has the necessary data points to generate the "10% lower than last week" type of insight.

## Verification
- Verify the flow by:
  1. Setting a budget for "Food".
  2. Typing "Paid $50 for lunch".
  3. Checking the response for correct budget math.
  4. Testing "Undo" to ensure the transaction is removed and budget restores.
  5. Testing "Change Category" to move the expense and update budget calculations.
