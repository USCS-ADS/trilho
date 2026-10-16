using Trilho.Domain.Entities;

namespace Trilho.Domain.Repositories.PasswordReset;
public interface IPasswordResetWriteOnlyRepository
{
    Task Create(PasswordResetRequest request);
}
