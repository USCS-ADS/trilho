using Microsoft.Extensions.Configuration;

namespace Trilho.Infrastructure.Services.Email;
/// <summary>Configuração do envio por SMTP (<c>Settings:Email:Smtp</c>).</summary>
internal record SmtpSettings(
    string Host,
    int Port,
    string? UserName,
    string? Password,
    bool EnableSsl,
    string FromAddress,
    string FromName)
{
    public static SmtpSettings From(IConfiguration configuration)
    {
        var section = configuration.GetSection("Settings:Email:Smtp");

        return new SmtpSettings(
            Host: section["Host"] ?? string.Empty,
            Port: section.GetValue<int?>("Port") ?? 587,
            UserName: section["UserName"],
            Password: section["Password"],
            EnableSsl: section.GetValue<bool?>("EnableSsl") ?? true,
            FromAddress: section["FromAddress"] ?? string.Empty,
            FromName: section["FromName"] ?? "Trilho");
    }

    /// <summary>Falha na subida (e não no primeiro e-mail) se faltar o essencial.</summary>
    public void EnsureValid()
    {
        if (string.IsNullOrWhiteSpace(Host) || string.IsNullOrWhiteSpace(FromAddress))
        {
            throw new InvalidOperationException(
                "Settings:Email:Provider=Smtp exige Settings:Email:Smtp:Host e Settings:Email:Smtp:FromAddress.");
        }
    }
}
