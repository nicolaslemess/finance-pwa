import { useEffect, useState } from "react";
import { Dashboard } from "./screens/Dashboard";
import { NewTransaction } from "./screens/NewTransaction";
import { History } from "./screens/History";
import { Backup } from "./screens/Backup";

type Screen = "dashboard" | "new" | "history" | "backup";

export type HeaderNavigationProps = {
  menuOpen: boolean;
  onToggleMenu: () => void;
  onGoDashboard: () => void;
  onGoNew: () => void;
  onGoHistory: () => void;
  onGoBackup: () => void;
};

export default function App() {
  const [screen, setScreen] = useState<Screen>("new");
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const viewport = window.visualViewport;

    if (!viewport) return;
    const visualViewport = viewport;
    let maxViewportHeight = visualViewport.height;

    function syncVisualViewport() {
      maxViewportHeight = Math.max(maxViewportHeight, visualViewport.height);

      const keyboardOpen =
        maxViewportHeight - visualViewport.height > 120;

      document.documentElement.style.setProperty(
        "--visual-viewport-top",
        `${visualViewport.offsetTop}px`
      );
      document.documentElement.style.setProperty(
        "--visual-viewport-height",
        `${visualViewport.height}px`
      );
      document.documentElement.dataset.keyboardOpen = String(keyboardOpen);
    }

    syncVisualViewport();
    visualViewport.addEventListener("resize", syncVisualViewport);
    visualViewport.addEventListener("scroll", syncVisualViewport);

    return () => {
      visualViewport.removeEventListener("resize", syncVisualViewport);
      visualViewport.removeEventListener("scroll", syncVisualViewport);
      delete document.documentElement.dataset.keyboardOpen;
    };
  }, []);

  function goToScreen(nextScreen: Screen) {
    setScreen(nextScreen);
    setMenuOpen(false);
  }

  const headerProps: HeaderNavigationProps = {
    menuOpen,
    onToggleMenu: () => setMenuOpen((current) => !current),
    onGoDashboard: () => goToScreen("dashboard"),
    onGoNew: () => goToScreen("new"),
    onGoHistory: () => goToScreen("history"),
    onGoBackup: () => goToScreen("backup")
  };

  return (
    <div className="app">
      {screen === "dashboard" && <Dashboard {...headerProps} />}

      {screen === "new" && <NewTransaction {...headerProps} />}

      {screen === "history" && <History {...headerProps} />}
      {screen === "backup" && <Backup {...headerProps} />}
    </div>
  );
}
