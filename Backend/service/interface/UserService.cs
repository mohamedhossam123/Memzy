using Memzy_finalist.Models;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Net.Http.Headers;
using Newtonsoft.Json;
using MyApiProject.Controllers;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

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

public class UserService : IUserService
{
    private readonly MemzyContext _context;
    private readonly IWebHostEnvironment _environment;
    private static readonly List<string> AllowedHumorTypes = new List<string> 
    { 
        "DarkHumor", 
        "FriendlyHumor" 
    };

    private readonly IConfiguration _configuration;

public UserService(MemzyContext context, IWebHostEnvironment environment, IConfiguration configuration)
{
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

    // Use ImgBB's validation parameters
    if (file.Length > 5 * 1024 * 1024)
        throw new ArgumentException("File size too large. Max 5MB allowed");

    var user = await _context.Users.FindAsync(userId) 
        ?? throw new KeyNotFoundException("User not found");

    using var client = new HttpClient();
    using var content = new MultipartFormDataContent();
    var apiKey = _configuration["ImgBB:ApiKey"]; // Add to appsettings.json

    using var ms = new MemoryStream();
    await file.CopyToAsync(ms);
    var fileBytes = ms.ToArray();

    content.Add(new ByteArrayContent(fileBytes), "image", file.FileName);
    
    var response = await client.PostAsync($"https://api.imgbb.com/1/upload?key={apiKey}", content);
    var responseString = await response.Content.ReadAsStringAsync();

    if (!response.IsSuccessStatusCode)
        throw new Exception("Image upload failed");

    var imgbbResponse = JsonConvert.DeserializeObject<ImgBBResponse>(responseString);
    
    // Update user with new URL
    user.ProfilePictureUrl = imgbbResponse.Data.Url;
    await _context.SaveChangesAsync();

    return user.ProfilePictureUrl;
}

// Add this class
public class ImgBBResponse
{
    public DataObject Data { get; set; }
    
    public class DataObject
    {
        public string Url { get; set; }
    }
}
    public class ChangePasswordDto
    {
        public string CurrentPassword { get; set; }
        public string NewPassword { get; set; }
    }
}