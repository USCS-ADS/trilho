import type { GitProvider, GitWebhookEvent } from "./types";

export const PROVIDER_LABELS: Record<GitProvider, string> = {
    github: "GitHub",
    gitlab: "GitLab",
};

export const PROVIDERS: GitProvider[] = ["github", "gitlab"];

export const WEBHOOK_EVENTS: GitWebhookEvent[] = ["commit", "pull_request", "merge"];

export const WEBHOOK_EVENT_LABELS: Record<GitWebhookEvent, string> = {
    commit: "Commit",
    pull_request: "Pull request",
    merge: "Merge",
};
