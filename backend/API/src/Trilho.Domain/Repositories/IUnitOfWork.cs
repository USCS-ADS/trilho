namespace Trilho.Domain.Repositories;
public interface IUnitOfWork
{
    Task Commit();
}
