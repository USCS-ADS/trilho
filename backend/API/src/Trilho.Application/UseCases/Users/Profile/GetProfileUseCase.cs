using AutoMapper;
using Trilho.Communication.Responses.Users;
using Trilho.Domain.Services.LoggedUser;

namespace Trilho.Application.UseCases.Users.Profile;
public class GetProfileUseCase : IGetProfileUseCase
{
    private readonly ILoggedUser _loggedUser;
    private readonly IMapper _mapper;

    public GetProfileUseCase(ILoggedUser loggedUser, IMapper mapper)
    {
        _loggedUser = loggedUser;
        _mapper = mapper;
    }

    public async Task<ResponseUserJson> Execute()
    {
        var user = await _loggedUser.User();

        return _mapper.Map<ResponseUserJson>(user);
    }
}
