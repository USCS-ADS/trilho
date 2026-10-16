using AutoMapper;
using Trilho.Application.UseCases.Shared;
using Trilho.Communication.Responses.Users;
using Trilho.Domain.Repositories.Users;

namespace Trilho.Application.UseCases.Users.GetAll;
public class GetAllUserUseCase : IGetAllUserUseCase
{
    private const int DefaultPageSize = 100;
    private const int MaxPageSize = 200;

    private readonly IUserReadOnlyRepository _userReadOnlyRepository;
    private readonly IMapper _mapper;

    public GetAllUserUseCase(IUserReadOnlyRepository userReadOnlyRepository, IMapper mapper)
    {
        _userReadOnlyRepository = userReadOnlyRepository;
        _mapper = mapper;
    }

    public async Task<ResponseUserListJson> Execute(int? page = null, int? pageSize = null)
    {
        var (normalizedPage, normalizedSize) = Paging.Normalize(page, pageSize, DefaultPageSize, MaxPageSize);

        var result = await _userReadOnlyRepository.GetPage(normalizedPage, normalizedSize);

        return new ResponseUserListJson
        {
            Users = _mapper.Map<List<ResponseUserJson>>(result.Items),
            TotalCount = result.TotalCount,
            Page = normalizedPage,
            PageSize = normalizedSize
        };
    }
}
