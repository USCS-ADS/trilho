using System.Text;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Trilho.Domain.Services.Email;
using Trilho.Infrastructure;
using Trilho.Infrastructure.Services.Email;

namespace WebApi.Test.Email;
public class EmailSenderTests
{
    private static ServiceProvider BuildProvider(Dictionary<string, string?> settings)
    {
        var values = new Dictionary<string, string?>
        {
            ["InMemoryTest"] = "true",
            ["Settings:Jwt:SigningKey"] = "unit-test-signing-key-0123456789abcdef-xyz",
            ["Settings:Jwt:ExpiresMinutes"] = "60"
        };

        foreach (var (key, value) in settings)
        {
            values[key] = value;
        }

        var configuration = new ConfigurationBuilder().AddInMemoryCollection(values).Build();

        var services = new ServiceCollection();
        services.AddLogging();
        services.AddSingleton<IConfiguration>(configuration);
        services.AddInfrasctructure(configuration);

        return services.BuildServiceProvider();
    }

    [Fact]
    public void DefaultProvider_IsLog()
    {
        using var provider = BuildProvider([]);

        Assert.IsType<LogEmailSender>(provider.GetRequiredService<IEmailSender>());
    }

    [Fact]
    public void SmtpProvider_IsSelected_WhenConfigured()
    {
        using var provider = BuildProvider(new()
        {
            ["Settings:Email:Provider"] = "Smtp",
            ["Settings:Email:Smtp:Host"] = "smtp.exemplo.com",
            ["Settings:Email:Smtp:FromAddress"] = "naoresponda@exemplo.com"
        });

        Assert.IsType<SmtpEmailSender>(provider.GetRequiredService<IEmailSender>());
    }

    [Fact]
    public void SmtpProvider_WithoutHost_FailsAtStartup()
    {
        var exception = Assert.Throws<InvalidOperationException>(() => BuildProvider(new() { ["Settings:Email:Provider"] = "Smtp" }));

        Assert.Contains("Smtp:Host", exception.Message);
    }

    [Fact]
    public void UnknownProvider_FailsAtStartup()
    {
        Assert.Throws<InvalidOperationException>(() => BuildProvider(new() { ["Settings:Email:Provider"] = "Pombo" }));
    }

    [Fact]
    public async Task SmtpSender_DeliversUtf8MessageToTheServer()
    {
        using var server = new FakeSmtpServer();
        using var provider = BuildProvider(new()
        {
            ["Settings:Email:Provider"] = "Smtp",
            ["Settings:Email:Smtp:Host"] = "127.0.0.1",
            ["Settings:Email:Smtp:Port"] = server.Port.ToString(),
            ["Settings:Email:Smtp:EnableSsl"] = "false",
            ["Settings:Email:Smtp:FromAddress"] = "naoresponda@trilho.test",
            ["Settings:Email:Smtp:FromName"] = "Trilho"
        });

        await provider.GetRequiredService<IEmailSender>().Send(
            new EmailMessage("maria@trilho.test", "Código para redefinir sua senha", "Seu código é: 123456"));

        var raw = await server.Message.WaitAsync(TimeSpan.FromSeconds(5));

        Assert.Contains("To: maria@trilho.test", raw);
        Assert.Contains("<naoresponda@trilho.test>", raw);
        Assert.Contains("Trilho", raw);

        // Assunto e corpo com acentos vão codificados (UTF-8); decodifica para conferir o conteúdo.
        Assert.Contains("=?utf-8?", raw.ToLowerInvariant());
        var body = raw[(raw.IndexOf("\r\n\r\n", StringComparison.Ordinal) + 4)..].Trim();
        var decoded = body.Contains("123456") ? body : Encoding.UTF8.GetString(Convert.FromBase64String(string.Concat(body.Split('\n').Select(l => l.Trim()))));
        Assert.Contains("123456", decoded);
    }
}
