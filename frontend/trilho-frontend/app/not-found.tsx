import { EmptyState } from "./components/empty-state";
import { LinkButton } from "./components/link-button";

export default function NotFound() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-trilho-bg">
      <EmptyState
        title="Página não encontrada"
        description="O endereço que você acessou não existe ou foi movido."
        action={<LinkButton href="/">Voltar ao início</LinkButton>}
      />
    </main>
  );
}
