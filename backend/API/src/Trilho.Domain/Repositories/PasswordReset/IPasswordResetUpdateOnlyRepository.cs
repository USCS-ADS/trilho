using Trilho.Domain.Entities;

namespace Trilho.Domain.Repositories.PasswordReset;
public interface IPasswordResetUpdateOnlyRepository
{
    /// <summary>Pedidos do usuário ainda válidos (não usados e não expirados), do mais recente ao mais antigo.</summary>
    Task<List<PasswordResetRequest>> GetActiveByUser(long userId, DateTime now);
    void Update(PasswordResetRequest request);
}
