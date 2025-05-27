// IHumorService.cs
using Memzy_finalist.Models;

namespace Memzy_finalist.Services
{
    public interface IHumorService
    {
        Task<User> ChangeHumorAsync(int userId, List<string> humorTypes);
        Task RemoveHumorAsync(int userId);
        Task<List<string>> GetUserHumorPreferencesAsync(int userId);
        
    }
}