import Dexie, { type Table } from "dexie";
import type { Transaction } from "../types/transaction";

class FinanceDatabase extends Dexie {
  transactions!: Table<Transaction, number>;

  constructor() {
    super("FinanceAppDB");

    this.version(1).stores({
      transactions: "++id, type, category, date, createdAt"
    });
  }
}

export const db = new FinanceDatabase();