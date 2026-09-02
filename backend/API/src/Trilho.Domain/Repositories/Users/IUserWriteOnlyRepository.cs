using Trilho.Domain.Entities;

namespace Trilho.Domain.Repositories.Users;
public interface IUserWriteOnlyRepository
{
    Task Create(User user);
    Task<bool> Delete(long id);
}
