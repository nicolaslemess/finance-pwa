import { useEffect, useState } from "react";
import { db } from "../db/database";
import type { Transaction } from "../types/transaction";

export function Dashboard() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);

  async function loadTransactions() {
    const items = await db.transactions.orderBy("date").reverse().toArray();
    setTransactions(items);
  }

  useEffect(() => {
    loadTransactions();
  }, []);

  const income = transactions
    .filter((item) => item.type === "income")
    .reduce((total, item) => total + item.amount, 0);

  const expense = transactions
    .filter((item) => item.type === "expense")
    .reduce((total, item) => total + item.amount, 0);

  const balance = income - expense;

  return (
    <main className="screen">
      <h1>Finanças</h1>

      <section className="card hero">
        <span>Saldo atual</span>
        <strong>
          {balance.toLocaleString("pt-BR", {
            style: "currency",
            currency: "BRL"
          })}
        </strong>
      </section>

      <section className="grid">
        <div className="card">
          <span>Entradas</span>
          <strong>
            {income.toLocaleString("pt-BR", {
              style: "currency",
              currency: "BRL"
            })}
          </strong>
        </div>

        <div className="card">
          <span>Saídas</span>
          <strong>
            {expense.toLocaleString("pt-BR", {
              style: "currency",
              currency: "BRL"
            })}
          </strong>
        </div>
      </section>

      <section>
        <h2>Últimos lançamentos</h2>

        {transactions.length === 0 ? (
          <p>Nenhum lançamento ainda.</p>
        ) : (
          <ul className="list">
            {transactions.slice(0, 5).map((item) => (
              <li key={item.id} className="listItem">
                <div>
                  <strong>{item.description || item.category}</strong>
                  <span>{item.date}</span>
                </div>

                <span>
                  {item.type === "expense" ? "-" : "+"}
                  {item.amount.toLocaleString("pt-BR", {
                    style: "currency",
                    currency: "BRL"
                  })}
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>
    </main>
  );
}