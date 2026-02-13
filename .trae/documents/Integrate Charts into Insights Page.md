# Improve Insights Page with Charts

## Objective
Enhance the `ReportsScreen` (Insights) by integrating `react-native-gifted-charts` to visualize financial data, as outlined in the "Financial Insights & Visualization Plan".

## Proposed Changes

### 1. Dependencies
- Install `react-native-gifted-charts` (requires `react-native-svg`, which is already installed).

### 2. Data Helper (`src/utils/chartHelpers.ts`)
Create a new utility file to handle data transformation for charts:
- **`preparePieChartData`**: Aggregates expenses by category, calculating totals and percentages. It will also map categories to their assigned colors from the store.
- **`prepareBarChartData`**: Aggregates expenses by day for the current month to visualize spending trends.

### 3. Screen Update (`src/screens/ReportsScreen.tsx`)
Refactor the screen to include:
- **State Integration**: Fetch `categories` from `useExpenseStore` to access category colors.
- **Visualizations**:
    - **Donut Chart**: Replaces/Augments the text-based category list. Shows spending distribution.
    - **Bar Chart**: A new section for "Spending Trends" showing daily spending for the current month.
- **UI Improvements**:
    - Add a legend for the Donut chart.
    - styling improvements to accommodate the new charts.

## Implementation Steps
1.  Run `pnpm add react-native-gifted-charts`.
2.  Create `src/utils/chartHelpers.ts` with aggregation logic.
3.  Modify `src/screens/ReportsScreen.tsx` to implement the new charts and data logic.
4.  Verify the charts render correctly with sample data.
