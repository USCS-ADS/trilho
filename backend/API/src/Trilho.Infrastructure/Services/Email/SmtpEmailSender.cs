using System.Net;
using System.Net.Mail;
using System.Text;
using Microsoft.Extensions.Logging;
using Trilho.Domain.Services.Email;

namespace Trilho.Infrastructure.Services.Email;
/// <summary>Envia e-mails de texto simples por SMTP. Credenciais vêm da configuração (user-secrets/variáveis de ambiente).</summary>
internal class SmtpEmailSender : IEmailSender
{
    private readonly SmtpSettings _settings;
    private readonly ILogger<SmtpEmailSender> _logger;

    public SmtpEmailSender(SmtpSettings settings, ILogger<SmtpEmailSender> logger)
    {
        _settings = settings;
        _logger = logger;
    }

    public async Task Send(EmailMessage message)
    {
        using var mail = new MailMessage
        {
            From = new MailAddress(_settings.FromAddress, _settings.FromName, Encoding.UTF8),
            Subject = message.Subject,
            SubjectEncoding = Encoding.UTF8,
            Body = message.Body,
            BodyEncoding = Encoding.UTF8,
            IsBodyHtml = false
        };
        mail.To.Add(message.To);

        using var client = new SmtpClient(_settings.Host, _settings.Port) { EnableSsl = _settings.EnableSsl };

        if (string.IsNullOrWhiteSpace(_settings.UserName) == false)
        {
            client.Credentials = new NetworkCredential(_settings.UserName, _settings.Password);
        }

        try
        {
            await client.SendMailAsync(mail);
        }
        catch (Exception exception)
        {
            // O corpo (link/código) nunca é registrado; só o destino e o motivo.
            _logger.LogError(exception, "Falha ao enviar e-mail para {To} via {Host}:{Port}", message.To, _settings.Host, _settings.Port);
            throw;
        }
    }
}
