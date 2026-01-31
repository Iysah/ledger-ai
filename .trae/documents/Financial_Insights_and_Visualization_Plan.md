# Financial Insights & Visualization Plan

## Recommended Financial Insights & Charts

| Insight Goal | Data Required | Best Chart Type | Why? |
| :--- | :--- | :--- | :--- |
| **"Where is my money going?"** | Total spending grouped by `category`. | **Donut Chart** | Clearly shows proportions (e.g., 40% Food, 30% Rent) without being overwhelming. |
| **"Am I spending more than usual?"** | Total spending grouped by `date` (Daily/Weekly/Monthly). | **Line Chart** or **Bar Chart** | Perfect for spotting trends, spikes, or drops over time. |
| **"Who gets most of my money?"** | Total spending grouped by `merchant`, sorted descending. | **Horizontal Bar Chart** | Efficient for ranking the top 5 places users shop at. |
| **"When do I spend the most?"** | Average spending grouped by day of the week. | **Vertical Bar Chart** | Helps users identify patterns (e.g., "I spend 3x more on weekends"). |
| **"How close am I to my limit?"** | Total spending vs. defined budget (per category or total). | **Progress Bar** (Gauge) | Simple, at-a-glance status (Green = Good, Red = Warning). |

## Implementation Plan

### 1. Library Selection
Use **`react-native-gifted-charts`** for its customizability, animation support, and compatibility with `react-native-svg`.

### 2. Proposed Changes to `ReportsScreen.tsx`
*   **Category Breakdown**: Implement a Pie/Donut Chart.
*   **Spending Trends**: Add a Bar Chart for Weekly/Monthly views.
*   **Top Merchants**: Display a list or chart of top spending destinations.

### 3. Next Steps
1.  Install the library: `pnpm add react-native-gifted-charts`
2.  Refactor `ReportsScreen` to include these new visualizations.
