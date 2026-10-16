using AutoMapper;
using Trilho.Communication.Requests.Invites;
using Trilho.Communication.Responses.Users;
using Trilho.Domain.Entities;
using Trilho.Domain.Repositories;
using Trilho.Domain.Repositories.Invites;
using Trilho.Domain.Repositories.Teams;
using Trilho.Domain.Repositories.Users;
using Trilho.Domain.Security.Cryptography;
using Trilho.Domain.Security.Tokens;
using Trilho.Exception;
using Trilho.Exception.ExceptionBase;

namespace Trilho.Application.UseCases.Invites.Accept;
public class AcceptInviteUseCase : IAcceptInviteUseCase
{
    private readonly IInviteUpdateOnlyRepository _inviteRepository;
    private readonly ITeamUpdateOnlyRepository _teamRepository;
    private readonly IUserReadOnlyRepository _userReadRepository;
    private readonly IUserWriteOnlyRepository _userWriteRepository;
    private readonly IPasswordEncripter _passwordEncripter;
    private readonly ISecureTokenGenerator _tokenGenerator;
    private readonly IUnitOfWork _unitOfWork;
    private readonly IMapper _mapper;
    private readonly TimeProvider _timeProvider;

    public AcceptInviteUseCase(
        IInviteUpdateOnlyRepository inviteRepository,
        ITeamUpdateOnlyRepository teamRepository,
        IUserReadOnlyRepository userReadRepository,
        IUserWriteOnlyRepository userWriteRepository,
        IPasswordEncripter passwordEncripter,
        ISecureTokenGenerator tokenGenerator,
        IUnitOfWork unitOfWork,
        IMapper mapper,
        TimeProvider timeProvider)
    {
        _inviteRepository = inviteRepository;
        _teamRepository = teamRepository;
        _userReadRepository = userReadRepository;
        _userWriteRepository = userWriteRepository;
        _passwordEncripter = passwordEncripter;
        _tokenGenerator = tokenGenerator;
        _unitOfWork = unitOfWork;
        _mapper = mapper;
        _timeProvider = timeProvider;
    }

    public async Task<ResponseUserJson> Execute(RequestAcceptInviteJson request)
    {
        request.Token = request.Token?.Trim() ?? string.Empty;
        request.FullName = request.FullName?.Trim() ?? string.Empty;

        var validation = new AcceptInviteValidator().Validate(request);

        if (validation.IsValid == false)
        {
            throw new ErrorOnValidationException(validation.Errors.Select(e => e.ErrorMessage).ToList());
        }

        var now = _timeProvider.GetUtcNow().UtcDateTime;

        var invite = await _inviteRepository.GetPendingByTokenHash(_tokenGenerator.HashToken(request.Token), now)
            ?? throw new NotFoundException(ResourceErrorsMessage.INVITE_INVALID);

        var team = await _teamRepository.GetById(invite.TeamId)
            ?? throw new NotFoundException(ResourceErrorsMessage.INVITE_INVALID);

        if (team.IsArchived)
        {
            throw new ConflictException(ResourceErrorsMessage.TEAM_ARCHIVED);
        }

        // O e-mail pode ter sido cadastrado por outro caminho depois do convite.
        if (await _userReadRepository.ExistsUserWithEmail(invite.Email))
        {
            throw new ConflictException(ResourceErrorsMessage.EMAIL_ALREADY_REGISTERED);
        }

        var user = new User
        {
            UserId = Guid.NewGuid(),
            Name = request.FullName,
            Email = invite.Email,
            Password = _passwordEncripter.Encrypt(request.Password),
            Role = invite.Role,
            IsActive = true,
            CreatedAt = now
        };

        await _userWriteRepository.Create(user);

        team.Members.Add(new TeamMember { TeamId = team.Id, User = user, JoinedAt = now });

        invite.AcceptedAt = now;
        _inviteRepository.Update(invite);

        await _unitOfWork.Commit();

        return _mapper.Map<ResponseUserJson>(user);
    }
}
