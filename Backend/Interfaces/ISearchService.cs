using Memzy_finalist.Models;
public interface ISearchService
{
    Task<List<UserDto>> SearchUsersAsync(string searchTerm);
}