using Trilho.Domain.Entities;

namespace Trilho.Domain.Repositories.Users;
public interface IUserReadOnlyRepository
{
    Task<bool> ExistActiveUserWithEmail(string email);
    Task<List<User>> GetAll();
    Task<User?> GetById(long id);
    Task<User?> GetUserByEmail(string email);
}
