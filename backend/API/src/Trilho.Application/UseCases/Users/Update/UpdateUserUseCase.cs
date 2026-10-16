using Trilho.Domain.Repositories.Teams;
using Trilho.Domain.Repositories.Users;
using Trilho.Domain.Repositories;
using Trilho.Domain.Security.Cryptography;
using Trilho.Domain.Services.LoggedUser;
using Trilho.Domain.Enum;
using Trilho.Communication.Requests.Users;
using Trilho.Exception.ExceptionBase;
using Trilho.Exception;
using FluentValidation.Results;

namespace Trilho.Application.UseCases.Users.Update;
internal class UpdateUserUseCase : IUpdateUserUseCase
{
    private readonly IUnitOfWork _unitOfWork;
    private readonly IUserUpdateOnlyRepository _repository;
    private readonly IUserReadOnlyRepository _readOnlyRepository;
    private readonly IPasswordEncripter _passwordEncripter;
    private readonly ILoggedUser _loggedUser;
    private readonly ITeamReadOnlyRepository _teamRepository;

    public UpdateUserUseCase(
        IPasswordEncripter passwordEncripter,
        IUnitOfWork unitOfWork,
        IUserUpdateOnlyRepository repository,
        IUserReadOnlyRepository readOnlyRepository,
        ILoggedUser loggedUser,
        ITeamReadOnlyRepository teamRepository)
    {
        _unitOfWork = unitOfWork;
        _repository = repository;
        _readOnlyRepository = readOnlyRepository;
        _passwordEncripter = passwordEncripter;
        _loggedUser = loggedUser;
        _teamRepository = teamRepository;
    }

    public async Task Execute(long id, RequestUserJson request)
    {
        var loggedUser = await _loggedUser.User();
        var isAdmin = loggedUser.Role == Roles.ADMIN;

        // RF01: membros editam apenas os próprios dados.
        if (isAdmin == false && loggedUser.Id != id)
        {
            throw new ForbiddenException(ResourceErrorsMessage.USER_CAN_ONLY_EDIT_OWN_PROFILE);
        }

        request.Email = request.Email.Trim().ToLowerInvariant();

        await Validate(id, request);

        var user = await _repository.GetById(id);

        if (user is null)
        {
            throw new NotFoundException(ResourceErrorsMessage.USER_NOT_FOUND);
        }

        // RF01: apenas administradores alteram o perfil de acesso.
        if (isAdmin == false && request.Role != user.Role)
        {
            throw new ForbiddenException(ResourceErrorsMessage.ONLY_ADMIN_CAN_CHANGE_ROLE);
        }

        // Quem lidera um time (ativo ou arquivado) precisa manter perfil de líder/administrador.
        var keepsLeaderRole = request.Role == Roles.LEADER || request.Role == Roles.ADMIN;

        if (request.Role != user.Role && keepsLeaderRole == false && await _teamRepository.ExistsTeamLedBy(user.Id, onlyActive: false))
        {
            throw new ConflictException(ResourceErrorsMessage.USER_LEADS_TEAM);
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

    private async Task Validate(long id, RequestUserJson request)
    {
        var result = new UpdateUserValidator().Validate(request);

        var emailExists = await _readOnlyRepository.ExistsUserWithEmail(request.Email, ignoreUserId: id);

        if (emailExists)
        {
            result.Errors.Add(new ValidationFailure(string.Empty, ResourceErrorsMessage.EMAIL_ALREADY_REGISTERED));
        }

        if (result.IsValid == false)
        {
            var errorMessages = result.Errors.Select(f => f.ErrorMessage).ToList();

            throw new ErrorOnValidationException(errorMessages);
        }
    }
}
