import type { Transaction, TransactionType } from "../types/transaction";

const transactionTypes: TransactionType[] = ["income", "expense"];

export function isTransaction(value: unknown): value is Transaction {
  if (!value || typeof value !== "object") return false;

  const transaction = value as Record<string, unknown>;

  return (
    (transaction.id === undefined || typeof transaction.id === "number") &&
    transactionTypes.includes(transaction.type as TransactionType) &&
    typeof transaction.amount === "number" &&
    Number.isFinite(transaction.amount) &&
    transaction.amount > 0 &&
    typeof transaction.description === "string" &&
    typeof transaction.date === "string" &&
    typeof transaction.createdAt === "string" &&
    (transaction.paymentMethod === undefined ||
      typeof transaction.paymentMethod === "string") &&
    (transaction.category === undefined ||
      typeof transaction.category === "string") &&
    (transaction.updatedAt === undefined ||
      typeof transaction.updatedAt === "string")
  );
}
