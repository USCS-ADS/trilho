using Trilho.Domain.Entities;
using Trilho.Domain.Enum;

namespace CommonTestUtilities.Entities;
public static class UserBuilder
{
    private static long _nextId = 1;

    public static User Build(string role = Roles.USER, long? id = null, bool isActive = true)
    {
        var userId = id ?? Interlocked.Increment(ref _nextId);

        return new User
        {
            Id = userId,
            UserId = Guid.NewGuid(),
            Name = $"User {userId}",
            Email = $"user{userId}@trilho.test",
            Password = "hashed-password",
            Role = role,
            IsActive = isActive,
            CreatedAt = DateTime.UtcNow
        };
    }
}
