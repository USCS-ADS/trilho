using Trilho.Infrastructure.DataAcess;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;

namespace Trilho.Infrastructure.Migrations;
public static class DataBaseMigration
{
    public async static Task MigrateDatabase(IServiceProvider serviceProvider)
    {
        var dbContext = serviceProvider.GetRequiredService<TrilhoDbContext>();

        await dbContext.Database.MigrateAsync();
    }
}