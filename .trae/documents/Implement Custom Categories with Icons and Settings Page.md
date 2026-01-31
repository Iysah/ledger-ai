I have analyzed the codebase and designed a plan to implement user-defined categories with icons and a settings page.

### 1. Database & Data Model Updates
- **Update Types**: Modify `Category` interface in `src/types/index.ts` to replace `emoji` with `icon` (string).
- **Update Constants**: Update `PREDEFINED_CATEGORIES` in `src/constants/categories.ts` to use Lucide icon names (e.g., 'Utensils', 'Car', 'ShoppingBag') instead of emojis.
- **Database Migration**: 
  - Update `src/database/db.ts` to include the `icon` column in the `categories` table.
  - Implement a check to migrate existing tables (add `icon` column if missing).
  - Add `addCategory` and `deleteCategory` functions to the database layer.

### 2. State Management (Store)
- **Update Expense Store**: Modify `src/store/expenseStore.ts` to include:
  - `addCategory(category)` action.
  - `deleteCategory(id)` action.

### 3. Icon System
- **Icon Mapping**: Create `src/utils/icons.tsx` to map string names to `lucide-react-native` components. This allows us to store icon names in the database and render the corresponding component dynamically.

### 4. UI Implementation
- **Update CategoryPicker**: Modify `src/components/CategoryPicker.tsx` to render Lucide icons using the mapping utility instead of text emojis.
- **Create Settings Screen**: Implement `src/screens/SettingsScreen.tsx` with:
  - **Theme Selector**: Toggle between Light/Dark/System.
  - **Category Management**:
    - List existing categories with a "Delete" button.
    - "Add Category" section with a form for Name, Icon (grid selection), and Color.
- **Navigation**: Update `src/navigation/AppNavigator.tsx` to add the `SettingsScreen` as a new tab in `MainTabs`.

### 5. Cleanup
- Verify existing `AddExpenseScreen` works correctly with the new icon system.
