using FluentValidation.Results;
using Trilho.Communication.Requests.Users;
using Trilho.Domain.Repositories;
using Trilho.Domain.Repositories.Users;
using Trilho.Domain.Security.Cryptography;
using Trilho.Domain.Services.LoggedUser;
using Trilho.Exception;
using Trilho.Exception.ExceptionBase;

namespace Trilho.Application.UseCases.Users.ChangePassword;
public class ChangePasswordUseCase : IChangePasswordUseCase
{
    private readonly IUserUpdateOnlyRepository _repository;
    private readonly IPasswordEncripter _passwordEncripter;
    private readonly IUnitOfWork _unitOfWork;
    private readonly ILoggedUser _loggedUser;

    public ChangePasswordUseCase(
        IUserUpdateOnlyRepository repository,
        IPasswordEncripter passwordEncripter,
        IUnitOfWork unitOfWork,
        ILoggedUser loggedUser)
    {
        _repository = repository;
        _passwordEncripter = passwordEncripter;
        _unitOfWork = unitOfWork;
        _loggedUser = loggedUser;
    }

    public async Task Execute(RequestChangePasswordJson request)
    {
        var loggedUser = await _loggedUser.User();

        var user = await _repository.GetById(loggedUser.Id)
            ?? throw new NotFoundException(ResourceErrorsMessage.USER_NOT_FOUND);

        var result = new ChangePasswordValidator().Validate(request);

        // Só confere a senha atual quando o formato da requisição está correto.
        if (result.IsValid && _passwordEncripter.Verify(request.CurrentPassword, user.Password) == false)
        {
            result.Errors.Add(new ValidationFailure(nameof(request.CurrentPassword), ResourceErrorsMessage.CURRENT_PASSWORD_INVALID));
        }

        if (result.IsValid == false)
        {
            throw new ErrorOnValidationException(result.Errors.Select(failure => failure.ErrorMessage).ToList());
        }

        user.Password = _passwordEncripter.Encrypt(request.NewPassword);

        _repository.Update(user);

        await _unitOfWork.Commit();
    }
}
