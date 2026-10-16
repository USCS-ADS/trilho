namespace Trilho.Domain.Services.Email;
public interface IEmailSender
{
    Task Send(EmailMessage message);
}
