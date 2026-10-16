using Trilho.Domain.Entities;
using Trilho.Domain.Repositories;
using Trilho.Domain.Repositories.PasswordReset;
using Trilho.Domain.Repositories.Users;
using Trilho.Domain.Security.Cryptography;
using Trilho.Domain.Services.Settings;
using Trilho.Exception;
using Trilho.Exception.ExceptionBase;

namespace Trilho.Application.UseCases.PasswordReset.Shared;
public class PasswordResetCodeChecker : IPasswordResetCodeChecker
{
    private readonly IUserReadOnlyRepository _userRepository;
    private readonly IPasswordResetUpdateOnlyRepository _resetRepository;
    private readonly IPasswordEncripter _passwordEncripter;
    private readonly IAuthFlowSettings _settings;
    private readonly IUnitOfWork _unitOfWork;
    private readonly TimeProvider _timeProvider;

    public PasswordResetCodeChecker(
        IUserReadOnlyRepository userRepository,
        IPasswordResetUpdateOnlyRepository resetRepository,
        IPasswordEncripter passwordEncripter,
        IAuthFlowSettings settings,
        IUnitOfWork unitOfWork,
        TimeProvider timeProvider)
    {
        _userRepository = userRepository;
        _resetRepository = resetRepository;
        _passwordEncripter = passwordEncripter;
        _settings = settings;
        _unitOfWork = unitOfWork;
        _timeProvider = timeProvider;
    }

    public async Task<(User User, PasswordResetRequest Request)> Check(string email, string code)
    {
        var normalizedEmail = email?.Trim().ToLowerInvariant() ?? string.Empty;
        var normalizedCode = code?.Trim() ?? string.Empty;

        if (normalizedCode.Length != 6 || normalizedCode.All(char.IsAsciiDigit) == false)
        {
            throw new ErrorOnValidationException([ResourceErrorsMessage.PASSWORD_RESET_CODE_REQUIRED]);
        }

        var user = await _userRepository.GetUserByEmail(normalizedEmail);

        if (user is null || user.IsActive == false)
        {
            throw InvalidCode();
        }

        var now = _timeProvider.GetUtcNow().UtcDateTime;
        var active = (await _resetRepository.GetActiveByUser(user.Id, now)).FirstOrDefault();

        if (active is null || active.Attempts >= _settings.PasswordResetMaxAttempts)
        {
            throw InvalidCode();
        }

        if (_passwordEncripter.Verify(normalizedCode, active.CodeHash) == false)
        {
            active.Attempts++;
            _resetRepository.Update(active);
            await _unitOfWork.Commit();

            throw InvalidCode();
        }

        return (user, active);
    }

    private static ErrorOnValidationException InvalidCode()
    {
        return new ErrorOnValidationException([ResourceErrorsMessage.PASSWORD_RESET_CODE_INVALID]);
    }
}
