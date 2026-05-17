import { useRef, useState } from "react";
import { db } from "../db/database";
import type { Transaction } from "../types/transaction";
import { ScreenHeader } from "../components/ScreenHeader";

type BackupProps = {
  menuOpen: boolean;
  onToggleMenu: () => void;
  onGoBackup: () => void;
};

type BackupFile = {
  app: "finance-pwa";
  version: 1;
  exportedAt: string;
  data: {
    transactions: Transaction[];
  };
};

export function Backup({
  menuOpen,
  onToggleMenu,
  onGoBackup
}: BackupProps) {
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [status, setStatus] = useState("");

  async function exportBackup() {
    try {
      const transactions = await db.transactions.toArray();

      const backup: BackupFile = {
        app: "finance-pwa",
        version: 1,
        exportedAt: new Date().toISOString(),
        data: {
          transactions
        }
      };

      const fileName = `backup-financas-${new Date()
        .toISOString()
        .slice(0, 10)}.json`;

      const file = new File([JSON.stringify(backup, null, 2)], fileName, {
        type: "application/json"
      });

      if (navigator.canShare && navigator.canShare({ files: [file] })) {
        await navigator.share({
          title: "Backup Finanças",
          text: "Backup dos dados do app de finanças.",
          files: [file]
        });

        setStatus("Backup compartilhado.");
        return;
      }

      const url = URL.createObjectURL(file);
      const link = document.createElement("a");

      link.href = url;
      link.download = fileName;
      link.click();

      URL.revokeObjectURL(url);

      setStatus("Backup baixado.");
    } catch (error) {
      console.error(error);
      setStatus("Erro ao exportar backup.");
    }
  }

  function openImportFile() {
    fileInputRef.current?.click();
  }

  async function importBackup(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];

    if (!file) return;

    try {
      const text = await file.text();
      const backup = JSON.parse(text) as BackupFile;

      if (backup.app !== "finance-pwa" || backup.version !== 1) {
        setStatus("Arquivo de backup inválido.");
        return;
      }

      if (!Array.isArray(backup.data.transactions)) {
        setStatus("Backup sem dados válidos.");
        return;
      }

      const confirmImport = window.confirm(
        "Isso vai substituir todos os lançamentos atuais pelos dados do backup. Deseja continuar?"
      );

      if (!confirmImport) {
        setStatus("Importação cancelada.");
        event.target.value = "";
        return;
      }

      await db.transaction("rw", db.transactions, async () => {
        await db.transactions.clear();
        await db.transactions.bulkAdd(backup.data.transactions);
      });

      setStatus("Backup importado com sucesso.");
      event.target.value = "";
    } catch (error) {
      console.error(error);
      setStatus("Erro ao importar backup.");
      event.target.value = "";
    }
  }

  return (
    <main className="screen">
      <ScreenHeader
        title="Backup"
        menuOpen={menuOpen}
        onToggleMenu={onToggleMenu}
        onGoBackup={onGoBackup}
      />

      <div className="scrollArea">
        <section className="card hero">
          <span>Segurança local</span>
          <strong>Exportar dados</strong>
        </section>

        <section className="backupActions">
          <button className="primary" type="button" onClick={exportBackup}>
            Compartilhar backup
          </button>

          <button
            className="secondaryButton"
            type="button"
            onClick={openImportFile}
          >
            Importar backup
          </button>

          <input
            ref={fileInputRef}
            type="file"
            accept="application/json,.json"
            onChange={importBackup}
            hidden
          />
        </section>

        <section className="card">
          <span>Como usar</span>
          <p>
            Exporte seu backup e salve em uma pasta pessoal no Drive ou iCloud.
            Para restaurar, importe o arquivo JSON salvo.
          </p>
        </section>

        {status && <p className="statusText">{status}</p>}
      </div>
    </main>
  );
}