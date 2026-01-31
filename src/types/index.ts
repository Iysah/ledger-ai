export interface Category {
  id: number;
  name: string;
  icon: string;
  color: string;
}

export interface Expense {
  id: number;
  amount: number;
  description: string;
  merchant?: string | null;
  category: string;
  date: string; // ISO date string
  receipt_image_uri: string | null;
  created_at: string;
  updated_at: string;
  embedding?: string | null; // JSON string of number[]
}

export interface ExpenseFormData {
  amount: string;
  description: string;
  merchant?: string;
  category: string;
  date: Date;
  receipt_image_uri: string | null;
}

export interface FilterOptions {
  category: string | null;
  startDate: Date | null;
  endDate: Date | null;
}
