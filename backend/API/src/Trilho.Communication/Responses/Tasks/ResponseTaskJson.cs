namespace Trilho.Communication.Responses.Tasks;
public class ResponseTaskJson
{
    public long Id { get; set; }
    public string Title { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public string Status { get; set; } = string.Empty;
    public string Priority { get; set; } = string.Empty;
    public long TeamId { get; set; }
    public long? AssigneeId { get; set; }
    public long? CreatedById { get; set; }
    /// <summary>Nome de quem criou (pode não ser membro do time, ex: administrador).</summary>
    public string? CreatedByName { get; set; }
    public string? AssigneeName { get; set; }
    public DateOnly? DueDate { get; set; }
    public bool IsOverdue { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }
    public DateTime? CompletedAt { get; set; }
    public int Position { get; set; }
    /// <summary>RF04: percentual de subtarefas concluídas (0 quando não há subtarefas).</summary>
    public int Progress { get; set; }
    /// <summary>Vínculo com o repositório (branch, PR e último commit); nulo se não houver.</summary>
    public ResponseTaskGitJson? Git { get; set; }
    public List<ResponseSubtaskJson> Subtasks { get; set; } = [];
    public List<ResponseCommentJson> Comments { get; set; } = [];
}
