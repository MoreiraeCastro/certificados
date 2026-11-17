import { SetPasswordForm } from "./set-password-form";

export default function SetPasswordPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-canvas px-4">
      <div className="card w-full max-w-sm p-8">
        <h1 className="text-[18px] font-semibold tracking-[-0.015em] text-[#141d28]">Defina sua senha</h1>
        <p className="mt-1 mb-6 text-sm text-slate-500">
          Escolha uma senha para acessar o sistema de certificados digitais.
        </p>
        <SetPasswordForm />
      </div>
    </div>
  );
}
