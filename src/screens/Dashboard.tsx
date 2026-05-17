import { useEffect, useState } from "react";
import { db } from "../db/database";
import type { Transaction } from "../types/transaction";
import { ScreenHeader } from "../components/ScreenHeader";

type DashboardProps = {
  menuOpen: boolean;
  onToggleMenu: () => void;
  onGoBackup: () => void;
};

export function Dashboard({
  menuOpen,
  onToggleMenu,
  onGoBackup
}: DashboardProps) {
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

  function formatCurrency(value: number) {
    return value.toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL"
    });
  }

  return (
    <main className="screen">
      <ScreenHeader
        title="Finanças"
        menuOpen={menuOpen}
        onToggleMenu={onToggleMenu}
        onGoBackup={onGoBackup}
      />

      <div className="scrollArea">
        <section className="card hero">
          <span>Saldo atual</span>
          <strong>{formatCurrency(balance)}</strong>
        </section>

        <section className="grid">
          <div className="card">
            <span>Entradas</span>
            <strong>{formatCurrency(income)}</strong>
          </div>

          <div className="card">
            <span>Saídas</span>
            <strong>{formatCurrency(expense)}</strong>
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
                    {formatCurrency(item.amount)}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </main>
  );
}