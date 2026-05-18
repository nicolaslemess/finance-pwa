export type TransactionType = "income" | "expense";

export type Transaction = {
  id?: number;
  type: TransactionType;
  amount: number;
  description: string;
  date: string;
  paymentMethod?: string;
  category?: string;
  createdAt: string;
  updatedAt?: string;
};