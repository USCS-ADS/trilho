"use client";

import { Button } from "@/app/components/button";
import { ModalFooter } from "@/app/components/modal";
import { Select } from "@/app/components/select";
import { WEBHOOK_EVENT_LABELS, WEBHOOK_EVENTS } from "@/app/lib/git-integrations/meta";
import type { GitRepository, GitWebhookEvent } from "@/app/lib/git-integrations/types";
import { useFormValidation } from "@/app/lib/validation/use-form-validation";
import { FormEvent, useState } from "react";
import { configureRepositorySchema } from "../schema";

export interface RepositorySettings {
    teamId: string;
    events: GitWebhookEvent[];
}

interface ConfigureRepositoryFormProps {
    repository: GitRepository;
    teams: { id: string; name: string }[];
    onSave: (settings: RepositorySettings) => void;
    onRetrySync: () => void;
    onDisconnect: () => void;
    onCancel: () => void;
}

export function ConfigureRepositoryForm({
    repository,
    teams,
    onSave,
    onRetrySync,
    onDisconnect,
    onCancel,
}: ConfigureRepositoryFormProps) {
    const [teamId, setTeamId] = useState(repository.teamId);
    const [events, setEvents] = useState<GitWebhookEvent[]>(repository.events);
    const { errors, validateValues, clearError } = useFormValidation(configureRepositorySchema);

    function toggleEvent(event: GitWebhookEvent) {
        clearError("events");
        setEvents((previous) =>
            previous.includes(event)
                ? previous.filter((item) => item !== event)
                : [...previous, event],
        );
    }

    function handleSubmit(submitEvent: FormEvent<HTMLFormElement>) {
        submitEvent.preventDefault();
        const data = validateValues({ teamId, events });
        if (!data) return;

        // TODO: chamar a API que atualiza o webhook/vínculo do repositório.
        onSave(data);
    }

    return (
        <form onSubmit={handleSubmit} noValidate>
            <p className="mb-4 text-sm text-trilho-dim">
                Repositório <strong className="text-trilho-text">{repository.fullName}</strong>
            </p>

            {repository.status === "error" && (
                <div className="mb-4 flex flex-wrap items-center justify-between gap-3 rounded-lg border border-trilho-danger/30 bg-trilho-danger/10 px-3 py-2 text-sm text-trilho-danger">
                    <span>
                        A última sincronização falhou ({repository.lastSync}). As atualizações
                        automáticas ficam em fila até a conexão voltar.
                    </span>
                    <Button
                        type="button"
                        variant="danger"
                        className="text-xs"
                        onClick={onRetrySync}
                    >
                        Tentar novamente
                    </Button>
                </div>
            )}

            <Select
                name="teamId"
                label="Time responsável"
                value={teamId}
                onChange={(event) => setTeamId(event.target.value)}
                options={teams.map((team) => ({ value: team.id, label: team.name }))}
            />

            <fieldset className="mb-2">
                <legend className="mb-2 block text-xs font-medium uppercase tracking-wide text-trilho-dim">
                    Eventos do webhook
                </legend>

                <div className="flex flex-col gap-2">
                    {WEBHOOK_EVENTS.map((event) => (
                        <label
                            key={event}
                            className="flex cursor-pointer items-center gap-2 text-sm text-trilho-text"
                        >
                            <input
                                type="checkbox"
                                checked={events.includes(event)}
                                onChange={() => toggleEvent(event)}
                                className="h-4 w-4 accent-trilho-accent"
                            />
                            {WEBHOOK_EVENT_LABELS[event]}
                        </label>
                    ))}
                </div>

                {errors.events && (
                    <p role="alert" className="mt-2 text-xs text-trilho-danger">
                        {errors.events}
                    </p>
                )}
            </fieldset>

            <ModalFooter>
                <Button
                    type="button"
                    variant="danger"
                    className="mr-auto"
                    onClick={onDisconnect}
                >
                    Desconectar
                </Button>
                <Button type="button" variant="secondary" onClick={onCancel}>
                    Cancelar
                </Button>
                <Button type="submit">Salvar</Button>
            </ModalFooter>
        </form>
    );
}
