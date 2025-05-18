using Memzy_finalist.Models;
public interface IHumorService
{
    Task<User> ChangeHumorAsync(int userId, List<string> humorTypes);
    Task<User> AddHumorAsync(int userId, List<string> humorTypes);
    Task RemoveHumorAsync(int userId);
}