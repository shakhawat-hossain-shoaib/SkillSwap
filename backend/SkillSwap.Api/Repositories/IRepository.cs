using System.Linq.Expressions;

namespace SkillSwap.Api.Repositories;

/// <summary>
/// Generic repository interface providing standard CRUD operations.
/// Other devs can use this directly or create entity-specific repos that extend it.
/// </summary>
/// <typeparam name="T">Entity type.</typeparam>
public interface IRepository<T> where T : class
{
    Task<T?> GetByIdAsync(int id);
    Task<IEnumerable<T>> GetAllAsync();
    Task<IEnumerable<T>> FindAsync(Expression<Func<T, bool>> predicate);
    Task<T> AddAsync(T entity);
    Task UpdateAsync(T entity);
    Task DeleteAsync(T entity);
    Task<bool> ExistsAsync(int id);
}
