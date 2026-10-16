"use client";

import dynamic from "next/dynamic";
import { BoardSkeleton } from "./board-skeleton";

/**
 * O board é carregado só no cliente (`ssr: false`): o dnd-kit gera
 * atributos de acessibilidade (aria-describedby) a partir de um contador
 * que o Strict Mode do React incrementa de forma diferente no servidor e no
 * cliente, causando um mismatch de hidratação inofensivo mas ruidoso. Sem
 * renderizar essa árvore no servidor, não há nada pra dessincronizar — e a
 * interatividade de arrastar cards não tem valor durante o SSR de qualquer
 * forma (página autenticada, sem necessidade de SEO).
 */
export const KanbanBoard = dynamic(() => import("./board").then((mod) => mod.KanbanBoard), {
    ssr: false,
    loading: () => <BoardSkeleton />,
});
