import { useEffect, useState } from "react";

type ScreenHeaderProps = {
  title: string;
  menuOpen: boolean;
  onToggleMenu: () => void;
  onGoBackup: () => void;
};

export function ScreenHeader({
  title,
  menuOpen,
  onToggleMenu,
  onGoBackup
}: ScreenHeaderProps) {
  const [isClosing, setIsClosing] = useState(false);

  useEffect(() => {
    if (menuOpen) {
      setIsClosing(false);
    }
  }, [menuOpen]);

  function closeMenu() {
    setIsClosing(true);

    window.setTimeout(() => {
      setIsClosing(false);
      onToggleMenu();
    }, 240);
  }

  function goBackup() {
    setIsClosing(true);

    window.setTimeout(() => {
      setIsClosing(false);
      onGoBackup();
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
          onClick={onToggleMenu}
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
              <span>Opções</span>

              <button type="button" onClick={closeMenu}>
                X
              </button>
            </div>

            <div className="sheetOptions">
              <button type="button" onClick={goBackup}>
                Backup
                <span>Exportar ou importar seus dados</span>
              </button>

              <button type="button" disabled>
                Temas
                <span>Em breve</span>
              </button>

              <button type="button" disabled>
                Configurações
                <span>Em breve</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}