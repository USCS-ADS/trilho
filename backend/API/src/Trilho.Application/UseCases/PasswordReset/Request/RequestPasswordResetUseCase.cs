using FluentValidation;
using Trilho.Application.UseCases.Shared;
using Trilho.Communication.Requests.PasswordReset;
using Trilho.Domain.Entities;
using Trilho.Domain.Repositories;
using Trilho.Domain.Repositories.PasswordReset;
using Trilho.Domain.Repositories.Users;
using Trilho.Domain.Security.Cryptography;
using Trilho.Domain.Security.Tokens;
using Trilho.Domain.Services.Email;
using Trilho.Domain.Services.Settings;
using Trilho.Exception;
using Trilho.Exception.ExceptionBase;

namespace Trilho.Application.UseCases.PasswordReset.Request;
public class RequestPasswordResetUseCase : IRequestPasswordResetUseCase
{
    private const int CodeDigits = 6;

    private readonly IUserReadOnlyRepository _userRepository;
    private readonly IPasswordResetWriteOnlyRepository _writeRepository;
    private readonly IPasswordResetUpdateOnlyRepository _updateRepository;
    private readonly ISecureTokenGenerator _tokenGenerator;
    private readonly IPasswordEncripter _passwordEncripter;
    private readonly IEmailSender _emailSender;
    private readonly IAuthFlowSettings _settings;
    private readonly IUnitOfWork _unitOfWork;
    private readonly TimeProvider _timeProvider;

    public RequestPasswordResetUseCase(
        IUserReadOnlyRepository userRepository,
        IPasswordResetWriteOnlyRepository writeRepository,
        IPasswordResetUpdateOnlyRepository updateRepository,
        ISecureTokenGenerator tokenGenerator,
        IPasswordEncripter passwordEncripter,
        IEmailSender emailSender,
        IAuthFlowSettings settings,
        IUnitOfWork unitOfWork,
        TimeProvider timeProvider)
    {
        _userRepository = userRepository;
        _writeRepository = writeRepository;
        _updateRepository = updateRepository;
        _tokenGenerator = tokenGenerator;
        _passwordEncripter = passwordEncripter;
        _emailSender = emailSender;
        _settings = settings;
        _unitOfWork = unitOfWork;
        _timeProvider = timeProvider;
    }

    public async Task Execute(RequestPasswordResetJson request)
    {
        var email = request.Email?.Trim().ToLowerInvariant() ?? string.Empty;

        if (string.IsNullOrWhiteSpace(email))
        {
            throw new ErrorOnValidationException([ResourceErrorsMessage.EMAIL_REQUIRED]);
        }

        var user = await _userRepository.GetUserByEmail(email);

        // Resposta idêntica para e-mail inexistente ou inativo: não revela quais e-mails estão cadastrados.
        if (user is null || user.IsActive == false)
        {
            return;
        }

        var now = _timeProvider.GetUtcNow().UtcDateTime;

        foreach (var previous in await _updateRepository.GetActiveByUser(user.Id, now))
        {
            previous.UsedAt = now;
            _updateRepository.Update(previous);
        }

        var code = _tokenGenerator.GenerateNumericCode(CodeDigits);

        await _writeRepository.Create(new PasswordResetRequest
        {
            UserId = user.Id,
            CodeHash = _passwordEncripter.Encrypt(code),
            ExpiresAt = now.AddMinutes(_settings.PasswordResetExpiresMinutes),
            CreatedAt = now
        });

        await _unitOfWork.Commit();

        await _emailSender.Send(EmailTemplates.PasswordResetCode(user.Email, user.Name, code, _settings.PasswordResetExpiresMinutes));
    }
}
