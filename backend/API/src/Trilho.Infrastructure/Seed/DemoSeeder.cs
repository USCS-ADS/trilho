using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Trilho.Domain.Entities;
using Trilho.Domain.Enum;
using Trilho.Domain.Security.Cryptography;
using Trilho.Infrastructure.DataAcess;

namespace Trilho.Infrastructure.Seed;
public static class DemoSeeder
{
    private const string LeaderEmail = "lider@trilho.demo";

    /// <summary>
    /// Dados de demonstração (apresentação do projeto): 1 líder, 2 membros, 1 time e tarefas em todas as colunas.
    /// Só roda com <c>Settings:SeedDemo:Enabled=true</c> e <c>Settings:SeedDemo:Password</c> definida (user-secrets/variável de
    /// ambiente — a senha dos usuários de demonstração nunca fica no repositório). Idempotente: não repete se o líder demo já existe.
    /// </summary>
    public static async Task Seed(IServiceProvider serviceProvider, IConfiguration configuration)
    {
        var section = configuration.GetSection("Settings:SeedDemo");
        var password = section["Password"];

        if (section.GetValue<bool>("Enabled") == false || string.IsNullOrWhiteSpace(password))
        {
            return;
        }

        await using var scope = serviceProvider.CreateAsyncScope();

        var dbContext = scope.ServiceProvider.GetRequiredService<TrilhoDbContext>();

        if (await dbContext.Users.AnyAsync(user => user.Email == LeaderEmail))
        {
            return;
        }

        var hash = scope.ServiceProvider.GetRequiredService<IPasswordEncripter>().Encrypt(password);
        var now = DateTime.UtcNow;
        var today = DateOnly.FromDateTime(now);

        User NewUser(string name, string email, string role) => new()
        {
            UserId = Guid.NewGuid(),
            Name = name,
            Email = email,
            Password = hash,
            Role = role,
            IsActive = true,
            CreatedAt = now
        };

        var leader = NewUser("Lara Líder", LeaderEmail, Roles.LEADER);
        var ana = NewUser("Ana Membro", "ana@trilho.demo", Roles.USER);
        var bruno = NewUser("Bruno Membro", "bruno@trilho.demo", Roles.USER);

        dbContext.Users.AddRange(leader, ana, bruno);
        await dbContext.SaveChangesAsync();

        var team = new Team
        {
            Name = "Equipe Demo",
            Description = "Time de demonstração do Trilho.",
            LeaderId = leader.Id,
            CreatedAt = now,
            Members =
            [
                new TeamMember { UserId = leader.Id, JoinedAt = now },
                new TeamMember { UserId = ana.Id, JoinedAt = now },
                new TeamMember { UserId = bruno.Id, JoinedAt = now }
            ]
        };

        dbContext.Teams.Add(team);
        await dbContext.SaveChangesAsync();

        var positions = new Dictionary<string, int>();

        TaskItem NewTask(string title, string status, string priority, User? assignee, int? dueInDays)
        {
            positions[status] = positions.GetValueOrDefault(status);

            var task = new TaskItem
            {
                Title = title,
                Description = $"{title} (dado de demonstração).",
                Status = status,
                Priority = priority,
                TeamId = team.Id,
                AssigneeId = assignee?.Id,
                CreatedById = leader.Id,
                DueDate = dueInDays is { } days ? today.AddDays(days) : null,
                CompletedAt = status == TaskStatuses.DONE ? now : null,
                Position = positions[status]++,
                CreatedAt = now,
                UpdatedAt = now
            };

            task.Record(leader.Id, "created");

            return task;
        }

        var tasks = new List<TaskItem>
        {
            NewTask("Definir escopo da entrega final", TaskStatuses.BACKLOG, TaskPriorities.MEDIUM, null, 14),
            NewTask("Pesquisar bibliotecas de gráficos", TaskStatuses.BACKLOG, TaskPriorities.LOW, bruno, null),
            NewTask("Modelar o banco de dados", TaskStatuses.TODO, TaskPriorities.HIGH, ana, 3),
            NewTask("Criar telas de login e cadastro", TaskStatuses.IN_PROGRESS, TaskPriorities.HIGH, bruno, 2),
            NewTask("Implementar API de relatórios", TaskStatuses.IN_PROGRESS, TaskPriorities.URGENT, ana, -1),
            NewTask("Revisar pull request do kanban", TaskStatuses.IN_REVIEW, TaskPriorities.MEDIUM, leader, 1),
            NewTask("Configurar integração contínua", TaskStatuses.DONE, TaskPriorities.MEDIUM, bruno, -5),
            NewTask("Escrever documentação inicial", TaskStatuses.DONE, TaskPriorities.LOW, ana, -7)
        };

        tasks[3].Subtasks.AddRange(
        [
            new Subtask { Title = "Tela de login", IsDone = true },
            new Subtask { Title = "Tela de ativação de conta", IsDone = false }
        ]);

        tasks[4].Comments.Add(new TaskComment
        {
            AuthorId = leader.Id,
            Body = "Prazo estourou: precisamos priorizar essa entrega.",
            CreatedAt = now
        });

        dbContext.Tasks.AddRange(tasks);
        await dbContext.SaveChangesAsync();
    }
}
