using FluentValidation.Results;
using Trilho.Communication.Requests.Teams;
using Trilho.Domain.Repositories;
using Trilho.Domain.Repositories.Teams;
using Trilho.Domain.Services.LoggedUser;
using Trilho.Exception;
using Trilho.Exception.ExceptionBase;

namespace Trilho.Application.UseCases.Teams.Update;
public class UpdateTeamUseCase : IUpdateTeamUseCase
{
    private readonly ITeamUpdateOnlyRepository _updateRepository;
    private readonly ITeamReadOnlyRepository _readRepository;
    private readonly ILoggedUser _loggedUser;
    private readonly IUnitOfWork _unitOfWork;

    public UpdateTeamUseCase(
        ITeamUpdateOnlyRepository updateRepository,
        ITeamReadOnlyRepository readRepository,
        ILoggedUser loggedUser,
        IUnitOfWork unitOfWork)
    {
        _updateRepository = updateRepository;
        _readRepository = readRepository;
        _loggedUser = loggedUser;
        _unitOfWork = unitOfWork;
    }

    public async Task Execute(long id, RequestUpdateTeamJson request)
    {
        var loggedUser = await _loggedUser.User();

        var team = await _updateRepository.GetById(id);

        if (team is null)
        {
            throw new NotFoundException(ResourceErrorsMessage.TEAM_NOT_FOUND);
        }

        if (team.CanBeManagedBy(loggedUser) == false)
        {
            throw new ForbiddenException(ResourceErrorsMessage.FORBIDDEN_ACTION);
        }

        if (team.IsArchived)
        {
            throw new ConflictException(ResourceErrorsMessage.TEAM_ARCHIVED);
        }

        request.Name = request.Name?.Trim() ?? string.Empty;
        request.Description = request.Description?.Trim() ?? string.Empty;

        await Validate(id, request);

        team.Name = request.Name;
        team.Description = request.Description;

        _updateRepository.Update(team);

        await _unitOfWork.Commit();
    }

    private async Task Validate(long id, RequestUpdateTeamJson request)
    {
        var result = new UpdateTeamValidator().Validate(request);

        if (result.IsValid && await _readRepository.ExistsTeamWithName(request.Name, ignoreTeamId: id))
        {
            result.Errors.Add(new ValidationFailure(nameof(request.Name), ResourceErrorsMessage.TEAM_NAME_ALREADY_EXISTS));
        }

        if (result.IsValid == false)
        {
            throw new ErrorOnValidationException(result.Errors.Select(e => e.ErrorMessage).ToList());
        }
    }
}
