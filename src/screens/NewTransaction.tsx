import { useRef, useState } from "react";
import { db } from "../db/database";
import type { TransactionType } from "../types/transaction";
import { ScreenHeader } from "../components/ScreenHeader";
import type { HeaderNavigationProps } from "../App";
import {
  addDaysToLocalDate,
  createValidLocalDate,
  formatDateForStorage,
  getLocalTodayDate
} from "../utils/date";
import { formatCurrency } from "../utils/format";

type Props = HeaderNavigationProps;

type ParsedTransaction = {
  type: TransactionType;
  amount: number;
  description: string;
  date: string;
};

type ChatMessage =
  | {
    id: string;
    sender: "user";
    text: string;
  }
  | {
    id: string;
    sender: "app";
    text: string;
    parsed?: ParsedTransaction;
    error?: string;
  };

const expenseWords = [
  "gastei",
  "gasto",
  "paguei",
  "comprei",
  "compra",
  "saida",
  "saída",
  "saiu",
  "torrei",
  "debitei"
];

const incomeWords = [
  "recebi",
  "recebido",
  "ganhei",
  "entrou",
  "entrada",
  "salario",
  "salário",
  "caiu",
  "faturei"
];

const auxiliaryWords = [
  "reais",
  "real",
  "rs",
  "r",
  "com",
  "de",
  "do",
  "da",
  "dos",
  "das",
  "em",
  "no",
  "na",
  "nos",
  "nas",
  "para",
  "pra"
];

