using Trilho.Application.AutoMapper;
using Trilho.Application.UseCases.Comments.Create;
using Trilho.Application.UseCases.Comments.Delete;
using Trilho.Application.UseCases.Dashboard.Get;
using Trilho.Application.UseCases.Git.Repositories.Connect;
using Trilho.Application.UseCases.Git.Repositories.Disconnect;
using Trilho.Application.UseCases.Git.Repositories.GetAll;
using Trilho.Application.UseCases.Git.Repositories.Retry;
using Trilho.Application.UseCases.Git.Repositories.Update;
using Trilho.Application.UseCases.Git.Shared;
using Trilho.Application.UseCases.Git.Webhook;
using Trilho.Application.UseCases.Invites.Accept;
using Trilho.Application.UseCases.Invites.Cancel;
using Trilho.Application.UseCases.Invites.Create;
using Trilho.Application.UseCases.Invites.GetPending;
using Trilho.Application.UseCases.Invites.Lookup;
using Trilho.Application.Services;
using Trilho.Application.UseCases.Maintenance.PurgeOldData;
using Trilho.Application.UseCases.Notifications.GenerateDueSoon;
using Trilho.Application.UseCases.Notifications.GetMine;
using Trilho.Application.UseCases.Notifications.MarkAllAsRead;
using Trilho.Application.UseCases.Notifications.MarkAsRead;
using Trilho.Application.UseCases.Notifications.Shared;
using Trilho.Application.UseCases.PasswordReset.Confirm;
using Trilho.Application.UseCases.PasswordReset.Request;
using Trilho.Application.UseCases.PasswordReset.Shared;
using Trilho.Application.UseCases.PasswordReset.Verify;
using Trilho.Application.UseCases.Prioritization.ApplyRanking;
using Trilho.Application.UseCases.Prioritization.GetRanking;
using Trilho.Application.UseCases.Prioritization.Suggest;
using Trilho.Application.UseCases.Subtasks.Create;
using Trilho.Application.UseCases.Subtasks.Delete;
using Trilho.Application.UseCases.Subtasks.Update;
using Trilho.Application.UseCases.Tasks.Create;
using Trilho.Application.UseCases.Tasks.Delete;
using Trilho.Application.UseCases.Tasks.GetActivity;
using Trilho.Application.UseCases.Tasks.GetBoard;
using Trilho.Application.UseCases.Tasks.GetById;
using Trilho.Application.UseCases.Tasks.Move;
using Trilho.Application.UseCases.Tasks.Shared;
using Trilho.Application.UseCases.Tasks.Update;
using Trilho.Application.UseCases.Teams.AddMember;
using Trilho.Application.UseCases.Teams.Archive;
using Trilho.Application.UseCases.Teams.ChangeLeader;
using Trilho.Application.UseCases.Teams.Create;
using Trilho.Application.UseCases.Teams.Delete;
using Trilho.Application.UseCases.Teams.GetAll;
using Trilho.Application.UseCases.Teams.GetById;
using Trilho.Application.UseCases.Teams.RemoveMember;
using Trilho.Application.UseCases.Teams.Restore;
using Trilho.Application.UseCases.Teams.Shared;
using Trilho.Application.UseCases.Teams.Update;
using Trilho.Application.UseCases.Users.ChangePassword;
using Trilho.Application.UseCases.Users.Create;
using Trilho.Application.UseCases.Users.SetStatus;
using Trilho.Application.UseCases.Users.Delete;
using Trilho.Application.UseCases.Users.GetAll;
using Trilho.Application.UseCases.Users.GetById;
using Trilho.Application.UseCases.Users.Login;
using Trilho.Application.UseCases.Users.Profile;
using Trilho.Application.UseCases.Users.Update;
using Trilho.Domain.Services.Prioritization;
using Microsoft.Extensions.DependencyInjection;

namespace Trilho.Application;
public static class DependencyInjectionExtension
{
    public static void AddApplication(this IServiceCollection services)
    {
        AddUseCases(services);
        AddAutoMapper(services);
    }


    private static void AddAutoMapper(IServiceCollection services)
    {
        services.AddAutoMapper(cfg =>
        {
            cfg.AddProfile<AutoMapping>();
        });
    }

