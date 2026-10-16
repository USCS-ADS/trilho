/** "2026-09-02" -> "02/09/2026" (sem passar por Date, pra não sofrer com fuso). */
export function formatDate(isoDate: string) {
    const [year, month, day] = isoDate.split("-");
    return `${day}/${month}/${year}`;
}

/** Diferença em dias inteiros entre duas datas ISO (`to - from`). */
export function daysBetween(fromIsoDate: string, toIsoDate: string) {
    const millisecondsPerDay = 24 * 60 * 60 * 1000;
    return Math.round((Date.parse(toIsoDate) - Date.parse(fromIsoDate)) / millisecondsPerDay);
}

/** Hoje (UTC) em ISO "YYYY-MM-DD" — o mesmo critério de "hoje" que o backend usa para atraso. */
export function todayIso() {
    return new Date().toISOString().slice(0, 10);
}

/** "há 3 horas", "há 2 dias"... a partir de um instante ISO (UTC). */
export function formatRelative(isoInstant: string, now: Date = new Date()) {
    const seconds = Math.max(0, Math.round((now.getTime() - Date.parse(isoInstant)) / 1000));

    if (seconds < 60) return "agora há pouco";

    const units: [number, string, string][] = [
        [60 * 60 * 24 * 30, "mês", "meses"],
        [60 * 60 * 24, "dia", "dias"],
        [60 * 60, "hora", "horas"],
        [60, "minuto", "minutos"],
    ];

    for (const [size, singular, plural] of units) {
        if (seconds >= size) {
            const value = Math.floor(seconds / size);
            return `há ${value} ${value === 1 ? singular : plural}`;
        }
    }

    return "agora há pouco";
}
