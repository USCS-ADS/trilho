using AutoMapper;
using Trilho.Communication.Responses.Users;
using Trilho.Domain.Repositories.Users;
using Trilho.Exception.ExceptionBase;
using Trilho.Exception;

namespace Trilho.Application.UseCases.Users.GetById;
public class GetByIdUserUseCase : IGetByIdUserUseCase
{
    private readonly IMapper _mapper;
    private IUserReadOnlyRepository _repository;
    public GetByIdUserUseCase(IMapper mapper, IUserReadOnlyRepository repository)
    {
        _mapper = mapper;
        _repository = repository;
    }
    public async Task<ResponseUserJson> Execute(long id)
    {
        var result = await _repository.GetById(id);

        if (result is null)
        {
            throw new NotFoundException(ResourceErrorsMessage.USER_NOT_FOUND);
        }

        return _mapper.Map<ResponseUserJson>(result);
    }
}
