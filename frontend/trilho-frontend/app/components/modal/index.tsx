"use client";

import { ReactNode, useEffect, useId, useRef } from "react";
import { XIcon } from "../icons";

interface ModalProps {
    open: boolean;
    onClose: () => void;
    title: string;
    children: ReactNode;
}

/**
 * Diálogo modal sobre o `<dialog>` nativo: o navegador cuida de prender o foco,
 * fechar com Esc e do backdrop. Os filhos só são montados enquanto aberto, então
 * o estado de formulários internos reseta a cada abertura.
 */
export function Modal({ open, onClose, title, children }: ModalProps) {
    const dialogRef = useRef<HTMLDialogElement>(null);
    const titleId = useId();

    useEffect(() => {
        const dialog = dialogRef.current;
        if (!dialog) return;

        if (open && !dialog.open) dialog.showModal();
        if (!open && dialog.open) dialog.close();
    }, [open]);

    return (
        <dialog
            ref={dialogRef}
            aria-labelledby={titleId}
            onClose={onClose}
            onClick={(event) => {
                // Clique no backdrop: o alvo é o próprio <dialog>, não o conteúdo.
                if (event.target === dialogRef.current) onClose();
            }}
            className="m-auto w-[calc(100%-2rem)] max-w-xl rounded-2xl border border-trilho-border bg-trilho-surface p-0 text-trilho-text shadow-trilho backdrop:bg-black/60 backdrop:backdrop-blur-sm"
        >
            {open && (
                <div>
                    <div className="flex items-center justify-between border-b border-trilho-border px-6 py-4">
                        <h2 id={titleId} className="text-lg font-semibold text-trilho-text">
                            {title}
                        </h2>
                        <button
                            type="button"
                            onClick={onClose}
                            aria-label="Fechar"
                            className="rounded-md p-1 text-trilho-dim transition-colors hover:bg-trilho-surface-2 hover:text-trilho-text"
                        >
                            <XIcon className="h-4 w-4" />
                        </button>
                    </div>

                    <div className="p-6">{children}</div>
                </div>
            )}
        </dialog>
    );
}

/** Rodapé de ações do modal (Cancelar / confirmar), alinhado à direita com divisória. */
export function ModalFooter({ children }: { children: ReactNode }) {
    return (
        <div className="-mx-6 -mb-6 mt-6 flex justify-end gap-3 border-t border-trilho-border px-6 py-4">
            {children}
        </div>
    );
}
