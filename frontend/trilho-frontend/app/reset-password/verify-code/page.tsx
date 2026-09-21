import { AuthPanel } from "@/app/components/auth-panel";
import { Stepper } from "@/app/components/stepper";
import { VerifyCodeForm } from "./verify-code-form";

// TODO: obter o e-mail real da solicitação de redefinição de senha (via
// token/query da URL ou sessão) e passar para maskEmail abaixo.
const requestedEmail = "";

/** Mascara um e-mail para exibição (ex: "camila@nexus.com" -> "c****a@nexus.com"). */
function maskEmail(email: string) {
  const [user, domain] = email.split("@");
  if (!user || !domain) return "";

  const visibleStart = user.slice(0, 1);
  const visibleEnd = user.length > 1 ? user.slice(-1) : "";
  const masked = "*".repeat(Math.max(user.length - visibleStart.length - visibleEnd.length, 1));

  return `${visibleStart}${masked}${visibleEnd}@${domain}`;
}

export default function VerifyResetCodePage() {
  const maskedEmail = maskEmail(requestedEmail);

  return (
    <main className="flex min-h-screen flex-col bg-trilho-bg md:flex-row">
      <AuthPanel
        title="Redefinir senha"
        description="Enviamos um código de verificação de 6 dígitos para o seu e-mail cadastrado. Ele é válido por 15 minutos."
      />

      <section className="flex w-full flex-col justify-center p-8 md:w-[55%]">
        <div className="mx-auto w-full max-w-md">
          <Stepper totalSteps={3} currentStep={2} />

          <h1 className="mb-2 text-2xl font-semibold text-trilho-text">
            Confirme o código
          </h1>
          <p className="mb-6 text-sm text-trilho-dim">
            {maskedEmail
              ? `Enviado para ${maskedEmail}`
              : "Enviamos um código para o seu e-mail."}
          </p>

          <VerifyCodeForm />
        </div>
      </section>
    </main>
  );
}
