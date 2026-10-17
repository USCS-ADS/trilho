import type { TeamActionResult } from "../actions";

/** Executa uma ação do servidor; devolve `true` se deu certo (a mensagem de erro fica no modal). */
export type RunTeamAction = (action: () => Promise<TeamActionResult>) => Promise<boolean>;
