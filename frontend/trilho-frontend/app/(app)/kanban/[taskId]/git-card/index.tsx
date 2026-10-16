import { Card, CardTitle } from "@/app/components/card";
import { GitBranchIcon } from "@/app/components/icons";
import type { TaskGitLink } from "@/app/lib/tasks/types";

export function GitCard({ git }: { git?: TaskGitLink }) {
    if (!git) {
        return (
            <Card>
                <CardTitle>Integração Git</CardTitle>
                <p className="text-sm text-trilho-dim">
                    Nenhuma branch ou pull request vinculado a esta tarefa.
                </p>
            </Card>
        );
    }

    const pullRequest = git.pullRequest;

    return (
        <Card>
            <CardTitle>Integração Git</CardTitle>

            <span className="mb-4 inline-flex items-center gap-1.5 rounded-full bg-trilho-accent-2/15 px-3 py-1 text-xs font-medium text-trilho-accent-2">
                <GitBranchIcon className="h-3.5 w-3.5" />
                {git.branch}
            </span>

            <dl className="flex flex-col gap-3 text-sm">
                <div className="flex items-center justify-between gap-3">
                    <dt className="text-trilho-dim">Pull Request</dt>
                    <dd className="text-trilho-text">
                        {pullRequest
                            ? `#${pullRequest.number} ${pullRequest.state === "open" ? "aberto" : "mesclado"}`
                            : "—"}
                    </dd>
                </div>
                <div className="flex items-center justify-between gap-3">
                    <dt className="text-trilho-dim">Último commit</dt>
                    <dd className="text-trilho-text">{git.lastCommit}</dd>
                </div>
            </dl>

            {pullRequest?.state === "open" && (
                <p className="mt-4 text-xs text-trilho-dim">
                    Ao mesclar o PR, esta tarefa será movida automaticamente para
                    &quot;Concluído&quot;.
                </p>
            )}
        </Card>
    );
}
