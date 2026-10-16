"use client";

import { createContext, ReactNode, useContext } from "react";

export interface CurrentUserView {
    name: string;
    initials: string;
    email: string;
    isAdmin: boolean;
}

const CurrentUserContext = createContext<CurrentUserView | null>(null);

/** Expõe o usuário autenticado (resolvido no servidor) para componentes de cliente. */
export function CurrentUserProvider({
    user,
    children,
}: {
    user: CurrentUserView;
    children: ReactNode;
}) {
    return <CurrentUserContext.Provider value={user}>{children}</CurrentUserContext.Provider>;
}

/** `null` fora do grupo autenticado (ex: páginas públicas). */
export function useCurrentUser() {
    return useContext(CurrentUserContext);
}