    private static void AddUseCases(IServiceCollection services)
    {
        services.AddScoped<ICreateUserUseCase, CreateUserUseCase>();
        services.AddScoped<IDeleteUserUseCase, DeleteUserUseCase>();
        services.AddScoped<IGetAllUserUseCase, GetAllUserUseCase>();
        services.AddScoped<IGetByIdUserUseCase, GetByIdUserUseCase>();
        services.AddScoped<IUpdateUserUseCase, UpdateUserUseCase>();
        services.AddScoped<IChangePasswordUseCase, ChangePasswordUseCase>();
        services.AddScoped<ISetUserStatusUseCase, SetUserStatusUseCase>();
        services.AddScoped<ILoginUseCase, LoginUseCase>();
        services.AddScoped<IGetProfileUseCase, GetProfileUseCase>();

        services.AddScoped<ITeamLeaderGuard, TeamLeaderGuard>();
        services.AddScoped<ICreateTeamUseCase, CreateTeamUseCase>();
        services.AddScoped<IGetAllTeamUseCase, GetAllTeamUseCase>();
        services.AddScoped<IGetByIdTeamUseCase, GetByIdTeamUseCase>();
        services.AddScoped<IUpdateTeamUseCase, UpdateTeamUseCase>();
        services.AddScoped<IChangeTeamLeaderUseCase, ChangeTeamLeaderUseCase>();
        services.AddScoped<IAddTeamMemberUseCase, AddTeamMemberUseCase>();
        services.AddScoped<IRemoveTeamMemberUseCase, RemoveTeamMemberUseCase>();
        services.AddScoped<IArchiveTeamUseCase, ArchiveTeamUseCase>();
        services.AddScoped<IRestoreTeamUseCase, RestoreTeamUseCase>();
        services.AddScoped<IDeleteTeamUseCase, DeleteTeamUseCase>();

        services.AddSingleton(TimeProvider.System);

        services.AddScoped<ITaskAccessGuard, TaskAccessGuard>();
        services.AddScoped<ICreateTaskUseCase, CreateTaskUseCase>();
        services.AddScoped<IGetBoardTaskUseCase, GetBoardTaskUseCase>();
        services.AddScoped<IGetByIdTaskUseCase, GetByIdTaskUseCase>();
        services.AddScoped<IUpdateTaskUseCase, UpdateTaskUseCase>();
        services.AddScoped<IMoveTaskUseCase, MoveTaskUseCase>();
        services.AddScoped<IDeleteTaskUseCase, DeleteTaskUseCase>();
        services.AddScoped<IGetTaskActivityUseCase, GetTaskActivityUseCase>();

        services.AddScoped<ICreateSubtaskUseCase, CreateSubtaskUseCase>();
        services.AddScoped<IUpdateSubtaskUseCase, UpdateSubtaskUseCase>();
        services.AddScoped<IDeleteSubtaskUseCase, DeleteSubtaskUseCase>();

        services.AddScoped<ICreateCommentUseCase, CreateCommentUseCase>();
        services.AddScoped<IDeleteCommentUseCase, DeleteCommentUseCase>();

        services.AddScoped<ICreateInviteUseCase, CreateInviteUseCase>();
        services.AddScoped<IGetPendingInviteUseCase, GetPendingInviteUseCase>();
        services.AddScoped<ICancelInviteUseCase, CancelInviteUseCase>();
        services.AddScoped<ILookupInviteUseCase, LookupInviteUseCase>();
        services.AddScoped<IAcceptInviteUseCase, AcceptInviteUseCase>();

        services.AddScoped<ITaskNotifier, TaskNotifier>();
        services.AddScoped<IGetMyNotificationsUseCase, GetMyNotificationsUseCase>();
        services.AddScoped<IMarkNotificationAsReadUseCase, MarkNotificationAsReadUseCase>();
        services.AddScoped<IMarkAllNotificationsAsReadUseCase, MarkAllNotificationsAsReadUseCase>();
        services.AddScoped<IGenerateDueSoonNotificationsUseCase, GenerateDueSoonNotificationsUseCase>();

        services.AddScoped<IGetDashboardUseCase, GetDashboardUseCase>();
        services.AddScoped<IPurgeOldDataUseCase, PurgeOldDataUseCase>();

        services.AddSingleton<IGitEventRunner, GitEventRunner>();
        services.AddScoped<IReceiveGitWebhookUseCase, ReceiveGitWebhookUseCase>();
        services.AddScoped<IProcessGitEventUseCase, ProcessGitEventUseCase>();
        services.AddScoped<IRegisterGitEventFailureUseCase, RegisterGitEventFailureUseCase>();
        services.AddScoped<IConnectRepositoryUseCase, ConnectRepositoryUseCase>();
        services.AddScoped<IGetAllRepositoriesUseCase, GetAllRepositoriesUseCase>();
        services.AddScoped<IUpdateRepositoryUseCase, UpdateRepositoryUseCase>();
        services.AddScoped<IDisconnectRepositoryUseCase, DisconnectRepositoryUseCase>();
        services.AddScoped<IRetryRepositoryEventsUseCase, RetryRepositoryEventsUseCase>();

        services.AddSingleton<IPrioritizationEngine, RuleBasedPrioritizationEngine>();
        services.AddScoped<IGetRankingUseCase, GetRankingUseCase>();
        services.AddScoped<ISuggestUseCase, SuggestUseCase>();
        services.AddScoped<IApplyRankingUseCase, ApplyRankingUseCase>();

        services.AddScoped<IPasswordResetCodeChecker, PasswordResetCodeChecker>();
        services.AddScoped<IRequestPasswordResetUseCase, RequestPasswordResetUseCase>();
        services.AddScoped<IVerifyPasswordResetCodeUseCase, VerifyPasswordResetCodeUseCase>();
        services.AddScoped<IConfirmPasswordResetUseCase, ConfirmPasswordResetUseCase>();

    }
}
