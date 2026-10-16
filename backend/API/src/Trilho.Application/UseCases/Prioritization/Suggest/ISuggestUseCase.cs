using Trilho.Communication.Requests.Prioritization;
using Trilho.Communication.Responses.Prioritization;

namespace Trilho.Application.UseCases.Prioritization.Suggest;
public interface ISuggestUseCase
{
    Task<ResponsePrioritySuggestionJson> Execute(RequestSuggestionJson request);
}
