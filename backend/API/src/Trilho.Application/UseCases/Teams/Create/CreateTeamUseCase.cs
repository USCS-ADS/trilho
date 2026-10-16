using AutoMapper;
using FluentValidation.Results;
using Trilho.Application.UseCases.Teams.Shared;
using Trilho.Communication.Requests.Teams;
using Trilho.Communication.Responses.Teams;
using Trilho.Domain.Entities;
using Trilho.Domain.Repositories;
using Trilho.Domain.Repositories.Teams;
using Trilho.Exception;
using Trilho.Exception.ExceptionBase;

namespace Trilho.Application.UseCases.Teams.Create;
public class CreateTeamUseCase : ICreateTeamUseCase
{
    private readonly ITeamWriteOnlyRepository _writeRepository;
    private readonly ITeamReadOnlyRepository _readRepository;
    private readonly ITeamLeaderGuard _leaderGuard;
    private readonly IUnitOfWork _unitOfWork;
    private readonly IMapper _mapper;

    public CreateTeamUseCase(
        ITeamWriteOnlyRepository writeRepository,
        ITeamReadOnlyRepository readRepository,
        ITeamLeaderGuard leaderGuard,
        IUnitOfWork unitOfWork,
        IMapper mapper)
    {
        _writeRepository = writeRepository;
        _readRepository = readRepository;
        _leaderGuard = leaderGuard;
        _unitOfWork = unitOfWork;
        _mapper = mapper;
    }

    public async Task<ResponseTeamJson> Execute(RequestTeamJson request)
    {
        request.Name = request.Name?.Trim() ?? string.Empty;
        request.Description = request.Description?.Trim() ?? string.Empty;

        await Validate(request);

        var leader = await _leaderGuard.EnsureCanLead(request.LeaderId);

        var team = new Team
        {
            Name = request.Name,
            Description = request.Description,
            LeaderId = leader.Id,
            CreatedAt = DateTime.UtcNow,
            // O líder sempre participa do próprio time.
            Members = [new TeamMember { UserId = leader.Id, JoinedAt = DateTime.UtcNow }]
        };

        await _writeRepository.Create(team);
        await _unitOfWork.Commit();

        var created = await _readRepository.GetById(team.Id);

        return _mapper.Map<ResponseTeamJson>(created);
    }

    private async Task Validate(RequestTeamJson request)
    {
        var result = new CreateTeamValidator().Validate(request);

        if (result.IsValid && await _readRepository.ExistsTeamWithName(request.Name))
        {
            result.Errors.Add(new ValidationFailure(nameof(request.Name), ResourceErrorsMessage.TEAM_NAME_ALREADY_EXISTS));
        }

        if (result.IsValid == false)
        {
            throw new ErrorOnValidationException(result.Errors.Select(e => e.ErrorMessage).ToList());
        }
    }
}
