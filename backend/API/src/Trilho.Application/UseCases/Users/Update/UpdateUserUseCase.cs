using AutoMapper;
using Trilho.Domain.Repositories.Users;
using Trilho.Domain.Repositories;
using Trilho.Domain.Security.Cryptography;
using Trilho.Communication.Requests.Users;
using Trilho.Exception.ExceptionBase;
using Trilho.Exception;

namespace Trilho.Application.UseCases.Users.Update;
internal class UpdateUserUseCase : IUpdateUserUseCase
{
    private readonly IUnitOfWork _unitOfWork;
    private readonly IUserUpdateOnlyRepository _repository;
    private readonly IPasswordEncripter _passwordEncripter;

    public UpdateUserUseCase(IPasswordEncripter passwordEncripter, IUnitOfWork unitOfWork, IUserUpdateOnlyRepository repository)
    {
        _unitOfWork = unitOfWork;
        _repository = repository;
        _passwordEncripter = passwordEncripter;
    }

    public async Task Execute(long id, RequestUserJson request)
    {
        Validate(request);
        var user = await _repository.GetById(id);

        if (user is null)
        {
            throw new NotFoundException(ResourceErrorsMessage.USER_NOT_FOUND);
        }

        user.Name = request.Name;
        user.Email = request.Email;
        user.Role = request.Role;
        if (!string.IsNullOrWhiteSpace(request.Password))
        {
            user.Password = _passwordEncripter.Encrypt(request.Password);
        }

        _repository.Update(user);

        await _unitOfWork.Commit();
    }

    private void Validate(RequestUserJson request)
    {
        var validator = new UpdateUserValidator();

        var result = validator.Validate(request);

        if (result.IsValid == false)
        {
            var errorMessages = result.Errors.Select(f => f.ErrorMessage).ToList();

            throw new ErrorOnValidationException(errorMessages);
        }
    }
}
