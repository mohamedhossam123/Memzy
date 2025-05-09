using Memzy_finalist.Models;
using Microsoft.AspNetCore.Http;
using Microsoft.EntityFrameworkCore;
using System;
using System.Security.Claims;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Http.HttpResults;
using System.IdentityModel.Tokens.Jwt;
using Microsoft.IdentityModel.Tokens;
using Microsoft.Extensions.Configuration;
using System.Collections.Generic;
using System.Linq;


using System.Text;

public interface IAuthenticationService
{
    Task<User> GetUserByIdAsync(int id);
    Task<User> CreateUserAsync(User user);
    Task<User> VerifyUserAsync(string email, string password);
    Task<int> GetAuthenticatedUserId();  
    Task <string> GenerateJwtToken(User user);
    string HashPassword(string password);
}

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
}