function normalizeText(text: string) {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

function detectType(text: string): TransactionType {
  const normalized = normalizeText(text);

  if (incomeWords.some((word) => normalized.includes(normalizeText(word)))) {
    return "income";
  }

  if (expenseWords.some((word) => normalized.includes(normalizeText(word)))) {
    return "expense";
  }

  return "expense";
}

function detectAmount(text: string) {
  const match = text.match(
    /(?:r\$?\s*)?(\d{1,3}(?:\.\d{3})*(?:,\d{1,2})?|\d+(?:[.,]\d{1,2})?)/i
  );

  if (!match) return 0;

  const rawValue = match[1];

  const normalizedValue = rawValue.includes(",")
    ? rawValue.replace(/\./g, "").replace(",", ".")
    : rawValue.replace(/\./g, "");

  return Number(normalizedValue);
}

function detectDate(text: string) {
  const normalized = normalizeText(text);

  if (normalized.includes("anteontem")) {
    return addDaysToLocalDate(-2);
  }

  if (normalized.includes("ontem")) {
    return addDaysToLocalDate(-1);
  }

  if (normalized.includes("hoje")) {
    return getLocalTodayDate();
  }

  const fullDateMatch = normalized.match(/\b(\d{1,2})\/(\d{1,2})\/(\d{4})\b/);

  if (fullDateMatch) {
    const day = Number(fullDateMatch[1]);
    const month = Number(fullDateMatch[2]) - 1;
    const year = Number(fullDateMatch[3]);
    const date = createValidLocalDate(year, month, day);

    if (date) {
      return formatDateForStorage(date);
    }
  }

  const shortDateMatch = normalized.match(/\b(\d{1,2})\/(\d{1,2})\b/);

  if (shortDateMatch) {
    const day = Number(shortDateMatch[1]);
    const month = Number(shortDateMatch[2]) - 1;
    const year = new Date().getFullYear();
    const date = createValidLocalDate(year, month, day);

    if (date) {
      return formatDateForStorage(date);
    }
  }

  const dayOnlyMatch = normalized.match(/\bdia\s+(\d{1,2})\b/);

  if (dayOnlyMatch) {
    const day = Number(dayOnlyMatch[1]);
    const now = new Date();
    const date = createValidLocalDate(now.getFullYear(), now.getMonth(), day);

    if (date) {
      return formatDateForStorage(date);
    }
  }

  return getLocalTodayDate();
}

function cleanDescription(text: string) {
  let cleaned = normalizeText(text);

  const wordsToRemove = [
    ...expenseWords,
    ...incomeWords,
    ...auxiliaryWords,
    "hoje",
    "ontem",
    "anteontem"
  ].map(normalizeText);

  cleaned = cleaned.replace(
    /(?:r\$?\s*)?\d{1,3}(?:\.\d{3})*(?:,\d{1,2})?/gi,
    ""
  );
  cleaned = cleaned.replace(/(?:r\$?\s*)?\d+(?:[.,]\d{1,2})?/gi, "");
  cleaned = cleaned.replace(/\b\d{1,2}\/\d{1,2}\/\d{4}\b/g, "");
  cleaned = cleaned.replace(/\b\d{1,2}\/\d{1,2}\b/g, "");
  cleaned = cleaned.replace(/\bdia\s+\d{1,2}\b/g, "");

  for (const word of wordsToRemove) {
    const regex = new RegExp(`\\b${word}\\b`, "gi");
    cleaned = cleaned.replace(regex, "");
  }

  return cleaned.replace(/\s+/g, " ").trim();
}

function parseTransaction(text: string): ParsedTransaction | null {
  const amount = detectAmount(text);

  if (!amount || amount <= 0) {
    return null;
  }

  const type = detectType(text);
  const date = detectDate(text);
  const description = cleanDescription(text);

  return {
    type,
    amount,
    description: description || "Sem descrição",
    date
  };
}

function formatDate(date: string) {
  return new Date(`${date}T00:00:00`).toLocaleDateString("pt-BR");
}

function createId() {
  return crypto.randomUUID
    ? crypto.randomUUID()
    : String(Date.now() + Math.random());
}

export function NewTransaction({
  menuOpen,
  onToggleMenu,
  onGoDashboard,
  onGoNew,
  onGoHistory,
  onGoBackup
}: Props) {
  const [message, setMessage] = useState("");
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [pendingTransaction, setPendingTransaction] =
    useState<ParsedTransaction | null>(null);
  const [inputFocused, setInputFocused] = useState(false);
  const inputRef = useRef<HTMLInputElement | null>(null);

  function sendMessage() {
    const trimmedMessage = message.trim();

    if (!trimmedMessage) return;

    const parsed = parseTransaction(trimmedMessage);

    const userMessage: ChatMessage = {
      id: createId(),
      sender: "user",
      text: trimmedMessage
    };

    const appMessage: ChatMessage = parsed
      ? {
        id: createId(),
        sender: "app",
        text: "Entendi esse lançamento:",
        parsed
      }
      : {
        id: createId(),
        sender: "app",
        text: "Não consegui entender esse lançamento.",
        error: "Inclua pelo menos um valor. Ex: gastei 40 almoço ontem."
      };

    setChatMessages((current) => [...current, userMessage, appMessage]);
    setPendingTransaction(parsed);
    setMessage("");
  }

  async function savePendingTransaction() {
    if (!pendingTransaction) return;

    await db.transactions.add({
      type: pendingTransaction.type,
      amount: pendingTransaction.amount,
      description: pendingTransaction.description,
      date: pendingTransaction.date,
      createdAt: new Date().toISOString()
    });

    setChatMessages((current) => [
      ...current,
      {
        id: createId(),
        sender: "app",
        text: "Lançamento salvo."
      }
    ]);

    setPendingTransaction(null);
  }

  function clearChat() {
    setChatMessages([]);
    setPendingTransaction(null);
    setMessage("");
  }

  return (
    <main
      className="screen"
      onTouchMove={(event) => {
        if (!(event.target as Element).closest(".chatArea")) {
          event.preventDefault();
        }
      }}
    >
      <ScreenHeader
        title="Lançar"
        menuOpen={menuOpen}
        onToggleMenu={onToggleMenu}
        onGoDashboard={onGoDashboard}
        onGoNew={onGoNew}
        onGoHistory={onGoHistory}
        onGoBackup={onGoBackup}
      />

      <div className="chatScreen">
        <div className="chatArea">
          {chatMessages.length === 0 && (
            <div className="emptyChat">
              <span>Pronto para lançar.</span>
              <p>Ex: gastei 400 espetinho do shopping ontem</p>
            </div>
          )}

          {chatMessages.map((item) => {
            if (item.sender === "user") {
              return (
                <div key={item.id} className="chatBubble userBubble">
                  <p>{item.text}</p>
                </div>
              );
            }

            return (
              <div
                key={item.id}
                className={`chatBubble appBubble ${item.parsed ? "previewBubble" : ""
                  }`}
              >
                <p>{item.text}</p>

                {item.parsed && (
                  <>
                    <strong>
                      {item.parsed.type === "expense" ? "Saída" : "Entrada"} ·{" "}
                      {formatCurrency(item.parsed.amount)}
                    </strong>

                    <p>{item.parsed.description}</p>
                    <p>{formatDate(item.parsed.date)}</p>

                    {pendingTransaction === item.parsed && (
                      <div className="previewActions">
                        <button
                          type="button"
                          className="primary"
                          onClick={savePendingTransaction}
                        >
                          Salvar
                        </button>

                        <button
                          type="button"
                          className="secondaryButton"
                          onClick={clearChat}
                        >
                          Limpar
                        </button>
                      </div>
                    )}
                  </>
                )}

                {item.error && <p>{item.error}</p>}
              </div>
            );
          })}
        </div>

        <div className="chatInputBar">
          <div className="chatInputField">
            <input
              ref={inputRef}
              value={message}
              onChange={(event) => setMessage(event.target.value)}
              onFocus={() => setInputFocused(true)}
              onBlur={() => setInputFocused(false)}
              onKeyDown={(event) => {
                if (event.key === "Enter") {
                  event.preventDefault();
                  sendMessage();
                }
              }}
              placeholder="Digite um lançamento..."
              inputMode="text"
            />

            {!inputFocused && (
              <button
                className="chatInputOverlay"
                type="button"
                aria-label="Focar campo de lançamento"
                onPointerDown={(event) => event.preventDefault()}
                onPointerUp={() =>
                  inputRef.current?.focus({ preventScroll: true })
                }
                onContextMenu={(event) => event.preventDefault()}
              />
            )}
          </div>

          <button className="chatSendButton" type="button" onClick={sendMessage}>
            Enviar
          </button>
        </div>
      </div>
    </main>
  );
}
