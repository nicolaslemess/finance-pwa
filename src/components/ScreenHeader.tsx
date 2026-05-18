import { useState } from "react";

type ScreenHeaderProps = {
  title: string;
  menuOpen: boolean;
  onToggleMenu: () => void;

  onGoDashboard?: () => void;
  onGoNew?: () => void;
  onGoHistory?: () => void;
  onGoBackup?: () => void;
};

export function ScreenHeader({
  title,
  menuOpen,
  onToggleMenu,
  onGoDashboard,
  onGoNew,
  onGoHistory,
  onGoBackup
}: ScreenHeaderProps) {
  const [isClosing, setIsClosing] = useState(false);

  function toggleMenu() {
    if (!menuOpen) {
      setIsClosing(false);
    }

    onToggleMenu();
  }

  function closeMenu() {
    setIsClosing(true);

    window.setTimeout(() => {
      setIsClosing(false);
      onToggleMenu();
    }, 240);
  }

  function navigate(action?: () => void) {
    if (!action) return;

    setIsClosing(true);

    window.setTimeout(() => {
      setIsClosing(false);
      action();
    }, 240);
  }

  return (
    <>
      <header className="screenHeader">
        <h1>{title}</h1>

        <button
          className="settingsButton"
          type="button"
          aria-label="Abrir menu"
          onClick={toggleMenu}
        >
          <span />
          <span />
          <span />
        </button>
      </header>

      {menuOpen && (
        <div
          className={`sheetOverlay ${isClosing ? "isClosing" : ""}`}
          onClick={closeMenu}
        >
          <div
            className={`bottomSheet ${isClosing ? "isClosing" : ""}`}
            onClick={(event) => event.stopPropagation()}
          >
            <div className="sheetHandle" />

            <div className="sheetHeader">
              <span>Menu</span>

              <button type="button" onClick={closeMenu}>
                Fechar
              </button>
            </div>

            <div className="sheetOptions">
              <button type="button" onClick={() => navigate(onGoNew)}>
                Lançar
                <span>Registrar uma entrada ou saída</span>
              </button>

              <button type="button" onClick={() => navigate(onGoDashboard)}>
                Resumo
                <span>Ver saldo, entradas e saídas</span>
              </button>

              <button type="button" onClick={() => navigate(onGoHistory)}>
                Histórico
                <span>Consultar lançamentos salvos</span>
              </button>

              <button type="button" onClick={() => navigate(onGoBackup)}>
                Backup
                <span>Exportar ou importar seus dados</span>
              </button>

              <button type="button" disabled>
                Cartões
                <span>Em breve</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
