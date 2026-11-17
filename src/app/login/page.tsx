import { LoginForm } from "./login-form";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string; error?: string }>;
}) {
  const { next, error } = await searchParams;

  return (
    <div className="flex min-h-screen items-center justify-center bg-canvas px-4">
      <div className="card w-full max-w-sm p-8">
        <h1 className="text-[18px] font-semibold tracking-[-0.015em] text-[#141d28]">Certificados Digitais</h1>
        <p className="mt-1 mb-6 text-sm text-slate-500">
          Acesso interno do escritório. Entre com suas credenciais.
        </p>
        {error === "convite_invalido" && (
          <p className="mb-4 alert alert-warn">
            Este link de convite é inválido ou expirou. Peça um novo convite a um administrador.
          </p>
        )}
        <LoginForm next={next ?? "/"} />
      </div>
    </div>
  );
}
