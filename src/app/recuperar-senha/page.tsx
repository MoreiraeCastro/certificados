import { RecoverPasswordForm } from "./recover-password-form";

export default function RecoverPasswordPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-canvas px-4">
      <div className="card w-full max-w-sm p-8">
        <h1 className="text-[18px] font-semibold tracking-[-0.015em] text-[#141d28]">Esqueci minha senha</h1>
        <p className="mt-1 mb-6 text-sm text-slate-500">
          Informe seu e-mail e enviaremos um link para você redefinir a senha.
        </p>
        <RecoverPasswordForm />
      </div>
    </div>
  );
}
