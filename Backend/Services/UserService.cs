using Memzy_finalist.Models;
using Microsoft.EntityFrameworkCore;
using Newtonsoft.Json;

using CloudinaryDotNet;
using CloudinaryDotNet.Actions;


public class UserService : IUserService
{
    private readonly MemzyContext _context;
    private readonly Cloudinary _cloudinary;
    private readonly IWebHostEnvironment _environment;
    private static readonly List<string> AllowedHumorTypes = new List<string>
    {
        "DarkHumor",
        "FriendlyHumor"
    };

    private readonly IConfiguration _configuration;

    public UserService(MemzyContext context, IWebHostEnvironment environment, IConfiguration configuration){
        var cloudinaryAccount = new Account(
            configuration["Cloudinary:CloudName"],
            configuration["Cloudinary:ApiKey"],
            configuration["Cloudinary:ApiSecret"]
        );
        _cloudinary = new Cloudinary(cloudinaryAccount);
        _environment = environment ?? throw new ArgumentNullException(nameof(environment));
        _context = context ?? throw new ArgumentNullException(nameof(context));
        _configuration = configuration ?? throw new ArgumentNullException(nameof(configuration));
    }

    public async Task<User> CreateUserAsync(User user)
    {
        await _context.Users.AddAsync(user);
        await _context.SaveChangesAsync();
        return user;
    }

    public async Task<User> UpdateUsernameAsync(int userId, string newName)
    {
        if (string.IsNullOrWhiteSpace(newName))
            throw new ArgumentException("Name cannot be empty");

        var user = await _context.Users
            .FirstOrDefaultAsync(u => u.UserId == userId)
            ?? throw new KeyNotFoundException("User not found");

        user.Name = newName.Trim();
        await _context.SaveChangesAsync();

        return user;
    }

    public async Task<User> UpdateUserPassword(int userid, string user)
    {
        var existingUser = await _context.Users.FindAsync(userid);
        if (existingUser != null)
        {
            existingUser.PasswordHash = user;
            await _context.SaveChangesAsync();
        }
        return existingUser;
    }
    

    public async Task<User> UpdateUserProfilePicture(User user)
    {
        var existingUser = await _context.Users.FindAsync(user.UserId);
        if (existingUser != null)
        {
            existingUser.ProfilePictureUrl = user.ProfilePictureUrl;
            await _context.SaveChangesAsync();
        }
        return existingUser;
    }

    public async Task<User> UpdateUserBio(int userid, string newBio)
    {
        var existingUser = await _context.Users.FindAsync(userid);
        if (existingUser != null)
        {
            existingUser.Bio = newBio;
            await _context.SaveChangesAsync();
        }
        return existingUser;
    }

    public async Task DeleteUserAsync(int id)
    {
        var user = await _context.Users.FindAsync(id);
        if (user != null)
        {
            _context.Users.Remove(user);
            await _context.SaveChangesAsync();
        }
    }

    public async Task<User> ForgotPasswordAsync(string email)
    {
        return await _context.Users.FirstOrDefaultAsync(u => u.Email == email);
    }

    public async Task<User> ResetPasswordAsync(User user, string newPassword)
    {
        user.PasswordHash = newPassword;
        return await UpdateUserPassword(user.UserId, newPassword);
    }

    public async Task<string> UploadProfilePictureAsync(IFormFile file, int userId)
    {
        if (file == null || file.Length == 0)
            throw new ArgumentException("No file uploaded");

        // Validate file size (up to 20MB)
        if (file.Length > 20 * 1024 * 1024)
            throw new ArgumentException("File size too large. Max 20MB allowed");

        var user = await _context.Users.FindAsync(userId)
            ?? throw new KeyNotFoundException("User not found");

        var uploadParams = new ImageUploadParams() 
        {
            File = new FileDescription(file.FileName, file.OpenReadStream()),
            PublicId = $"memzy/profile/{userId}_{Guid.NewGuid()}",
            Transformation = new Transformation()
                .Width(500).Height(500).Crop("fill").Quality("auto")
        };

        var uploadResult = await _cloudinary.UploadAsync(uploadParams);

        if (uploadResult.Error != null)
            throw new Exception($"Cloudinary upload failed: {uploadResult.Error.Message}");

        user.ProfilePictureUrl = uploadResult.SecureUrl.ToString();
        await _context.SaveChangesAsync();

        return user.ProfilePictureUrl;
    }


}