using Trilho.Domain.Entities;

namespace Trilho.Application.UseCases.PasswordReset.Shared;
public interface IPasswordResetCodeChecker
{
    /// <summary>
    /// Confere o código do pedido ativo do usuário. Falhas contam tentativa; ao exceder o limite o pedido deixa de valer.
    /// Lança <c>ErrorOnValidationException</c> com mensagem única (não revela se o e-mail existe).
    /// </summary>
    Task<(User User, PasswordResetRequest Request)> Check(string email, string code);
}
