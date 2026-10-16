using System.Text.RegularExpressions;
using FluentValidation;
using Trilho.Communication.Requests.Git;
using Trilho.Domain.Enum;
using Trilho.Exception;

namespace Trilho.Application.UseCases.Git.Repositories.Connect;
public partial class ConnectRepositoryValidator : AbstractValidator<RequestConnectRepositoryJson>
{
    [GeneratedRegex(@"^[\w.-]+(/[\w.-]+)+$")]
    private static partial Regex FullNamePattern();

    public ConnectRepositoryValidator()
    {
        RuleFor(request => request.Provider).Must(provider => GitProviders.IsValid(provider))
            .WithMessage(ResourceErrorsMessage.GIT_PROVIDER_INVALID);
        RuleFor(request => request.FullName).Cascade(CascadeMode.Stop)
            .NotEmpty().WithMessage(ResourceErrorsMessage.GIT_REPOSITORY_NAME_INVALID)
            .MaximumLength(200).WithMessage(ResourceErrorsMessage.GIT_REPOSITORY_NAME_INVALID)
            .Must(name => FullNamePattern().IsMatch(name)).WithMessage(ResourceErrorsMessage.GIT_REPOSITORY_NAME_INVALID);
        RuleFor(request => request.TeamId).GreaterThan(0).WithMessage(ResourceErrorsMessage.INVITE_TEAM_REQUIRED);
        RuleFor(request => request.Events!).Must(events => events.Count > 0 && events.All(e => GitEventTypes.IsValid(e)))
            .When(request => request.Events is not null)
            .WithMessage(ResourceErrorsMessage.GIT_EVENTS_INVALID);
    }
}
