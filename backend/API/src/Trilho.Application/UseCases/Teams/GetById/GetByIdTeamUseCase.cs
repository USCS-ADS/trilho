using AutoMapper;
using Trilho.Communication.Responses.Teams;
using Trilho.Domain.Enum;
using Trilho.Application.UseCases.Teams.Shared;
using Trilho.Domain.Repositories.Dashboard;
using Trilho.Domain.Repositories.Teams;
using Trilho.Domain.Services.LoggedUser;
using Trilho.Domain.Services.Settings;
using Trilho.Exception;
using Trilho.Exception.ExceptionBase;

namespace Trilho.Application.UseCases.Teams.GetById;
public class GetByIdTeamUseCase : IGetByIdTeamUseCase
{
    private readonly ITeamReadOnlyRepository _repository;
    private readonly IDashboardReadOnlyRepository _dashboardRepository;
    private readonly IPlanningSettings _settings;
    private readonly ILoggedUser _loggedUser;
    private readonly IMapper _mapper;

    public GetByIdTeamUseCase(
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

    public async Task<ResponseTeamJson> Execute(long id)
    {
        var loggedUser = await _loggedUser.User();

        var team = await _repository.GetById(id);

        if (team is null)
        {
            throw new NotFoundException(ResourceErrorsMessage.TEAM_NOT_FOUND);
        }

        var canView = loggedUser.Role == Roles.ADMIN || team.LeaderId == loggedUser.Id || team.HasMember(loggedUser.Id);

        if (canView == false)
        {
            throw new ForbiddenException(ResourceErrorsMessage.FORBIDDEN_ACTION);
        }

        var response = _mapper.Map<ResponseTeamJson>(team);

        var loads = await _dashboardRepository.GetTeamLoads([team.Id]);
        TeamWorkloadApplier.Apply([response], loads, _settings);

        return response;
    }
}
