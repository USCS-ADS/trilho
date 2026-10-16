using Trilho.Application.UseCases.Tasks.Shared;
using Trilho.Communication.Requests.Tasks;
using Trilho.Communication.Responses.Tasks;
using Trilho.Domain.Entities;
using Trilho.Domain.Enum;
using Trilho.Domain.Repositories;
using Trilho.Domain.Repositories.Tasks;
using Trilho.Domain.Services.LoggedUser;
using Trilho.Exception;
using Trilho.Exception.ExceptionBase;

namespace Trilho.Application.UseCases.Comments.Create;
public class CreateCommentUseCase : ICreateCommentUseCase
{
    private readonly ITaskUpdateOnlyRepository _repository;
    private readonly ITaskAccessGuard _guard;
    private readonly ILoggedUser _loggedUser;
    private readonly IUnitOfWork _unitOfWork;

    public CreateCommentUseCase(ITaskUpdateOnlyRepository repository, ITaskAccessGuard guard, ILoggedUser loggedUser, IUnitOfWork unitOfWork)
    {
        _repository = repository;
        _guard = guard;
        _loggedUser = loggedUser;
        _unitOfWork = unitOfWork;
    }

    public async Task<ResponseCommentJson> Execute(long taskId, RequestCommentJson request)
    {
        request.Body = request.Body?.Trim() ?? string.Empty;

        var validation = new CreateCommentValidator().Validate(request);

        if (validation.IsValid == false)
        {
            throw new ErrorOnValidationException(validation.Errors.Select(e => e.ErrorMessage).ToList());
        }

        var user = await _loggedUser.User();

        var task = await _repository.GetById(taskId) ?? throw new NotFoundException(ResourceErrorsMessage.TASK_NOT_FOUND);

        var team = await _guard.GetTeamForMember(user, task.TeamId);

        if (team.IsArchived)
        {
            throw new ConflictException(ResourceErrorsMessage.TEAM_ARCHIVED);
        }

        var comment = new TaskComment { TaskId = task.Id, AuthorId = user.Id, Body = request.Body, CreatedAt = DateTime.UtcNow };

        task.Comments.Add(comment);
        task.Record(user.Id, TaskActivityTypes.COMMENT_ADDED);

        await _unitOfWork.Commit();

        return new ResponseCommentJson
        {
            Id = comment.Id,
            AuthorId = user.Id,
            AuthorName = user.Name,
            Body = comment.Body,
            CreatedAt = comment.CreatedAt
        };
    }
}
