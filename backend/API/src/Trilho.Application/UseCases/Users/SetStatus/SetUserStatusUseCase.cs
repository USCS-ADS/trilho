using Trilho.Communication.Requests.Users;
using Trilho.Domain.Repositories;
using Trilho.Domain.Repositories.Teams;
using Trilho.Domain.Repositories.Users;
using Trilho.Domain.Services.LoggedUser;
using Trilho.Exception;
using Trilho.Exception.ExceptionBase;

namespace Trilho.Application.UseCases.Users.SetStatus;
/// <summary>
/// Ativa ou desativa um usuário (só administrador). Desativar preserva o histórico (tarefas, comentários),
/// mas bloqueia o login e invalida o token em uso — alternativa reversível à exclusão.
/// </summary>
public class SetUserStatusUseCase : ISetUserStatusUseCase
{
    private readonly IUserUpdateOnlyRepository _repository;
    private readonly IUnitOfWork _unitOfWork;
    private readonly ILoggedUser _loggedUser;
    private readonly ITeamReadOnlyRepository _teamRepository;

    public SetUserStatusUseCase(
        IUserUpdateOnlyRepository repository,
        IUnitOfWork unitOfWork,
        ILoggedUser loggedUser,
        ITeamReadOnlyRepository teamRepository)
    {
        _repository = repository;
        _unitOfWork = unitOfWork;
        _loggedUser = loggedUser;
        _teamRepository = teamRepository;
    }

    public async Task Execute(long id, RequestUserStatusJson request)
    {
        var loggedUser = await _loggedUser.User();

        var user = await _repository.GetById(id)
            ?? throw new NotFoundException(ResourceErrorsMessage.USER_NOT_FOUND);

        if (request.IsActive == user.IsActive)
        {
            return;
        }

        if (request.IsActive == false)
        {
            // Evita que o administrador perca o próprio acesso.
            if (loggedUser.Id == id)
            {
                throw new ConflictException(ResourceErrorsMessage.CANNOT_DEACTIVATE_YOURSELF);
            }

            // Time sem líder ativo fica sem dono: troque o líder antes.
            if (await _teamRepository.ExistsTeamLedBy(id, onlyActive: false))
            {
                throw new ConflictException(ResourceErrorsMessage.USER_LEADS_TEAM);
            }
        }

        user.IsActive = request.IsActive;

        _repository.Update(user);

        await _unitOfWork.Commit();
    }
}
