using Trilho.Communication.Requests.Users;
using Trilho.Domain.Enum;

namespace CommonTestUtilities.Requests;
public static class RequestUserJsonBuilder
{
    public const string ValidPassword = "Trilho@2026";

    public static RequestUserJson Build(string role = Roles.USER, string? email = null)
    {
        var suffix = Guid.NewGuid().ToString("N")[..8];

        return new RequestUserJson
        {
            Name = "Test User",
            Email = email ?? $"test.{suffix}@trilho.test",
            Password = ValidPassword,
            Role = role
        };
    }
}
