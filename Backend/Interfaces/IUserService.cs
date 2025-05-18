using Memzy_finalist.Models;
public interface IUserService
{
    Task<User> UpdateUsernameAsync(int userid, string user);
    Task<User> UpdateUserPassword(int userid, string user);
    Task<User> UpdateUserProfilePicture(User user);
    Task<User> UpdateUserBio(int userid, string newBio);
    Task DeleteUserAsync(int id);

    Task<User> ForgotPasswordAsync(string email);
    Task<User> ResetPasswordAsync(User user, string newPassword);
    Task<string> UploadProfilePictureAsync(IFormFile file, int userId);
}