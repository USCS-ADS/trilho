import { PageHeader } from "@/app/components/page-header";
import { fetchTaskActivity, fetchTask } from "@/app/lib/api/tasks";
import { fetchTeamById } from "@/app/lib/api/teams";
import { todayIso } from "@/app/lib/date";
import { isMockMode } from "@/app/lib/api/config";
import { getCurrentUser, verifySession } from "@/app/lib/session/dal";
import { MOCK_TODAY } from "@/app/lib/tasks";
import { isOverdue } from "@/app/lib/tasks/overdue";
import type { User } from "@/app/lib/teams/types";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ActivityCard } from "./activity-card";
import { AiSuggestionCard } from "./ai-suggestion-card";
import { CommentsCard } from "./comments-card";
import { DetailsCard } from "./details-card";
import { GitCard } from "./git-card";
import { SubtasksCard } from "./subtasks-card";
import { TaskActions } from "./task-actions";
import { TaskSummary } from "./task-summary";

export default async function TaskDetailPage(props: PageProps<"/kanban/[taskId]">) {
  const { taskId } = await props.params;
  const session = await verifySession();
  const currentUser = await getCurrentUser();

  const task = await fetchTask(taskId, session.token);
  if (!task) notFound();

  const [team, activity] = await Promise.all([
    fetchTeamById(task.teamId, session.token),
    fetchTaskActivity(task.id, session.token).catch(() => []),
  ]);

  const teamName = team?.name ?? "—";
  const membersById = new Map<string, User>((team?.members ?? []).map((member) => [member.id, member]));
  const userById = (userId?: string) => (userId ? membersById.get(userId) : undefined);

  // Editar: qualquer membro. Excluir e moderar comentários: administrador ou líder do time.
  const canManage = currentUser.role === "admin" || team?.leaderId === currentUser.id;

  return (
    <>
      <PageHeader
        title={`Tarefa #${task.number}`}
        description={
          <>
            Time {teamName} /{" "}
            <Link href={`/kanban?team=${task.teamId}`} className="hover:text-trilho-text hover:underline">
              Quadro Kanban
            </Link>{" "}
            / Tarefa
          </>
        }
        actions={
          <TaskActions
            taskId={task.id}
            teamId={task.teamId}
            task={{
              title: task.title,
              description: task.description,
              assigneeId: task.assigneeId,
              dueDate: task.dueDate,
              priority: task.priority,
            }}
            members={(team?.members ?? []).map((member) => ({ id: member.id, name: member.name }))}
            canDelete={canManage}
          />
        }
      />

      <div className="grid gap-6 p-8 lg:grid-cols-3">
        <div className="flex flex-col gap-6 lg:col-span-2">
          <TaskSummary
            task={task}
            teamName={teamName}
            creatorName={userById(task.createdById)?.name ?? task.createdByName ?? "—"}
          />

          <SubtasksCard
            taskId={task.id}
            initialSubtasks={task.subtasks.map((subtask) => ({
              id: subtask.id,
              title: subtask.title,
              done: subtask.done,
              assigneeInitials: userById(subtask.assigneeId)?.initials,
            }))}
          />

          <CommentsCard
            taskId={task.id}
            currentUserId={currentUser.id}
            canModerate={canManage}
            initialComments={task.comments.map((comment) => {
              const author = userById(comment.authorId);
              const name = author?.name ?? comment.authorName ?? "Usuário";
              return {
                id: comment.id,
                authorId: comment.authorId,
                authorName: name,
                authorInitials: author?.initials ?? name.slice(0, 2).toUpperCase(),
                body: comment.body,
              };
            })}
          />
        </div>

        <div className="flex flex-col gap-6">
          <DetailsCard
            task={task}
            teamName={teamName}
            assigneeName={userById(task.assigneeId)?.name ?? task.assigneeName}
            isOverdue={isOverdue(task, isMockMode ? MOCK_TODAY : todayIso())}
          />
          {task.aiSuggestion && <AiSuggestionCard suggestion={task.aiSuggestion} />}
          <GitCard git={task.git} />
          <ActivityCard
            entries={activity}
            usersById={Object.fromEntries([...membersById].map(([id, user]) => [id, user.name]))}
          />
        </div>
      </div>
    </>
  );
}
