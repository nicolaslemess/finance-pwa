import { useState } from "react";
import { Dashboard } from "./screens/Dashboard";
import { NewTransaction } from "./screens/NewTransaction";
import { History } from "./screens/History";

type Screen = "dashboard" | "new" | "history";

export default function App() {
  const [screen, setScreen] = useState<Screen>("dashboard");

  return (
    <div className="app">
      {screen === "dashboard" && <Dashboard />}
      {screen === "new" && (
        <NewTransaction onSaved={() => setScreen("dashboard")} />
      )}
      {screen === "history" && <History />}

      <nav className="bottomNav">
        <button onClick={() => setScreen("dashboard")}>Início</button>
        <button className="addButton" onClick={() => setScreen("new")}>
          +
        </button>
        <button onClick={() => setScreen("history")}>Histórico</button>
      </nav>
    </div>
  );
}