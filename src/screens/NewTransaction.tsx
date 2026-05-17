import { useState } from "react";
import { db } from "../db/database";
import type { TransactionType } from "../types/transaction";

type Props = {
  onSaved: () => void;
};

export function NewTransaction({ onSaved }: Props) {
  const [type, setType] = useState<TransactionType>("expense");
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState("Alimentação");
  const [description, setDescription] = useState("");
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();

    const numericAmount = Number(amount.replace(",", "."));

    if (!numericAmount || numericAmount <= 0) {
      alert("Digite um valor válido.");
      return;
    }

    await db.transactions.add({
      type,
      amount: numericAmount,
      category,
      description,
      date,
      createdAt: new Date().toISOString()
    });

    setAmount("");
    setDescription("");
    onSaved();
  }

  return (
    <main className="screen">
      <h1>Novo lançamento</h1>

      <form onSubmit={handleSubmit} className="form">
        <div className="segmented">
          <button
            type="button"
            className={type === "expense" ? "active" : ""}
            onClick={() => setType("expense")}
          >
            Saída
          </button>

          <button
            type="button"
            className={type === "income" ? "active" : ""}
            onClick={() => setType("income")}
          >
            Entrada
          </button>
        </div>

        <label>
          Valor
          <input
            inputMode="decimal"
            placeholder="0,00"
            value={amount}
            onChange={(event) => setAmount(event.target.value)}
          />
        </label>

        <label>
          Categoria
          <select
            value={category}
            onChange={(event) => setCategory(event.target.value)}
          >
            <option>Alimentação</option>
            <option>Transporte</option>
            <option>Moradia</option>
            <option>Saúde</option>
            <option>Lazer</option>
            <option>Trabalho</option>
            <option>Outros</option>
          </select>
        </label>

        <label>
          Descrição
          <input
            placeholder="Ex: almoço"
            value={description}
            onChange={(event) => setDescription(event.target.value)}
          />
        </label>

        <label>
          Data
          <input
            type="date"
            value={date}
            onChange={(event) => setDate(event.target.value)}
          />
        </label>

        <button className="primary" type="submit">
          Salvar lançamento
        </button>
      </form>
    </main>
  );
}