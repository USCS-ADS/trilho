using Microsoft.AspNetCore.Diagnostics.HealthChecks;
using Microsoft.AspNetCore.HttpOverrides;
using Trilho.Api.Extensions;
using Trilho.Api.Filters;
using Trilho.Api.Jobs;
using Trilho.Api.Middleware;
using Trilho.Api.Serialization;
using Trilho.Api.Services;
using Trilho.Application;
using Trilho.Domain.Services.LoggedUser;
using Trilho.Infrastructure;
using Trilho.Infrastructure.Extensions;
using Trilho.Infrastructure.Migrations;
using Trilho.Infrastructure.Seed;

var builder = WebApplication.CreateBuilder(args);

// Logs estruturados (JSON, com escopo/CorrelationId) fora do desenvolvimento, para coleta por agregadores.
if (builder.Environment.IsDevelopment() == false)
{
    builder.Logging.ClearProviders();
    builder.Logging.AddJsonConsole(options =>
    {
        options.IncludeScopes = true;
        options.UseUtcTimestamp = true;
    });
}

builder.WebHost.ConfigureKestrel(options =>
{
    options.AddServerHeader = false;
    options.Limits.MaxRequestBodySize = 1_048_576;
});

// Atrás de proxy reverso (nginx, ingress...): usa o IP/esquema reais para rate limit e redirecionamento HTTPS.
if (builder.Configuration.GetValue<bool>("Settings:UseForwardedHeaders"))
{
    builder.Services.Configure<ForwardedHeadersOptions>(options =>
    {
        options.ForwardedHeaders = ForwardedHeaders.XForwardedFor | ForwardedHeaders.XForwardedProto;
        options.KnownNetworks.Clear();
        options.KnownProxies.Clear();
    });
}

builder.Services.AddControllers().AddJsonOptions(options =>
{
    options.JsonSerializerOptions.Converters.Add(new UtcDateTimeConverter());
    options.JsonSerializerOptions.Converters.Add(new NullableUtcDateTimeConverter());
});
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerWithBearer();

builder.Services.AddMvc(options => options.Filters.Add(typeof(ExceptionFilter)));

builder.Services.AddHttpContextAccessor();
builder.Services.AddScoped<ILoggedUser, LoggedUser>();

builder.Services.AddJwtAuthentication(builder.Configuration);
builder.Services.AddFrontendCors(builder.Configuration);
builder.Services.AddAuthRateLimiting(builder.Configuration);
builder.Services.AddHealthChecks();

builder.Services.AddInfrasctructure(builder.Configuration);
builder.Services.AddApplication();

// O job de avisos de prazo precisa do banco real; nos testes de integração fica desligado.
if (builder.Configuration.IsTestEnvironment() == false)
{
    builder.Services.AddHostedService<DueSoonNotificationJob>();
    builder.Services.AddHostedService<GitEventRetryJob>();
    builder.Services.AddHostedService<DataRetentionJob>();
}

var app = builder.Build();

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

if (builder.Configuration.GetValue<bool>("Settings:UseForwardedHeaders"))
{
    app.UseForwardedHeaders();
}

app.UseMiddleware<CorrelationIdMiddleware>();
app.UseMiddleware<SecurityHeadersMiddleware>();

if (app.Environment.IsDevelopment() == false)
{
    app.UseHsts();
}

app.UseMiddleware<CultureMiddleware>();

app.UseHttpsRedirection();

app.UseCors(CorsExtension.PolicyName);

app.UseRateLimiter();

app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();
// /health: liveness (o processo responde). /health/ready: readiness (inclui o banco).
app.MapHealthChecks("/health", new HealthCheckOptions { Predicate = _ => false });
app.MapHealthChecks("/health/ready", new HealthCheckOptions { Predicate = check => check.Tags.Contains("ready") });

// Nos testes de integração o banco é em memória: não há migration nem seed de MySQL.
if (builder.Configuration.IsTestEnvironment() == false)
{
    await MigrateDatabase();
    await AdminSeeder.Seed(app.Services, builder.Configuration);
}

app.Run();

async Task MigrateDatabase()
{
    await using var scope = app.Services.CreateAsyncScope();
    await DataBaseMigration.MigrateDatabase(scope.ServiceProvider);
}

public partial class Program { }
