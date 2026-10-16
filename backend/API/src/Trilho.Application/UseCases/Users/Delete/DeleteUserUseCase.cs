using Trilho.Domain.Repositories.Teams;
using Trilho.Domain.Repositories.Users;
using Trilho.Domain.Repositories;
using Trilho.Domain.Services.LoggedUser;
using Trilho.Exception.ExceptionBase;
using Trilho.Exception;

namespace Trilho.Application.UseCases.Users.Delete;
public class DeleteUserUseCase : IDeleteUserUseCase
{
    private readonly IUserWriteOnlyRepository _repository;
    private readonly IUnitOfWork _unitOfWork;
    private readonly ILoggedUser _loggedUser;
    private readonly ITeamReadOnlyRepository _teamRepository;

    public DeleteUserUseCase(IUserWriteOnlyRepository repository, IUnitOfWork unitOfWork, ILoggedUser loggedUser, ITeamReadOnlyRepository teamRepository)
    {
        _repository = repository;
        _unitOfWork = unitOfWork;
        _loggedUser = loggedUser;
        _teamRepository = teamRepository;
    }

    public async Task Execute(long id)
    {
        var loggedUser = await _loggedUser.User();

        // Evita que o último administrador exclua a si mesmo e perca o acesso.
        if (loggedUser.Id == id)
        {
            throw new ConflictException(ResourceErrorsMessage.CANNOT_DELETE_YOURSELF);
        }

        // O vínculo de liderança impede a exclusão: troque o líder do time antes.
        if (await _teamRepository.ExistsTeamLedBy(id, onlyActive: false))
        {
            throw new ConflictException(ResourceErrorsMessage.USER_LEADS_TEAM);
        }

        var result = await _repository.Delete(id);

        if (result == false)
        {
            throw new NotFoundException(ResourceErrorsMessage.USER_NOT_FOUND);
        }

        await _unitOfWork.Commit();
    }
}
