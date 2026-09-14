import { AuthPanel } from "../components/auth-panel";
import { LoginForm } from "./login-form";

export default function LoginPage() {
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

          <LoginForm />
        </div>
      </section>
    </main>
  );
}
