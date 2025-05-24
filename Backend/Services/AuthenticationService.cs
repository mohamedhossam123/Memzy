using Memzy_finalist.Models;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;
using System.IdentityModel.Tokens.Jwt;
using Microsoft.IdentityModel.Tokens;
using System.Text;
using Microsoft.Extensions.Configuration;

public class AuthenticationService : IAuthenticationService
{
    private readonly IConfiguration _configuration;
    private readonly MemzyContext _context;
    private readonly IHttpContextAccessor _httpContextAccessor;

    public AuthenticationService(MemzyContext context, IHttpContextAccessor httpContextAccessor, IConfiguration configuration)
    {
        _configuration = configuration;
        _context = context;
        _httpContextAccessor = httpContextAccessor;
    }
    public async Task UpdateUserAsync(User user)
    {
        _context.Users.Update(user);
        await _context.SaveChangesAsync();
    }

    public async Task<string> GenerateJwtToken(User user)
    {
        var securityKey = new SymmetricSecurityKey(
            Encoding.UTF8.GetBytes(_configuration["Jwt:Key"]));
        var credentials = new SigningCredentials(securityKey, SecurityAlgorithms.HmacSha256);
        await Task.Delay(0);
        var claims = new[]
        {
            new Claim(ClaimTypes.NameIdentifier, user.UserId.ToString()),
            new Claim(ClaimTypes.Email, user.Email),
        };

        var token = new JwtSecurityToken(
            _configuration["Jwt:Issuer"],
            _configuration["Jwt:Audience"],
            claims,
            expires: DateTime.Now.AddMinutes(Convert.ToDouble(_configuration["Jwt:ExpiryInMinutes"])),
            signingCredentials: credentials);

        return new JwtSecurityTokenHandler().WriteToken(token);
    }

    public async Task<int> GetAuthenticatedUserId()
    {
        var httpContext = _httpContextAccessor.HttpContext;
        await Task.Delay(0);
        if (httpContext == null)
            throw new UnauthorizedAccessException("No HTTP context available");

        var userIdClaim = httpContext.User.FindFirst(ClaimTypes.NameIdentifier);
        if (userIdClaim == null || !int.TryParse(userIdClaim.Value, out int userId))
            throw new UnauthorizedAccessException("User not authenticated or invalid user ID");

        return userId;
    }

    public async Task<User> GetUserByIdAsync(int id)
    {
        return await _context.Users.FindAsync(id);
    }
    public async Task<User> GetUserByUsernameAsync(string username)
    {
        return await _context.Users.FirstOrDefaultAsync(u => u.UserName == username);
    }

    public async Task<User> CreateUserAsync(User user)
    {
        _context.Users.Add(user);
        await _context.SaveChangesAsync();
        return user;
    }

    public string HashPassword(string password)
    {
        if (string.IsNullOrWhiteSpace(password))
            throw new ArgumentException("Password cannot be null or empty", nameof(password));
        return BCrypt.Net.BCrypt.HashPassword(password);
    }

    private bool VerifyPassword(string password, string hashedPassword)
    {
        return BCrypt.Net.BCrypt.Verify(password, hashedPassword);
    }

    public async Task<User> VerifyUserAsync(string email, string password)
    {
        var user = await _context.Users.FirstOrDefaultAsync(u => u.Email == email);
        if (user == null || !VerifyPassword(password, user.PasswordHash))
            return null;
        return user;
    }
    public async Task<int> GetFriendCountAsync(int userId)
    {
        return await _context.Friendships
            .CountAsync(f => f.User1Id == userId || f.User2Id == userId);
    }

