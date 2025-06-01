using Memzy_finalist.Models;
public interface IAuthenticationService
{
    Task UpdateUserAsync(User user);
    Task<GetUserDto> GetUserDtoByIdAsync(int userId); 
    Task<User> GetUserByUsernameAsync(string username);
    Task<User> GetUserByIdAsync(int id);
    Task<User> CreateUserAsync(User user);
    Task<User> VerifyUserAsync(string email, string password);
    Task<int> GetAuthenticatedUserId();
    Task<string> GenerateJwtToken(User user);
    string HashPassword(string password);
    Task<int> GetFriendCountAsync(int userId);
    Task<int> GetPostCountAsync(int userId);
    int? ValidateTokenAndGetUserId(string token);

    Task<(bool Success, string Message, User User)> SignUpUserAsync(UserCreateDto dto);
Task<(bool Success, string Message, object Data)> GetCurrentUserInfoAsync();
Task<(bool Success, string Message, string Token)> RefreshTokenAsync();
Task<(bool Success, string Message, object Data)> ValidateTokenAsync();
Task<(bool Success, string Message, string Token, object User)> LoginAsync(LoginDto dto);
Task<(bool Success, string Message, object Data)> GetFriendAndPostCountAsync();
Task<(bool Success, string Message)> ForgotPasswordAsync(string email);
Task<(bool Success, string Message)> ResetPasswordAsync(string token, string newPassword);

}