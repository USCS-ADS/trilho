import { Badge } from "@/app/components/badge";
import { Button } from "@/app/components/button";
import { PROVIDER_LABELS } from "@/app/lib/git-integrations/meta";
import type { GitRepository } from "@/app/lib/git-integrations/types";

interface RepositoryRowProps {
    repository: GitRepository;
    teamName: string;
    /** Ausente = o usuário não gerencia o time deste repositório (só visualiza). */
    onConfigure?: () => void;
}

export function RepositoryRow({ repository, teamName, onConfigure }: RepositoryRowProps) {
    const hasError = repository.status === "error";
    const pending = repository.pendingEvents ?? 0;

    return (
        <li className="flex items-center gap-4 rounded-xl border border-trilho-border bg-trilho-surface px-4 py-3">
            <span
                title={PROVIDER_LABELS[repository.provider]}
                className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-trilho-surface-2 text-xs font-semibold text-trilho-accent-2"
            >
                {repository.provider === "github" ? "GH" : "GL"}
            </span>

            <div className="min-w-0 flex-1">
                <p className="truncate font-medium text-trilho-text">{repository.fullName}</p>
                <p className="truncate text-sm text-trilho-dim">
                    Time {teamName} · última sincronização: {repository.lastSync}
                    {pending > 0 && ` · ${pending} ${pending === 1 ? "evento na fila" : "eventos na fila"}`}
                </p>
            </div>

            <Badge tone={hasError ? "danger" : "success"}>
                {hasError ? "Erro de sincronização" : "Conectado"}
            </Badge>
            {onConfigure && (
                <Button
                    type="button"
                    variant="secondary"
                    className="shrink-0 text-sm"
                    onClick={onConfigure}
                >
                    Configurar
                </Button>
            )}
        </li>
    );
}
