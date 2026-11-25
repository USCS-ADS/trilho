import { isMockMode } from "@/app/lib/api/config";
import { AuthPanel } from "../components/auth-panel";
import { LoginForm } from "./login-form";

const NOTICES: Record<string, { text: string; tone: "success" | "warning" }> = {
  activated: {
    text: "Conta ativada! Entre com o e-mail do convite e a senha que você definiu.",
    tone: "success",
  },
  reset: { text: "Senha redefinida! Entre com a nova senha.", tone: "success" },
  expired: { text: "Sua sessão expirou. Entre novamente para continuar.", tone: "warning" },
};

export default async function LoginPage(props: PageProps<"/login">) {
  const query = await props.searchParams;
  const notice = Object.keys(NOTICES).find((key) => query[key] === "1");

  const demoHint = isMockMode
    ? "Modo demonstração (sem backend): entre com camila.duarte@exemplo.com e qualquer senha."
    : undefined;

  return (
    <main className="flex min-h-screen flex-col bg-trilho-bg md:flex-row">
      <AuthPanel
        title="Trilho"
        description="Gestão inteligente de times e projetos de desenvolvimento. Kanban colaborativo, priorização por IA e integração nativa com Git."
      />

      <section className="flex w-full flex-col justify-center p-8 md:w-[55%]">
        <div className="mx-auto w-full max-w-md">
          <h1 className="mb-2 text-2xl font-semibold text-trilho-text">
            Bem-vindo(a) de volta
          </h1>
          <p className="mb-6 text-trilho-dim">
            Entre com sua conta para continuar
          </p>

          {notice && (
            <p
              role="status"
              className={`mb-4 rounded-lg border px-3 py-2 text-sm ${
                NOTICES[notice].tone === "success"
                  ? "border-trilho-success/30 bg-trilho-success/10 text-trilho-success"
                  : "border-trilho-warning/30 bg-trilho-warning/10 text-trilho-warning"
              }`}
            >
              {NOTICES[notice].text}
            </p>
          )}

          <LoginForm demoHint={demoHint} />
        </div>
      </section>
    </main>
  );
}
