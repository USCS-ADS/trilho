using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;
using Trilho.Domain.Services.Email;

namespace Trilho.Infrastructure.Services.Email;
/// <summary>
/// Implementação de desenvolvimento: não envia e-mail, apenas registra no log.
/// O corpo (que contém links/códigos) só é registrado com <c>Settings:Email:LogBody</c> = true.
/// Em produção, trocar por uma implementação SMTP/API de e-mail.
/// </summary>
internal class LogEmailSender : IEmailSender
{
    private readonly ILogger<LogEmailSender> _logger;
    private readonly bool _logBody;

    public LogEmailSender(ILogger<LogEmailSender> logger, IConfiguration configuration)
    {
        _logger = logger;
        _logBody = configuration.GetValue<bool>("Settings:Email:LogBody");
    }

    public Task Send(EmailMessage message)
    {
        if (_logBody)
        {
            _logger.LogInformation("E-mail (simulado) para {To} | {Subject}\n{Body}", message.To, message.Subject, message.Body);
        }
        else
        {
            _logger.LogInformation("E-mail (simulado) para {To} | {Subject}", message.To, message.Subject);
        }

        return Task.CompletedTask;
    }
}
