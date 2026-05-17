import { useState } from "react";
import { Dashboard } from "./screens/Dashboard";
import { NewTransaction } from "./screens/NewTransaction";
import { History } from "./screens/History";
import { Backup } from "./screens/Backup";

type Screen = "dashboard" | "new" | "history" | "backup";

export default function App() {
  const [screen, setScreen] = useState<Screen>("dashboard");
  const [menuOpen, setMenuOpen] = useState(false);

  function goToScreen(nextScreen: Screen) {
    setScreen(nextScreen);
    setMenuOpen(false);
  }

  const headerProps = {
    menuOpen,
    onToggleMenu: () => setMenuOpen((current) => !current),
    onGoBackup: () => goToScreen("backup")
  };

  return (
    <div className="app">
      {screen === "dashboard" && <Dashboard {...headerProps} />}

      {screen === "new" && (
        <NewTransaction
          {...headerProps}
          onSaved={() => goToScreen("dashboard")}
        />
      )}

      {screen === "history" && <History {...headerProps} />}
      {screen === "backup" && <Backup {...headerProps} />}

      <nav className="bottomNav">
        <button onClick={() => goToScreen("dashboard")}>Início</button>

        <button className="addButton" onClick={() => goToScreen("new")}>
          +
        </button>

        <button onClick={() => goToScreen("history")}>Histórico</button>
      </nav>
    </div>
  );
}