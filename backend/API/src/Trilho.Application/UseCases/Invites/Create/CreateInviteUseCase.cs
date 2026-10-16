using Trilho.Application.UseCases.Shared;
using Trilho.Communication.Requests.Invites;
using Trilho.Communication.Responses.Invites;
using Trilho.Domain.Entities;
using Trilho.Domain.Enum;
using Trilho.Domain.Repositories;
using Trilho.Domain.Repositories.Invites;
using Trilho.Domain.Repositories.Teams;
using Trilho.Domain.Repositories.Users;
using Trilho.Domain.Security.Tokens;
using Trilho.Domain.Services.Email;
using Trilho.Domain.Services.LoggedUser;
using Trilho.Domain.Services.Settings;
using Trilho.Exception;
using Trilho.Exception.ExceptionBase;

namespace Trilho.Application.UseCases.Invites.Create;
public class CreateInviteUseCase : ICreateInviteUseCase
{
    private readonly IInviteWriteOnlyRepository _writeRepository;
    private readonly IInviteUpdateOnlyRepository _updateRepository;
    private readonly ITeamReadOnlyRepository _teamRepository;
    private readonly IUserReadOnlyRepository _userRepository;
    private readonly ISecureTokenGenerator _tokenGenerator;
    private readonly IEmailSender _emailSender;
    private readonly IAuthFlowSettings _settings;
    private readonly ILoggedUser _loggedUser;
    private readonly IUnitOfWork _unitOfWork;
    private readonly TimeProvider _timeProvider;

    public CreateInviteUseCase(
        IInviteWriteOnlyRepository writeRepository,
        IInviteUpdateOnlyRepository updateRepository,
        ITeamReadOnlyRepository teamRepository,
        IUserReadOnlyRepository userRepository,
        ISecureTokenGenerator tokenGenerator,
        IEmailSender emailSender,
        IAuthFlowSettings settings,
        ILoggedUser loggedUser,
        IUnitOfWork unitOfWork,
        TimeProvider timeProvider)
    {
        _writeRepository = writeRepository;
        _updateRepository = updateRepository;
        _teamRepository = teamRepository;
        _userRepository = userRepository;
        _tokenGenerator = tokenGenerator;
        _emailSender = emailSender;
        _settings = settings;
        _loggedUser = loggedUser;
        _unitOfWork = unitOfWork;
        _timeProvider = timeProvider;
    }

    public async Task<ResponseInviteJson> Execute(RequestInviteJson request)
    {
        request.Email = request.Email?.Trim().ToLowerInvariant() ?? string.Empty;
        request.FullName = request.FullName?.Trim() ?? string.Empty;

        var validation = new CreateInviteValidator().Validate(request);

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

        // Líderes convidam apenas membros comuns; perfis elevados são concedidos pelo administrador.
        if (user.Role != Roles.ADMIN && request.Role != Roles.USER)
        {
            throw new ForbiddenException(ResourceErrorsMessage.INVITE_ROLE_NOT_ALLOWED);
        }

        if (team.IsArchived)
        {
            throw new ConflictException(ResourceErrorsMessage.TEAM_ARCHIVED);
        }

        if (await _userRepository.ExistsUserWithEmail(request.Email))
        {
            throw new ConflictException(ResourceErrorsMessage.EMAIL_ALREADY_REGISTERED);
        }

        var now = _timeProvider.GetUtcNow().UtcDateTime;

        // Reenviar = substituir: o convite anterior (e seu link) deixa de valer.
        foreach (var previous in await _updateRepository.GetPendingByEmailAndTeam(request.Email, team.Id, now))
        {
            previous.CancelledAt = now;
            _updateRepository.Update(previous);
        }

        var token = _tokenGenerator.GenerateToken();

        var invite = new Invite
        {
            Email = request.Email,
            FullName = request.FullName,
            TeamId = team.Id,
            Role = request.Role,
            TokenHash = _tokenGenerator.HashToken(token),
            ExpiresAt = now.AddDays(_settings.InviteExpiresDays),
            InvitedById = user.Id,
            CreatedAt = now
        };

        await _writeRepository.Create(invite);
        await _unitOfWork.Commit();

        await _emailSender.Send(EmailTemplates.Invite(
            invite.Email, invite.FullName, team.Name, _settings.BuildActivationLink(token), _settings.InviteExpiresDays));

        return new ResponseInviteJson
        {
            Id = invite.Id,
            Email = invite.Email,
            FullName = invite.FullName,
            TeamId = team.Id,
            TeamName = team.Name,
            Role = invite.Role,
            ExpiresAt = invite.ExpiresAt,
            CreatedAt = invite.CreatedAt
        };
    }
}
