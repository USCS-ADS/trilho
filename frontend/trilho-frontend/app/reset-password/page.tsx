import { AuthPanel } from "@/app/components/auth-panel";
import { Stepper } from "@/app/components/stepper";
import { RequestResetForm } from "./request-reset-form";

export default function RequestResetPage() {
  return (
    <main className="flex min-h-screen flex-col bg-trilho-bg md:flex-row">
      <AuthPanel
        title="Redefinir senha"
        description="Informe o e-mail da sua conta e enviaremos um código de verificação para você criar uma nova senha."
      />

      <section className="flex w-full flex-col justify-center p-8 md:w-[55%]">
        <div className="mx-auto w-full max-w-md">
          <Stepper totalSteps={3} currentStep={1} />

          <h1 className="mb-2 text-2xl font-semibold text-trilho-text">
            Informe seu e-mail
          </h1>
          <p className="mb-6 text-sm text-trilho-dim">
            Enviaremos um código de 6 dígitos para confirmar que é você.
          </p>

          <RequestResetForm />
        </div>
      </section>
    </main>
  );
}
