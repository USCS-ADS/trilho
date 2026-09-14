import { AuthPanel } from "../components/auth-panel";
import { ActivateAccountForm } from "./activate-account-form";

// TODO: buscar os dados reais do convite (nome, time, e-mail) a partir de um
// token na URL, via chamada à API, e passar para AuthPanel/ActivateAccountForm.
const invite = {
  fullName: "",
  team: "Desenvolvimento",
  email: "",
};

export default function ActivateAccountPage() {
  return (
    <main className="flex min-h-screen flex-col bg-trilho-bg md:flex-row">
      <AuthPanel
        title="Bem-vindo(a)!"
        description={
          <>
            Você foi convidado(a) para integrar o time de{" "}
            <strong className="text-trilho-text">{invite.team}</strong> da sua
            empresa no Trilho.
          </>
        }
      />

      <section className="flex w-full flex-col justify-center p-8 md:w-[55%]">
        <div className="mx-auto w-full max-w-md">
          <h1 className="mb-2 text-2xl font-semibold text-trilho-text">
            Ativar sua conta
          </h1>
          <p className="mb-6 text-trilho-dim">
            Confirme seus dados e defina uma senha de acesso
          </p>

          <ActivateAccountForm
            defaultFullName={invite.fullName}
            team={invite.team}
            email={invite.email}
          />
        </div>
      </section>
    </main>
  );
}
