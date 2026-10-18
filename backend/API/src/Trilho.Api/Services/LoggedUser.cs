using Trilho.Domain.Entities;
using Trilho.Domain.Repositories.Users;
using Trilho.Domain.Security.Tokens;
using Trilho.Domain.Services.LoggedUser;
using Trilho.Exception;
using Trilho.Exception.ExceptionBase;

namespace Trilho.Api.Services;
public class LoggedUser : ILoggedUser
{
    private readonly IHttpContextAccessor _httpContextAccessor;
    private readonly IUserReadOnlyRepository _repository;

    public LoggedUser(IHttpContextAccessor httpContextAccessor, IUserReadOnlyRepository repository)
    {
        _httpContextAccessor = httpContextAccessor;
        _repository = repository;
    }

    public async Task<User> User()
    {
        var claim = _httpContextAccessor.HttpContext?.User.FindFirst(TokenClaims.UserId)?.Value;

        if (long.TryParse(claim, out var id) == false)
        {
            throw new UnauthorizedException(ResourceErrorsMessage.USER_NOT_AUTHENTICATED);
        }

        var user = await _repository.GetById(id);

        // Token emitido antes de a senha ser trocada/redefinida (versão menor) deixa de valer. Token antigo sem a claim conta como versão 0.
        var tokenVersion = int.TryParse(_httpContextAccessor.HttpContext?.User.FindFirst(TokenClaims.TokenVersion)?.Value, out var version) ? version : 0;

        if (user is null || user.IsActive == false || user.TokenVersion != tokenVersion)
        {
            throw new UnauthorizedException(ResourceErrorsMessage.USER_NOT_AUTHENTICATED);
        }

        return user;
    }
}
