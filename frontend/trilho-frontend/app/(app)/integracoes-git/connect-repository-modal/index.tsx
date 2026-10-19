"use client";

import { Button } from "@/app/components/button";
import { Modal, ModalFooter } from "@/app/components/modal";
import type { ConnectRepositoryInput, WebhookSetup } from "@/app/lib/git-integrations/types";
import { useState } from "react";
import { ConnectRepositoryForm } from "./connect-repository-form";

interface ConnectRepositoryModalProps {
    open: boolean;
    onClose: () => void;
    /** Devolve o erro, ou a URL/segredo do webhook (exibidos uma única vez). */
    onConnect: (input: ConnectRepositoryInput) => Promise<{ error?: string; webhook?: WebhookSetup }>;
    teams: { id: string; name: string }[];
}

async function copyToClipboard(text: string) {
    try {
        await navigator.clipboard.writeText(text);
    } catch {
        // Sem permissão da área de transferência: a pessoa copia manualmente do campo.
    }
}

export function ConnectRepositoryModal({ open, onClose, onConnect, teams }: ConnectRepositoryModalProps) {
    const [isPending, setIsPending] = useState(false);
    const [error, setError] = useState<string>();
    const [webhook, setWebhook] = useState<WebhookSetup>();

    function handleClose() {
        setError(undefined);
        setWebhook(undefined);
        onClose();
    }

    async function handleSubmit(input: ConnectRepositoryInput) {
        setIsPending(true);
        setError(undefined);

        const result = await onConnect(input);

        setIsPending(false);

        if (result.error) {
            setError(result.error);
            return;
        }

        // Com segredo, mostra as instruções do provedor antes de fechar.
        if (result.webhook) {
            setWebhook(result.webhook);
            return;
        }

        handleClose();
    }

    return (
        <Modal open={open} onClose={handleClose} title="Conectar Repositório">
            {webhook ? (
                <div>
                    <p className="mb-3 text-sm text-trilho-text">
                        Repositório conectado! No provedor, crie um webhook com os dados abaixo.
                    </p>

                    <dl className="mb-3 flex flex-col gap-3 text-sm">
                        {[
                            { label: "URL do webhook (Payload URL)", value: webhook.url },
                            { label: "Segredo (Secret)", value: webhook.secret },
                        ].map((item) => (
                            <div key={item.label}>
                                <dt className="mb-1 text-xs uppercase tracking-wide text-trilho-dim">
                                    {item.label}
                                </dt>
                                <dd className="flex items-center gap-2">
                                    <input
                                        readOnly
                                        value={item.value}
                                        aria-label={item.label}
                                        onFocus={(event) => event.currentTarget.select()}
                                        className="min-w-0 flex-1 rounded-lg border border-trilho-border bg-trilho-surface-2 p-2 font-mono text-xs text-trilho-text"
                                    />
                                    <Button
                                        type="button"
                                        variant="secondary"
                                        className="shrink-0 text-xs"
                                        onClick={() => void copyToClipboard(item.value)}
                                    >
                                        Copiar
                                    </Button>
                                </dd>
                            </div>
                        ))}
                    </dl>

                    <p className="rounded-lg border border-trilho-warning/30 bg-trilho-warning/10 px-3 py-2 text-xs text-trilho-warning">
                        Guarde o segredo agora: por segurança ele não é exibido de novo. Conteúdo:
                        application/json · eventos: push e pull request (GitHub) ou push e merge request
                        (GitLab, campo &quot;Secret token&quot;).
                    </p>

                    <ModalFooter>
                        <Button type="button" onClick={handleClose}>
                            Concluir
                        </Button>
                    </ModalFooter>
                </div>
            ) : (
                <ConnectRepositoryForm
                    teams={teams}
                    onSubmit={handleSubmit}
                    onCancel={handleClose}
                    isPending={isPending}
                    error={error}
                />
            )}
        </Modal>
    );
}
