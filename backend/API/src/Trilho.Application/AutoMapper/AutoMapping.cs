using AutoMapper;
using Trilho.Communication.Requests.Users;
using Trilho.Communication.Responses.Tasks;
using Trilho.Communication.Responses.Teams;
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

        CreateMap<Subtask, ResponseSubtaskJson>();

        CreateMap<TaskComment, ResponseCommentJson>()
            .ForMember(dest => dest.AuthorName, opt => opt.MapFrom(src => src.Author != null ? src.Author.Name : string.Empty));

        CreateMap<TaskActivity, ResponseActivityJson>()
            .ForMember(dest => dest.ActorName, opt => opt.MapFrom(src => src.Actor != null ? src.Actor.Name : string.Empty));

        CreateMap<TaskItem, ResponseTaskSummaryJson>()
            .ForMember(dest => dest.IsOverdue, opt => opt.Ignore())
            .ForMember(dest => dest.SubtasksTotal, opt => opt.MapFrom(src => src.Subtasks.Count))
            .ForMember(dest => dest.SubtasksDone, opt => opt.MapFrom(src => src.Subtasks.Count(subtask => subtask.IsDone)))
            .ForMember(dest => dest.CommentCount, opt => opt.MapFrom(src => src.Comments.Count));

        CreateMap<TaskItem, ResponseTaskJson>()
            .ForMember(dest => dest.IsOverdue, opt => opt.Ignore())
            .ForMember(dest => dest.Git, opt => opt.MapFrom(src => src.GitBranch == null
                ? null
                : new ResponseTaskGitJson
                {
                    Branch = src.GitBranch,
                    LastCommitAt = src.LastCommitAt,
                    PullRequest = src.PullRequestNumber == null
                        ? null
                        : new ResponseTaskPullRequestJson { Number = src.PullRequestNumber.Value, State = src.PullRequestState ?? string.Empty }
                }))
            .ForMember(dest => dest.Progress, opt => opt.MapFrom(src =>
                src.Subtasks.Count == 0 ? 0 : (int)Math.Round(100.0 * src.Subtasks.Count(subtask => subtask.IsDone) / src.Subtasks.Count, MidpointRounding.AwayFromZero)));

        CreateMap<Team, ResponseTeamJson>()
            .ForMember(dest => dest.MemberCount, opt => opt.MapFrom(src => src.Members.Count))
            .ForMember(dest => dest.Members, opt => opt.MapFrom(src => src.Members.Where(member => member.User != null).Select(member => member.User!)));
    }
}
