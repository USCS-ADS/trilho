using Trilho.Application.UseCases.Git.Repositories.Shared;
using Trilho.Communication.Requests.Git;
using Trilho.Communication.Responses.Git;
using Trilho.Domain.Entities;
using Trilho.Domain.Enum;
using Trilho.Domain.Repositories;
using Trilho.Domain.Repositories.Git;
using Trilho.Domain.Repositories.Teams;
using Trilho.Domain.Security.Cryptography;
using Trilho.Domain.Security.Tokens;
using Trilho.Domain.Services.LoggedUser;
using Trilho.Domain.Services.Settings;
using Trilho.Exception;
using Trilho.Exception.ExceptionBase;

namespace Trilho.Application.UseCases.Git.Repositories.Connect;
public class ConnectRepositoryUseCase : IConnectRepositoryUseCase
{
    private readonly IGitRepositoryWriteOnlyRepository _writeRepository;
    private readonly IGitRepositoryReadOnlyRepository _readRepository;
    private readonly ITeamReadOnlyRepository _teamRepository;
    private readonly ISecureTokenGenerator _tokenGenerator;
    private readonly ISecretProtector _secretProtector;
    private readonly IGitSettings _settings;
    private readonly ILoggedUser _loggedUser;
    private readonly IUnitOfWork _unitOfWork;

    public ConnectRepositoryUseCase(
        IGitRepositoryWriteOnlyRepository writeRepository,
        IGitRepositoryReadOnlyRepository readRepository,
        ITeamReadOnlyRepository teamRepository,
        ISecureTokenGenerator tokenGenerator,
        ISecretProtector secretProtector,
        IGitSettings settings,
        ILoggedUser loggedUser,
        IUnitOfWork unitOfWork)
    {
        _writeRepository = writeRepository;
        _readRepository = readRepository;
        _teamRepository = teamRepository;
        _tokenGenerator = tokenGenerator;
        _secretProtector = secretProtector;
        _settings = settings;
        _loggedUser = loggedUser;
        _unitOfWork = unitOfWork;
    }

    public async Task<ResponseGitRepositoryCreatedJson> Execute(RequestConnectRepositoryJson request)
    {
        request.Provider = request.Provider?.Trim().ToLowerInvariant() ?? string.Empty;
        request.FullName = request.FullName?.Trim().Trim('/') ?? string.Empty;

        var validation = new ConnectRepositoryValidator().Validate(request);

        if (validation.IsValid == false)
        {
            throw new ErrorOnValidationException(validation.Errors.Select(e => e.ErrorMessage).ToList());
        }

        var user = await _loggedUser.User();

        var team = await _teamRepository.GetById(request.TeamId)
            ?? throw new NotFoundException(ResourceErrorsMessage.TEAM_NOT_FOUND);

        if (team.CanBeManagedBy(user) == false)
        {
            throw new ForbiddenException(ResourceErrorsMessage.FORBIDDEN_ACTION);
        }

        if (team.IsArchived)
        {
            throw new ConflictException(ResourceErrorsMessage.TEAM_ARCHIVED);
        }

        if (await _readRepository.Exists(request.Provider, request.FullName))
        {
            throw new ConflictException(ResourceErrorsMessage.GIT_REPOSITORY_ALREADY_CONNECTED);
        }

        var secret = _tokenGenerator.GenerateToken();

        var repository = new GitRepository
        {
            Provider = request.Provider,
            FullName = request.FullName,
            TeamId = team.Id,
            Events = string.Join(',', request.Events is { Count: > 0 } ? request.Events.Distinct() : GitEventTypes.All),
            WebhookSecretProtected = _secretProtector.Protect(secret),
            ConnectedById = user.Id,
            CreatedAt = DateTime.UtcNow
        };

        await _writeRepository.Create(repository);
        await _unitOfWork.Commit();

        var response = repository.ToResponse<ResponseGitRepositoryCreatedJson>(_settings);
        response.WebhookSecret = secret;

        return response;
    }
}
