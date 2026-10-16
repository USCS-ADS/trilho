using System.Collections.Concurrent;
using System.Text.RegularExpressions;
using Trilho.Domain.Services.Email;

namespace WebApi.Test;
/// <summary>Substitui o envio de e-mail nos testes e guarda as mensagens para inspeção.</summary>
public class CapturingEmailSender : IEmailSender
{
    private readonly ConcurrentQueue<EmailMessage> _messages = new();

    public Task Send(EmailMessage message)
    {
        _messages.Enqueue(message);

        return Task.CompletedTask;
    }

    public EmailMessage LastTo(string email)
    {
        return _messages.Reverse().First(message => message.To.Equals(email, StringComparison.OrdinalIgnoreCase));
    }

    public bool AnyTo(string email)
    {
        return _messages.Any(message => message.To.Equals(email, StringComparison.OrdinalIgnoreCase));
    }

    /// <summary>Token do link de ativação do último convite enviado ao e-mail.</summary>
    public string InviteTokenFor(string email)
    {
        var match = Regex.Match(LastTo(email).Body, @"token=([\w\-%.]+)");

        return Uri.UnescapeDataString(match.Groups[1].Value);
    }

    /// <summary>Código de 6 dígitos do último e-mail de redefinição enviado ao e-mail.</summary>
    public string ResetCodeFor(string email)
    {
        return Regex.Match(LastTo(email).Body, @"\b(\d{6})\b").Groups[1].Value;
    }
}
