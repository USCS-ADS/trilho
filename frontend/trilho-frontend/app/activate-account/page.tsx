import { isMockMode } from "@/app/lib/api/config";
import { lookupInvite, type InviteLookup } from "@/app/lib/api/invites";
import { toUserMessage } from "@/app/lib/api/errors";
import Link from "next/link";
import { AuthPanel } from "../components/auth-panel";
import { ActivateAccountForm } from "./activate-account-form";

// Convite fictício do modo demonstração (sem backend).
const DEMO_INVITE: InviteLookup = { fullName: "", teamName: "Desenvolvimento", email: "" };

export default async function ActivateAccountPage(props: PageProps<"/activate-account">) {
  const { token } = await props.searchParams;
  const inviteToken = typeof token === "string" ? token : undefined;

  let invite: InviteLookup | undefined;
  let error: string | undefined;

  if (isMockMode) {
    invite = DEMO_INVITE;
  } else if (inviteToken) {
    try {
      invite = await lookupInvite(inviteToken);
    } catch (lookupError) {
      error = toUserMessage(lookupError);
    }
  }

  return (
    <main className="flex min-h-screen flex-col bg-trilho-bg md:flex-row">
      <AuthPanel
        title="Bem-vindo(a)!"
        description={
          invite ? (
            <>
              Você foi convidado(a) para integrar o time de{" "}
              <strong className="text-trilho-text">{invite.teamName}</strong> da sua empresa no
              Trilho.
            </>
          ) : (
            "Ative sua conta para começar a usar o Trilho."
          )
        }
      />

      <section className="flex w-full flex-col justify-center p-8 md:w-[55%]">
        <div className="mx-auto w-full max-w-md">
          {invite ? (
            <>
              <h1 className="mb-2 text-2xl font-semibold text-trilho-text">Ativar sua conta</h1>
              <p className="mb-6 text-trilho-dim">
                Confirme seus dados e defina uma senha de acesso
              </p>

              <ActivateAccountForm
                inviteToken={inviteToken ?? ""}
                defaultFullName={invite.fullName}
                team={invite.teamName}
                email={invite.email}
              />
            </>
          ) : (
            <>
              <h1 className="mb-2 text-2xl font-semibold text-trilho-text">Convite indisponível</h1>
              <p role={error ? "alert" : undefined} className="mb-6 text-trilho-dim">
                {error ??
                  "Este link de convite é inválido, já foi usado ou expirou. Peça um novo convite a quem administra o seu time."}
              </p>
              <Link href="/login" className="text-sm text-trilho-accent hover:underline">
                Ir para o login
              </Link>
            </>
          )}
        </div>
      </section>
    </main>
  );
}
