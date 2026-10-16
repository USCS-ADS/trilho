using AutoMapper;
using Trilho.Communication.Responses.Teams;
using Trilho.Domain.Enum;
using Trilho.Application.UseCases.Teams.Shared;
using Trilho.Domain.Repositories.Dashboard;
using Trilho.Domain.Repositories.Teams;
using Trilho.Domain.Services.LoggedUser;
using Trilho.Domain.Services.Settings;

namespace Trilho.Application.UseCases.Teams.GetAll;
public class GetAllTeamUseCase : IGetAllTeamUseCase
{
    private readonly ITeamReadOnlyRepository _repository;
    private readonly IDashboardReadOnlyRepository _dashboardRepository;
    private readonly IPlanningSettings _settings;
    private readonly ILoggedUser _loggedUser;
    private readonly IMapper _mapper;

    public GetAllTeamUseCase(
        ITeamReadOnlyRepository repository,
        IDashboardReadOnlyRepository dashboardRepository,
        IPlanningSettings settings,
        ILoggedUser loggedUser,
        IMapper mapper)
    {
        _repository = repository;
        _dashboardRepository = dashboardRepository;
        _settings = settings;
        _loggedUser = loggedUser;
        _mapper = mapper;
    }

    public async Task<ResponseTeamListJson> Execute(bool includeArchived = false)
    {
        var loggedUser = await _loggedUser.User();

        // Administradores veem todos os times; os demais, apenas aqueles de que participam.
        long? memberFilter = loggedUser.Role == Roles.ADMIN ? null : loggedUser.Id;

        var teams = await _repository.GetAll(memberFilter, includeArchived);

        var response = _mapper.Map<List<ResponseTeamJson>>(teams);

        var loads = await _dashboardRepository.GetTeamLoads(teams.Select(team => team.Id).ToList());
        TeamWorkloadApplier.Apply(response, loads, _settings);

        return new ResponseTeamListJson { Teams = response };
    }
}
