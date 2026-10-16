import { AuthPanel } from "@/app/components/auth-panel";
import { Stepper } from "@/app/components/stepper";
import { NewPasswordForm } from "./new-password-form";

export default function NewPasswordPage() {
  return (
    <main className="flex min-h-screen flex-col bg-trilho-bg md:flex-row">
      <AuthPanel
        title="Redefinir senha"
        description="Quase lá! Escolha uma nova senha segura para voltar a acessar o Trilho."
      />

      <section className="flex w-full flex-col justify-center p-8 md:w-[55%]">
        <div className="mx-auto w-full max-w-md">
          <Stepper totalSteps={3} currentStep={3} />

          <h1 className="mb-2 text-2xl font-semibold text-trilho-text">
            Crie uma nova senha
          </h1>
          <p className="mb-6 text-sm text-trilho-dim">
            Defina uma senha que atenda a todos os requisitos abaixo.
          </p>

          <NewPasswordForm />
        </div>
      </section>
    </main>
  );
}
