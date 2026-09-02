using Trilho.Domain.Entities;

namespace Trilho.Domain.Repositories.Users;
public interface IUserUpdateOnlyRepository
{
    Task<User?> GetById(long id);
    void Update(User user);
}
