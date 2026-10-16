using AutoMapper;
using Trilho.Communication.Responses.Tasks;
using Trilho.Domain.Entities;

namespace Trilho.Application.UseCases.Tasks.Shared;
internal static class TaskResponseMapper
{
    public static ResponseTaskJson ToDetail(this IMapper mapper, TaskItem task, DateOnly today)
    {
        var response = mapper.Map<ResponseTaskJson>(task);
        response.IsOverdue = task.IsOverdue(today);

        return response;
    }

    public static ResponseTaskSummaryJson ToSummary(this IMapper mapper, TaskItem task, DateOnly today)
    {
        var response = mapper.Map<ResponseTaskSummaryJson>(task);
        response.IsOverdue = task.IsOverdue(today);

        return response;
    }

    public static DateOnly Today(this TimeProvider timeProvider)
    {
        return DateOnly.FromDateTime(timeProvider.GetUtcNow().UtcDateTime);
    }
}
