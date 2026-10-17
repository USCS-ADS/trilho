import type { Team, User } from "./types";

// Dados do MODO DEMONSTRAÇÃO (sem API_URL). Com a API ligada, vêm de /api/User e /api/Team.

export const USERS: User[] = [
    {
        id: "camila-duarte",
        name: "Camila Duarte",
        initials: "CD",
        email: "camila.duarte@exemplo.com",
        role: "admin",
    },
    {
        id: "ana-luiza",
        name: "Ana Luiza",
        initials: "AL",
        email: "ana.luiza@exemplo.com",
        role: "leader",
    },
    {
        id: "vitor-medina",
        name: "Vitor Medina",
        initials: "VM",
        email: "vitor.medina@exemplo.com",
        role: "member",
    },
    {
        id: "raphael-carneiro",
        name: "Raphael Carneiro",
        initials: "RC",
        email: "raphael.carneiro@exemplo.com",
        role: "leader",
    },
    {
        id: "giovanna-tamos",
        name: "Giovanna Tamos",
        initials: "GT",
        email: "giovanna.tamos@exemplo.com",
        role: "leader",
    },
    {
        id: "arthur-rodrigues",
        name: "Arthur Rodrigues",
        initials: "AR",
        email: "arthur.rodrigues@exemplo.com",
        role: "leader",
    },
    {
        id: "joao-pedro",
        name: "João Pedro Alves",
        initials: "JP",
        email: "joao.alves@exemplo.com",
        role: "member",
    },
];

export const TEAMS: Team[] = [
    {
        id: "backend",
        name: "Backend",
        description: "APIs, regras de negócio e integrações do Trilho.",
        leaderId: "ana-luiza",
        memberIds: ["ana-luiza", "vitor-medina", "raphael-carneiro", "joao-pedro"],
        tasksInProgress: 7,
        workload: 78,
    },
    {
        id: "frontend",
        name: "Frontend",
        description: "Interface web, design system e experiência do usuário.",
        leaderId: "raphael-carneiro",
        memberIds: ["raphael-carneiro", "giovanna-tamos", "joao-pedro"],
        tasksInProgress: 5,
        workload: 62,
    },
    {
        id: "dados",
        name: "Dados",
        description: "Pipelines de dados e infraestrutura de analytics.",
        leaderId: "giovanna-tamos",
        memberIds: ["giovanna-tamos", "raphael-carneiro", "arthur-rodrigues"],
        tasksInProgress: 6,
        workload: 91,
    },
    {
        id: "machine-learning",
        name: "Machine Learning",
        description: "Modelos de priorização e recomendação por IA.",
        leaderId: "arthur-rodrigues",
        memberIds: ["arthur-rodrigues", "vitor-medina"],
        tasksInProgress: 3,
        workload: 54,
    },
];
