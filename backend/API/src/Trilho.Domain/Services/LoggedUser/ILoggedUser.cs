using Trilho.Domain.Entities;

namespace Trilho.Domain.Services.LoggedUser;
public interface ILoggedUser
{
    /// <summary>Usuário autenticado na requisição atual. Lança <c>UnauthorizedException</c> se não houver.</summary>
    Task<User> User();
}
