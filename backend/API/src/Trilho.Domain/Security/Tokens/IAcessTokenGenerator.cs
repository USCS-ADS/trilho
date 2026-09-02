using Trilho.Domain.Entities;

namespace Trilho.Domain.Security.Tokens;
public interface IAcessTokenGenerator
{
    string Generate(User user);
}
