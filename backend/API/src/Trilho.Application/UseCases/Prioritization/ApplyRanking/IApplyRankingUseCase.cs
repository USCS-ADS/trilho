using Trilho.Communication.Requests.Prioritization;
using Trilho.Communication.Responses.Prioritization;

namespace Trilho.Application.UseCases.Prioritization.ApplyRanking;
public interface IApplyRankingUseCase
{
    Task<ResponseApplyRankingJson> Execute(RequestApplyRankingJson request);
}
