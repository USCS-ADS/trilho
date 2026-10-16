using Trilho.Communication.Responses.Dashboard;

namespace Trilho.Application.UseCases.Dashboard.Get;
public interface IGetDashboardUseCase
{
    Task<ResponseDashboardJson> Execute();
}
