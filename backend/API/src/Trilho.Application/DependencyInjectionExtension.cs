using Trilho.Application.AutoMapper;
using Trilho.Application.UseCases.Users.Create;
using Trilho.Application.UseCases.Users.Delete;
using Trilho.Application.UseCases.Users.GetAll;
using Trilho.Application.UseCases.Users.GetById;
using Trilho.Application.UseCases.Users.Login;
using Trilho.Application.UseCases.Users.Update;
using Microsoft.Extensions.DependencyInjection;

namespace Trilho.Application;
public static class DependencyInjectionExtension
{
    public static void AddApplication(this IServiceCollection services)
    {
        AddUseCases(services);
        AddAutoMapper(services);
    }


    private static void AddAutoMapper(IServiceCollection services)
    {
        services.AddAutoMapper(cfg =>
        {
            cfg.AddProfile<AutoMapping>();
        });
    }

    private static void AddUseCases(IServiceCollection services)
    {
        services.AddScoped<ICreateUserUseCase, CreateUserUseCase>();
        services.AddScoped<IDeleteUserUseCase, DeleteUserUseCase>();
        services.AddScoped<IGetAllUserUseCase, GetAllUserUseCase>();
        services.AddScoped<IGetByIdUserUseCase, GetByIdUserUseCase>();
        services.AddScoped<IUpdateUserUseCase, UpdateUserUseCase>();
        services.AddScoped<ILoginUseCase, LoginUseCase>();

    }
}
