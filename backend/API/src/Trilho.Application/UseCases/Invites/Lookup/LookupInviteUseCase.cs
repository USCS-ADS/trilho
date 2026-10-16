using Trilho.Communication.Requests.Invites;
using Trilho.Communication.Responses.Invites;
using Trilho.Domain.Repositories.Invites;
using Trilho.Domain.Security.Tokens;
using Trilho.Exception;
using Trilho.Exception.ExceptionBase;

namespace Trilho.Application.UseCases.Invites.Lookup;
public class LookupInviteUseCase : ILookupInviteUseCase
{
    private readonly IInviteReadOnlyRepository _repository;
    private readonly ISecureTokenGenerator _tokenGenerator;
    private readonly TimeProvider _timeProvider;

    public LookupInviteUseCase(IInviteReadOnlyRepository repository, ISecureTokenGenerator tokenGenerator, TimeProvider timeProvider)
    {
        _repository = repository;
        _tokenGenerator = tokenGenerator;
        _timeProvider = timeProvider;
    }

    public async Task<ResponseInviteLookupJson> Execute(RequestInviteTokenJson request)
    {
        if (string.IsNullOrWhiteSpace(request.Token))
        {
            throw new ErrorOnValidationException([ResourceErrorsMessage.INVITE_TOKEN_REQUIRED]);
        }

        var hash = _tokenGenerator.HashToken(request.Token.Trim());
        var invite = await _repository.GetPendingByTokenHash(hash, _timeProvider.GetUtcNow().UtcDateTime);

        // Mensagem única para token inexistente, usado, cancelado ou expirado.
        if (invite is null)
        {
            throw new NotFoundException(ResourceErrorsMessage.INVITE_INVALID);
        }

        return new ResponseInviteLookupJson
        {
            FullName = invite.FullName,
            Email = invite.Email,
            TeamName = invite.Team?.Name ?? string.Empty,
            Role = invite.Role
        };
    }
}
