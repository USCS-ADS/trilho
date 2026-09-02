using AutoMapper;
using Trilho.Communication.Requests.Users;
using Trilho.Communication.Responses.Users;
using Trilho.Domain.Entities;
using Trilho.Domain.Repositories;
using Trilho.Domain.Repositories.Users;
using Trilho.Domain.Security.Cryptography;
using Trilho.Domain.Security.Tokens;
using Trilho.Exception;
using Trilho.Exception.ExceptionBase;
using FluentValidation.Results;

namespace Trilho.Application.UseCases.Users.Create;
public class CreateUserUseCase : ICreateUserUseCase
{
    private readonly IMapper _mapper;
    private readonly IPasswordEncripter _passwordEncripter;
    private readonly IUserReadOnlyRepository _userReadOnlyRepository;
    private readonly IUnitOfWork _unitOfWork;
    private readonly IUserWriteOnlyRepository _userWriteOnlyRepository;
    public CreateUserUseCase(IUserReadOnlyRepository userReadOnlyRepository, IMapper mapper, IPasswordEncripter passwordEncripter, IUnitOfWork unitOfWork, IAcessTokenGenerator tokenGenerator, IUserWriteOnlyRepository userWriteOnlyRepository)
    {
        _userReadOnlyRepository = userReadOnlyRepository;
        _mapper = mapper;
        _passwordEncripter = passwordEncripter;
        _unitOfWork = unitOfWork;
        _userWriteOnlyRepository = userWriteOnlyRepository;
    }
    public async Task<ResponseUserJson> Execute(RequestUserJson request)
    {
        await Validate(request);

        var user = _mapper.Map<User>(request);

        user.Password = _passwordEncripter.Encrypt(user.Password);
        user.UserId = Guid.NewGuid();

        await _userWriteOnlyRepository.Create(user);
        await _unitOfWork.Commit();

        return new ResponseUserJson
        {
            Id = user.Id,
            Name = user.Name,
            Email = user.Email,
            Role = user.Role,
        };
    }

    private async Task Validate(RequestUserJson request)
    {
        var result = new CreateUserValidator().Validate(request);

        var emailExists = await _userReadOnlyRepository.ExistActiveUserWithEmail(request.Email);

        if (emailExists)
        {
           result.Errors.Add(new ValidationFailure(string.Empty, ResourceErrorsMessage.NAME_REQUIRED));
        }

        if (result.IsValid == false)
        {
            var errorMessages = result.Errors.Select(f => f.ErrorMessage).ToList();

            throw new ErrorOnValidationException(errorMessages);
        }
    }
}
