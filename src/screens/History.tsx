import { useEffect, useState } from "react";
import { db } from "../db/database";
import type { Transaction } from "../types/transaction";

export function History() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);

  async function loadTransactions() {
    const items = await db.transactions.orderBy("date").reverse().toArray();
    setTransactions(items);
  }

  async function deleteTransaction(id?: number) {
    if (!id) return;

    await db.transactions.delete(id);
    await loadTransactions();
  }

  useEffect(() => {
    loadTransactions();
  }, []);

  return (
    <main className="screen">
      <h1>Histórico</h1>

      {transactions.length === 0 ? (
        <p>Nenhum lançamento cadastrado.</p>
      ) : (
        <ul className="list">
          {transactions.map((item) => (
            <li key={item.id} className="listItem">
              <div>
                <strong>{item.description || item.category}</strong>
                <span>
                  {item.category} · {item.date}
                </span>
              </div>

              <div className="right">
                <strong>
                  {item.type === "expense" ? "-" : "+"}
                  {item.amount.toLocaleString("pt-BR", {
                    style: "currency",
                    currency: "BRL"
                  })}
                </strong>

                <button onClick={() => deleteTransaction(item.id)}>
                  Apagar
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}