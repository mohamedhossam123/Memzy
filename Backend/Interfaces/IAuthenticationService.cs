using Memzy_finalist.Models;
public interface IAuthenticationService
{
    Task UpdateUserAsync(User user);

    Task<User> GetUserByIdAsync(int id);
    Task<User> CreateUserAsync(User user);
    Task<User> VerifyUserAsync(string email, string password);
    Task<int> GetAuthenticatedUserId();
    Task<string> GenerateJwtToken(User user);
    string HashPassword(string password);
    Task<int> GetFriendCountAsync(int userId);
    Task<int> GetPostCountAsync(int userId);
}