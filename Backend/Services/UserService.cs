using Memzy_finalist.Models;
using Microsoft.EntityFrameworkCore;
using CloudinaryDotNet;
using CloudinaryDotNet.Actions;

public class UserService : IUserService
{
    private readonly MemzyContext _context;
    private readonly Cloudinary _cloudinary;
    private readonly IWebHostEnvironment _environment;
    private readonly IConfiguration _configuration;
    private readonly IAuthenticationService _authService;

    public UserService(MemzyContext context, IWebHostEnvironment environment, IConfiguration configuration, IAuthenticationService authService)
    {
        _context = context ?? throw new ArgumentNullException(nameof(context));
        _environment = environment ?? throw new ArgumentNullException(nameof(environment));
        _configuration = configuration ?? throw new ArgumentNullException(nameof(configuration));
        _authService = authService ?? throw new ArgumentNullException(nameof(authService));

        _cloudinary = new Cloudinary(new Account(
            configuration["Cloudinary:CloudName"],
            configuration["Cloudinary:ApiKey"],
            configuration["Cloudinary:ApiSecret"]
        ));
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

        var user = await _context.Users.FindAsync(userId)
            ?? throw new KeyNotFoundException("User not found");

        user.Name = newName.Trim();
        await _context.SaveChangesAsync();
        return user;
    }

    public async Task<User> UpdateUserPassword(int userId, string password)
    {
        var user = await _context.Users.FindAsync(userId);
        if (user != null)
        {
            user.PasswordHash = password;
            await _context.SaveChangesAsync();
        }
        return user;
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

    public async Task<User> UpdateUserBio(int userId, string newBio)
    {
        var user = await _context.Users.FindAsync(userId);
        if (user != null)
        {
            user.Bio = newBio;
            await _context.SaveChangesAsync();
        }
        return user;
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

        if (file.Length > 20 * 1024 * 1024)
            throw new ArgumentException("File size too large. Max 20MB allowed");

        var user = await _context.Users.FindAsync(userId)
            ?? throw new KeyNotFoundException("User not found");

        var uploadParams = new ImageUploadParams
        {
            File = new FileDescription(file.FileName, file.OpenReadStream()),
            PublicId = $"memzy/profile/{userId}_{Guid.NewGuid()}",
            Transformation = new Transformation().Width(500).Height(500).Crop("fill").Quality("auto")
        };

        var result = await _cloudinary.UploadAsync(uploadParams);

        if (result.Error != null)
            throw new Exception($"Cloudinary upload failed: {result.Error.Message}");

        user.ProfilePictureUrl = result.SecureUrl.ToString();
        await _context.SaveChangesAsync();

        return user.ProfilePictureUrl;
    }

    public async Task<User> GetProfilePictureAsync(int userId)
    {
        var user = await _context.Users.FindAsync(userId);
        if (user == null || string.IsNullOrEmpty(user.ProfilePictureUrl))
        {
            throw new KeyNotFoundException("Profile picture not found");
        }
        return user;
    }

    public async Task<User> ChangePasswordAsync(int userId, ChangePasswordDto dto)
    {
        var user = await _authService.GetUserByIdAsync(userId);

        if (user == null)
            throw new UnauthorizedAccessException("User not found");

        if (!BCrypt.Net.BCrypt.Verify(dto.CurrentPassword, user.PasswordHash))
            throw new ArgumentException("Current password is incorrect");

        if (string.IsNullOrWhiteSpace(dto.NewPassword) || dto.NewPassword.Length < 6)
            throw new ArgumentException("New password must be at least 6 characters");

        user.PasswordHash = _authService.HashPassword(dto.NewPassword);
        await _context.SaveChangesAsync();

        return user;
    }

    public async Task<List<PostUserDto>> GetApprovedPostsAsync(int userId)
    {
        var posts = await _context.Posts
            .Where(p => p.UserId == userId && p.IsApproved)
            .Select(p => new PostUserDto
            {
                PostId = p.PostId,
                Description = p.Description,
                FilePath = p.FilePath,
                ContentType = p.ContentType,
                IsApproved = p.IsApproved,
                CreatedAt = p.CreatedAt,
                HumorTypes = p.PostHumors
                    .Select(ph => ph.HumorType.HumorTypeName)
                    .ToList()
            })
            .ToListAsync();

        return posts;
    }

    public async Task<List<PostUserDto>> GetPendingPostsAsync(int userId)
    {
        var posts = await _context.Posts
            .Where(p => p.UserId == userId && !p.IsApproved)
            .Select(p => new PostUserDto
            {
                PostId = p.PostId,
                Description = p.Description,
                FilePath = p.FilePath,
                ContentType = p.ContentType,
                IsApproved = p.IsApproved,
                CreatedAt = p.CreatedAt,
                HumorTypes = p.PostHumors
                    .Select(ph => ph.HumorType.HumorTypeName)
                    .ToList()
            })
            .ToListAsync();

        return posts;
    }

    public async Task DeleteUserPostAsync(int postId, int userId)
    {
        var post = await _context.Posts.FindAsync(postId);

        if (post == null)
            throw new KeyNotFoundException("Post not found");

        if (post.UserId != userId)
            throw new UnauthorizedAccessException("You are not allowed to delete this post");

        _context.Posts.Remove(post);
        await _context.SaveChangesAsync();
    }
}