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

        if (user is null || user.IsActive == false)
        {
            throw new UnauthorizedException(ResourceErrorsMessage.USER_NOT_AUTHENTICATED);
        }

        return user;
    }
}
