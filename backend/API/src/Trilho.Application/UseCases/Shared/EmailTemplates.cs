using Trilho.Domain.Services.Email;

namespace Trilho.Application.UseCases.Shared;
internal static class EmailTemplates
{
    public static EmailMessage Invite(string to, string fullName, string teamName, string link, int expiresDays)
    {
        var body = $"""
            Olá, {fullName}!

            Você foi convidado(a) para integrar o time {teamName} no Trilho.
            Para ativar sua conta e definir sua senha, acesse:

            {link}

            Este convite é válido por {expiresDays} dias.
            """;

        return new EmailMessage(to, "Você foi convidado(a) para o Trilho", body);
    }

    public static EmailMessage PasswordResetCode(string to, string name, string code, int expiresMinutes)
    {
        var body = $"""
            Olá, {name}!

            Seu código para redefinir a senha do Trilho é: {code}

            Ele é válido por {expiresMinutes} minutos. Se você não pediu a redefinição, ignore este e-mail.
            """;

        return new EmailMessage(to, "Código para redefinir sua senha", body);
    }
}
