using AutoMapper;
using Trilho.Communication.Responses.Users;
using Trilho.Domain.Repositories.Users;

namespace Trilho.Application.UseCases.Users.GetAll;
public class GetAllUserUseCase : IGetAllUserUseCase
{
    private readonly IUserReadOnlyRepository _userReadOnlyRepository;
    private readonly IMapper _mapper;

    public GetAllUserUseCase(IUserReadOnlyRepository userReadOnlyRepository, IMapper mapper)
    {
        _userReadOnlyRepository = userReadOnlyRepository;
        _mapper = mapper;
    }

    public async Task<ResponseUserListJson> Execute()
    {
        var users = await _userReadOnlyRepository.GetAll();

        var response = new ResponseUserListJson
        {
            Users = users.Select(user => _mapper.Map<ResponseUserJson>(user)).ToList()
        };

        return response;
    }
}
