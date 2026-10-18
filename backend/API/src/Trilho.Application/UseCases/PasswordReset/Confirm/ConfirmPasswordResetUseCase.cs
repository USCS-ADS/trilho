using Trilho.Application.UseCases.PasswordReset.Shared;
using Trilho.Communication.Requests.PasswordReset;
using Trilho.Domain.Repositories;
using Trilho.Domain.Repositories.PasswordReset;
using Trilho.Domain.Repositories.Users;
using Trilho.Domain.Security.Cryptography;
using Trilho.Exception;
using Trilho.Exception.ExceptionBase;

namespace Trilho.Application.UseCases.PasswordReset.Confirm;
public class ConfirmPasswordResetUseCase : IConfirmPasswordResetUseCase
{
    private readonly IPasswordResetCodeChecker _checker;
    private readonly IUserUpdateOnlyRepository _userRepository;
    private readonly IPasswordResetUpdateOnlyRepository _resetRepository;
    private readonly IPasswordEncripter _passwordEncripter;
    private readonly IUnitOfWork _unitOfWork;
    private readonly TimeProvider _timeProvider;

    public ConfirmPasswordResetUseCase(
        IPasswordResetCodeChecker checker,
        IUserUpdateOnlyRepository userRepository,
        IPasswordResetUpdateOnlyRepository resetRepository,
        IPasswordEncripter passwordEncripter,
        IUnitOfWork unitOfWork,
        TimeProvider timeProvider)
    {
        _checker = checker;
        _userRepository = userRepository;
        _resetRepository = resetRepository;
        _passwordEncripter = passwordEncripter;
        _unitOfWork = unitOfWork;
        _timeProvider = timeProvider;
    }

    public async Task Execute(RequestConfirmPasswordResetJson request)
    {
        var validation = new ConfirmPasswordResetValidator().Validate(request);

        if (validation.IsValid == false)
        {
            throw new ErrorOnValidationException(validation.Errors.Select(e => e.ErrorMessage).ToList());
        }

        var (checkedUser, resetRequest) = await _checker.Check(request.Email, request.Code);

        var user = await _userRepository.GetById(checkedUser.Id)
            ?? throw new ErrorOnValidationException([ResourceErrorsMessage.PASSWORD_RESET_CODE_INVALID]);

        user.Password = _passwordEncripter.Encrypt(request.NewPassword);
        user.TokenVersion += 1;
        user.FailedLoginAttempts = 0;
        user.LockoutEnd = null;
        _userRepository.Update(user);

        resetRequest.UsedAt = _timeProvider.GetUtcNow().UtcDateTime;
        _resetRepository.Update(resetRequest);

        await _unitOfWork.Commit();
    }
}
