using Trilho.Domain.Entities;

namespace Trilho.Domain.Repositories.Users;
public interface IUserReadOnlyRepository
{
    /// <param name="ignoreUserId">Id a desconsiderar (usado no update, para não conflitar consigo mesmo).</param>
    Task<bool> ExistsUserWithEmail(string email, long? ignoreUserId = null);
    Task<List<User>> GetAll();

    /// <summary>Página de usuários ordenada por nome (e id), com o total geral.</summary>
    Task<PagedResult<User>> GetPage(int page, int pageSize);
    Task<User?> GetById(long id);
    Task<User?> GetUserByEmail(string email);
}
