import { EmptyState } from "@/app/components/empty-state";
import { LinkButton } from "@/app/components/link-button";

export default function TaskNotFound() {
  return (
    <EmptyState
      title="Tarefa não encontrada"
      description="Ela pode ter sido removida, ou ainda não foi salva (tarefas criadas só no navegador não têm página de detalhe)."
      action={<LinkButton href="/kanban">Voltar ao quadro Kanban</LinkButton>}
    />
  );
}