    public async Task<int> GetPostCountAsync(int userId)
    {
        var PostsCount = await _context.Posts
            .CountAsync(p => p.UserId == userId);
        return PostsCount;
    }
    

public async Task<(bool Success, string Message, User User)> SignUpUserAsync(UserCreateDto dto)
{
    var existingEmailUser = await _context.Users.FirstOrDefaultAsync(u => u.Email == dto.Email);
if (existingEmailUser != null)
    return (false, "Email already registered", null);


    var existingUsername = await GetUserByUsernameAsync(dto.UserName);
    if (existingUsername != null)
        return (false, "Username already taken", null);

    var user = new User
    {
        Name = dto.Name,
        Email = dto.Email,
        PasswordHash = HashPassword(dto.Password),
        CreatedAt = DateTime.UtcNow,
        UserName = dto.UserName,
        Status =dto.Status
    };

    var createdUser = await CreateUserAsync(user);
    return (true, "User created", createdUser);
}

public async Task<(bool Success, string Message, string Token, object User)> LoginAsync(LoginDto dto)
{
    
    var user = await VerifyUserAsync(dto.Email, dto.Password);
    if (user == null)
        return (false, "Invalid credentials", null, null);

    var token = await GenerateJwtToken(user);
Console.WriteLine($"User status during login: {user.Status}");
    return (true, "Login successful", token, new
    {
        user.UserId,
        user.Name,
        user.Email,
        user.ProfilePictureUrl,
        user.Bio,
        Username = user.UserName,
        Status = user.Status
    });
}

public async Task<(bool Success, string Message, object Data)> ValidateTokenAsync()
{
    
    try
        {
            var userId = await GetAuthenticatedUserId();
            var user = await GetUserByIdAsync(userId);
            if (user == null)
                return (false, "Invalid user", null);
            Console.WriteLine($"User status during login: {user.Status}");
            return (true, "Valid token", new
            {
                user = new
                {
                    userId = user.UserId,
                    name = user.Name,
                    email = user.Email,
                    profilePictureUrl = user.ProfilePictureUrl,
                    bio = user.Bio,
                    userName = user.UserName,
                    status = user.Status
                }
            });
        }
        catch (UnauthorizedAccessException)
        {
            return (false, "Invalid token", null);
        }
        catch (Exception ex)
        {
            return (false, $"Token validation error: {ex.Message}", null);
        }
}

public async Task<(bool Success, string Message, string Token)> RefreshTokenAsync()
{
    try
    {
        var userId = await GetAuthenticatedUserId();
        var user = await GetUserByIdAsync(userId);
        if (user == null)
            return (false, "Invalid user", null);

        var token = await GenerateJwtToken(user);
        return (true, "Token refreshed", token);
    }
    catch (Exception ex)
    {
        return (false, $"Token refresh error: {ex.Message}", null);
    }
}

public async Task<(bool Success, string Message, object Data)> GetCurrentUserInfoAsync()
{
    try
    {
        var userId = await GetAuthenticatedUserId();
        var user = await _context.Users
            .Include(u => u.UserHumorTypes)
            .ThenInclude(uht => uht.HumorType)
            .FirstOrDefaultAsync(u => u.UserId == userId);

        if (user == null)
            return (false, "Invalid user", null);

        var humorTypes = user.UserHumorTypes.Select(uht => uht.HumorType).Select(ht => new
        {
            ht.HumorTypeId,
            ht.HumorTypeName
        });

        var friendCount = await GetFriendCountAsync(userId);
        var postCount = await GetPostCountAsync(userId);

        return (true, "User info fetched", new
        {
            user.UserId,
            user.Name,
            user.Email,
            user.ProfilePictureUrl,
            user.Bio,
            user.CreatedAt,
            user.UserName,
            HumorTypes = humorTypes,
            FriendCount = friendCount,
            PostCount = postCount
        });
    }
    catch (Exception ex)
    {
        return (false, $"Error retrieving current user: {ex.Message}", null);
    }
}

public async Task<(bool Success, string Message, object Data)> GetFriendAndPostCountAsync()
{
    try
    {
        var userId = await GetAuthenticatedUserId();
        var friendCount = await GetFriendCountAsync(userId);
        var postCount = await GetPostCountAsync(userId);

        return (true, "Counts retrieved", new { FriendCount = friendCount, PostCount = postCount });
    }
    catch (Exception ex)
    {
        return (false, $"Error retrieving counts: {ex.Message}", null);
    }
}





}