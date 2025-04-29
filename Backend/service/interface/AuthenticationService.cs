using Memzy_finalist.Models;
using Microsoft.AspNetCore.Http;
using Microsoft.EntityFrameworkCore;
using System;
using System.Security.Claims;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Http.HttpResults;

public interface IAuthenticationService
{
    Task<User> GetUserByIdAsync(int id);
    Task<User> CreateUserAsync(User user);
    Task<User> VerifyUserAsync(string email, string password);
    Task<int> GetAuthenticatedUserId();  
}

public class AuthenticationService : IAuthenticationService
{
    private readonly MemzyContext _context;
    private readonly IHttpContextAccessor _httpContextAccessor;

    public AuthenticationService(MemzyContext context, IHttpContextAccessor httpContextAccessor)
    {
        _context = context;
        _httpContextAccessor = httpContextAccessor;
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

    public async Task<User> VerifyUserAsync(string email, string password)
    {
        var user = await _context.Users.FirstOrDefaultAsync(u => u.Email == email);
        if (user == null)
            return null;
        if(password == user.PasswordHash)
            return user;
        return null;
    }
}