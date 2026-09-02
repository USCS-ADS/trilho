using Trilho.Domain.Repositories.Users;
using Trilho.Domain.Repositories;
using Trilho.Exception.ExceptionBase;
using Trilho.Exception;

namespace Trilho.Application.UseCases.Users.Delete;
public class DeleteUserUseCase : IDeleteUserUseCase
{
    private readonly IUserWriteOnlyRepository _repository;
    private readonly IUnitOfWork _unitOfWork;

    public DeleteUserUseCase(IUserWriteOnlyRepository repository, IUnitOfWork unitOfWork)
    {
        _repository = repository;
        _unitOfWork = unitOfWork;
    }

    public async Task Execute(long id)
    {
        var result = await _repository.Delete(id);

        if (result == false)
        {
            throw new NotFoundException(ResourceErrorsMessage.USER_NOT_FOUND);
        }

        await _unitOfWork.Commit();
    }
}
