I will move the category management logic and UI from `SettingsScreen.tsx` to `CategoriesScreen.tsx` to create a dedicated, clean interface for managing categories.

### **Plan:**

1.  **Update `src/screens/settings/CategoriesScreen.tsx`**:
    *   **Imports**: Add missing imports (`useState`, `Alert`, `TextInput`, `Modal`, `Check`, `X`) and utilities (`getIcon`, `availableIcons`).
    *   **State**: Add state variables for the form (`newCategoryName`, `selectedIcon`, `selectedColor`) and modal visibility (`showAddModal`).
    *   **Logic**: Move `handleAddCategory`, `handleDeleteCategory`, and `resetForm` functions here.
    *   **UI**:
        *   Keep the main list view.
        *   Implement the **Add Category Modal** (containing the name input, icon picker, and color picker) directly in this file.
    *   **Styles**: Copy relevant styles for the form, inputs, and color/icon grids.

2.  **Clean up `src/screens/SettingsScreen.tsx`**:
    *   **Remove Code**: Delete all category-related state, functions (`handleAddCategory`, etc.), and the large "Manage Categories" and "Add Category" modals.
    *   **Simplify**: The "Manage Categories" button will strictly navigate to the new `CategoriesScreen`.

This will result in a cleaner `SettingsScreen` and a fully functional `CategoriesScreen` that matches the design.