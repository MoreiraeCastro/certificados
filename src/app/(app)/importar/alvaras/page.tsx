import Link from "next/link";
import { AlvaraImportWizard } from "@/components/alvaras/import-wizard";

export default function ImportAlvarasPage() {
  return (
    <div className="max-w-4xl space-y-4">
      <div className="page-header">
        <div className="min-w-0">
          <h1 className="page-title">Importar alvarás</h1>
          <p className="page-subtitle">
            Envie a planilha de alvarás. O CNPJ/CPF de cada linha precisa já existir em Clientes -- este import nunca
            cria uma empresa nova.
          </p>
        </div>
        <Link href="/importar" className="btn btn-secondary">
          Importar empresas/certificados
        </Link>
      </div>

      <AlvaraImportWizard />
    </div>
  );
}
