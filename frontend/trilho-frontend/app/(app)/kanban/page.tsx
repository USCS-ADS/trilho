import { PageHeader } from "../../components/page-header";
import { KanbanBoard } from "./kanban-board";

// TODO: buscar os dados reais do time selecionado via API.
const board = {
  teamName: "Backend",
  memberCount: 4,
  leaderName: "Ana Luiza",
};

export default function KanbanPage() {
  return (
    <>
      <PageHeader
        title="Quadro Kanban"
        description={`Time ${board.teamName} · ${board.memberCount} membros · líder: ${board.leaderName}`}
        actions={
          <span className="rounded-full bg-trilho-accent-2/15 px-3 py-1 text-xs font-medium text-trilho-accent-2">
            Time {board.teamName}
          </span>
        }
      />

      <div className="p-8">
        <KanbanBoard />
      </div>
    </>
  );
}
