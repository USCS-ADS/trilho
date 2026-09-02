using AutoMapper;
using Trilho.Communication.Requests.Users;
using Trilho.Communication.Responses.Users;
using Trilho.Domain.Entities;

namespace Trilho.Application.AutoMapper;
public class AutoMapping : Profile
{
    public AutoMapping()
    {
        RequestToEntity();
        EntityToResponse();
    }

    private void RequestToEntity()
    {
        CreateMap<RequestUserJson, User>();
    }

    private void EntityToResponse()
    {
        CreateMap<User, ResponseUserJson>();
        CreateMap<User, ResponseUserListJson>();
    }
}
