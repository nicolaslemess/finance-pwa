export type TransactionType = "income" | "expense";

export type Transaction = {
  id?: number;
  type: TransactionType;
  amount: number;
  category: string;
  description?: string;
  date: string;
  paymentMethod?: string;
  createdAt: string;
  updatedAt?: string;
};