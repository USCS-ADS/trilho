using Trilho.Communication.Requests.Users;
using Trilho.Communication.Responses.Users;
using Trilho.Domain.Repositories;
using Trilho.Domain.Repositories.Users;
using Trilho.Domain.Security.Cryptography;
using Trilho.Domain.Security.Tokens;
using Trilho.Domain.Services.Settings;
using Trilho.Exception.ExceptionBase;

namespace Trilho.Application.UseCases.Users.Login;
public class LoginUseCase : ILoginUseCase
{
    private readonly IUserReadOnlyRepository _repository;
    private readonly IUserUpdateOnlyRepository _updateRepository;
    private readonly IUnitOfWork _unitOfWork;
    private readonly IPasswordEncripter _passwordEncripter;
    private readonly IAcessTokenGenerator _accessTokenGenerator;
    private readonly IAuthFlowSettings _settings;
    private readonly TimeProvider _timeProvider;

    public LoginUseCase(
        IUserReadOnlyRepository repository,
        IUserUpdateOnlyRepository updateRepository,
        IUnitOfWork unitOfWork,
        IPasswordEncripter passwordEncripter,
        IAcessTokenGenerator accessTokenGenerator,
        IAuthFlowSettings settings,
        TimeProvider timeProvider)
    {
        _repository = repository;
        _updateRepository = updateRepository;
        _unitOfWork = unitOfWork;
        _passwordEncripter = passwordEncripter;
        _accessTokenGenerator = accessTokenGenerator;
        _settings = settings;
        _timeProvider = timeProvider;
    }

    public async Task<ResponseUserLoginJson> Execute(RequestUserLoginJson request)
    {
        var user = await _repository.GetUserByEmail(request.Email.Trim().ToLowerInvariant());

        // Conta inexistente ou desativada: mesma resposta de senha errada, sem guardar nada.
        if (user is null || user.IsActive == false)
        {
            throw new InvalidLoginException();
        }

        var now = _timeProvider.GetUtcNow().UtcDateTime;

        // Bloqueada: nem confere a senha (quem adivinha não descobre se acertou durante o bloqueio).
        if (user.LockoutEnd is { } lockoutEnd && lockoutEnd > now)
        {
            throw new LoginLockedException();
        }

        var passwordMatch = _passwordEncripter.Verify(request.Password, user.Password);

        if (passwordMatch == false)
        {
            await RegisterFailure(user.Id, now);

            throw new InvalidLoginException();
        }

        if (user.FailedLoginAttempts > 0 || user.LockoutEnd is not null)
        {
            await ClearFailures(user.Id);
        }

        return new ResponseUserLoginJson
        {
            Name = user.Name,
            Token = _accessTokenGenerator.Generate(user)
        };
    }

    private async Task RegisterFailure(long userId, DateTime now)
    {
        // A leitura do login não é rastreada: relê a conta para gravar o contador.
        var tracked = await _updateRepository.GetById(userId);

        if (tracked is null)
        {
            return;
        }

        tracked.FailedLoginAttempts += 1;

        if (tracked.FailedLoginAttempts >= _settings.LoginMaxFailedAttempts)
        {
            tracked.LockoutEnd = now.AddMinutes(_settings.LoginLockoutMinutes);
            tracked.FailedLoginAttempts = 0;
        }

        _updateRepository.Update(tracked);

        await _unitOfWork.Commit();
    }

    private async Task ClearFailures(long userId)
    {
        var tracked = await _updateRepository.GetById(userId);

        if (tracked is null)
        {
            return;
        }

        tracked.FailedLoginAttempts = 0;
        tracked.LockoutEnd = null;

        _updateRepository.Update(tracked);

        await _unitOfWork.Commit();
    }
}
