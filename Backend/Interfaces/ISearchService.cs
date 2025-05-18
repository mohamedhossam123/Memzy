using Memzy_finalist.Models;
public interface ISearchService
{
    Task<List<User>> SearchUsersAsync(string searchTerm);
}