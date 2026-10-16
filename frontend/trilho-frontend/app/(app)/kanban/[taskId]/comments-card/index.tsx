"use client";

import { Avatar } from "@/app/components/avatar";
import { Button } from "@/app/components/button";
import { Card, CardTitle } from "@/app/components/card";
import { useCurrentUser } from "@/app/components/current-user";
import { Textarea } from "@/app/components/textarea";
import { FormEvent, useRef, useState } from "react";
import { createCommentAction } from "../actions";

export interface CommentView {
    id: string;
    authorName: string;
    authorInitials: string;
    body: string;
}

interface CommentsCardProps {
    taskId: string;
    initialComments: CommentView[];
}

export function CommentsCard({ taskId, initialComments }: CommentsCardProps) {
    const currentUser = useCurrentUser();
    const [comments, setComments] = useState(initialComments);
    const [draft, setDraft] = useState("");
    const [error, setError] = useState<string>();
    const [isSaving, setIsSaving] = useState(false);
    const localIdCounter = useRef(0);

    async function handleSubmit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        const body = draft.trim();
        if (!body) return;

        setError(undefined);
        setIsSaving(true);
        const result = await createCommentAction(taskId, body);
        setIsSaving(false);

        if (!result.ok) {
            setError(result.message);
            return;
        }

        // Sem API (modo demonstração) o comentário existe só no cliente.
        localIdCounter.current += 1;

        setComments((previous) => [
            ...previous,
            {
                id: result.comment?.id ?? `local-comment-${localIdCounter.current}`,
                authorName: result.comment?.authorName ?? currentUser?.name ?? "Você",
                authorInitials: currentUser?.initials ?? "US",
                body,
            },
        ]);
        setDraft("");
    }

    return (
        <Card>
            <CardTitle>Comentários</CardTitle>

            {comments.length === 0 ? (
                <p className="mb-4 text-sm text-trilho-dim">Ainda não há comentários.</p>
            ) : (
                <ul className="mb-5 flex flex-col gap-4">
                    {comments.map((comment) => (
                        <li key={comment.id} className="flex items-start gap-3">
                            <Avatar initials={comment.authorInitials} />
                            <div className="min-w-0 flex-1 rounded-lg bg-trilho-surface-2 px-4 py-3">
                                <p className="text-sm font-semibold text-trilho-text">
                                    {comment.authorName}
                                </p>
                                <p className="mt-1 text-sm text-trilho-text">{comment.body}</p>
                            </div>
                        </li>
                    ))}
                </ul>
            )}

            <form onSubmit={handleSubmit}>
                <Textarea
                    name="comment"
                    value={draft}
                    onChange={(event) => setDraft(event.target.value)}
                    placeholder="Escreva um comentário"
                    aria-label="Novo comentário"
                />
                {error && (
                    <p role="alert" className="mb-2 text-sm text-trilho-danger">
                        {error}
                    </p>
                )}
                <div className="flex justify-end">
                    <Button type="submit" className="text-sm" disabled={!draft.trim() || isSaving}>
                        {isSaving ? "Enviando..." : "Comentar"}
                    </Button>
                </div>
            </form>
        </Card>
    );
}
