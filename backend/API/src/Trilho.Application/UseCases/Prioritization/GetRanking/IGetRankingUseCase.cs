using Trilho.Communication.Responses.Prioritization;

namespace Trilho.Application.UseCases.Prioritization.GetRanking;
public interface IGetRankingUseCase
{
    Task<List<ResponseRankedTaskJson>> Execute(long? teamId);
}
