import Link from "next/link";
import { ImportWizard } from "@/components/import/import-wizard";

export default function ImportPage() {
  return (
    <div className="max-w-4xl space-y-4">
      <div className="page-header">
        <div className="min-w-0">
          <h1 className="page-title">Importar planilha</h1>
          <p className="page-subtitle">
            Envie uma planilha de cadastro ou de certificados. Você escolhe o mapeamento das colunas no próximo passo.
          </p>
        </div>
        <div className="page-actions">
          <Link href="/importar/alvaras" className="btn btn-secondary">
            Importar alvarás
          </Link>
          <Link href="/importar/historico" className="btn btn-secondary">
            Histórico de importações
          </Link>
        </div>
      </div>

      <ImportWizard />
    </div>
  );
}
