import { useEffect, useState } from "react";
import { db } from "../db/database";
import type { Transaction } from "../types/transaction";
import { ScreenHeader } from "../components/ScreenHeader";

type HistoryProps = {
  menuOpen: boolean;
  onToggleMenu: () => void;
  onGoBackup: () => void;
};

export function History({
  menuOpen,
  onToggleMenu,
  onGoBackup
}: HistoryProps) {
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

  function formatCurrency(value: number) {
    return value.toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL"
    });
  }

  return (
    <main className="screen">
      <ScreenHeader
        title="Histórico"
        menuOpen={menuOpen}
        onToggleMenu={onToggleMenu}
        onGoBackup={onGoBackup}
      />

      <div className="scrollArea">
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
                    {formatCurrency(item.amount)}
                  </strong>

                  <button onClick={() => deleteTransaction(item.id)}>
                    Apagar
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </main>
  );
}