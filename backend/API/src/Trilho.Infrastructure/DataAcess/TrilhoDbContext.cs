using Trilho.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace Trilho.Infrastructure.DataAcess;
internal class TrilhoDbContext : DbContext
{
    public TrilhoDbContext(DbContextOptions options) : base(options) { }

    public DbSet<User> Users { get; set; }

}
