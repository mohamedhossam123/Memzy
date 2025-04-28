using Memzy_finalist.Models;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using MyApiProject.Controllers;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

public interface IUserService
{

    Task<User> UpdateUsernameAsync(int userid,string user);/*---------------------------*/
    Task<User> UpdateUserPassword(int userid,string user);/*---------------------------*/
    Task<User> UpdateUserProfilePicture(User user);/*---------------------------*/
    Task<User> UpdateUserBio(int userid,string newBio);/*---------------------------*/
    Task DeleteUserAsync(int id);/*---------------------------*/
    Task<User> ForgotPasswordAsync(string email);
    Task<User> ResetPasswordAsync(User user, string newPassword);
    Task<User> AddFriendAsync(User user, int friendId);
    Task<User> RemoveFriendAsync(User user, int friendId);
    Task<User> GetFriendsAsync(int userId);
    Task<List<FriendRequest>> GetFriendRequestsAsync(int userId);
    Task<User> AcceptFriendRequestAsync(User user, int friendId);
    Task<User> RejectFriendRequestAsync(User user, int friendId);
}

public class UserService : IUserService
{
    private readonly MemzyContext _context;
    private static readonly List<string> AllowedHumorTypes = new List<string> 
    { 
        "DarkHumor", 
        "FriendlyHumor" 
    };

    public UserService(MemzyContext context)
    {
        _context = context;
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
    if (newName.Length > 100) 
        throw new ArgumentException("Name is too long");

    var user = await _context.Users.FindAsync(userId);
    if (user == null)
        throw new KeyNotFoundException("User not found");
    user.Name = newName.Trim();
    
    await _context.SaveChangesAsync();
    return user;
}
    public async Task<User> UpdateUserPassword(int userid,string user)
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
    public async Task<User> UpdateUserBio(int userid,string newBio)
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

    public async Task<User> AddFriendAsync(User user, int friendId)
    {
        var existingRequest = await _context.FriendRequests
            .FirstOrDefaultAsync(fr => 
                (fr.SenderId == user.UserId && fr.ReceiverId == friendId) || 
                (fr.SenderId == friendId && fr.ReceiverId == user.UserId));

        if (existingRequest != null)
        {
            throw new InvalidOperationException("A friend request already exists between these users.");
        }

        var friendRequest = new FriendRequest
        {
            SenderId = user.UserId,
            ReceiverId = friendId,
            Status = "pending",
            CreatedAt = DateTime.UtcNow
        };

        await _context.FriendRequests.AddAsync(friendRequest);
        await _context.SaveChangesAsync();
        return user;
    }

    public async Task<User> RemoveFriendAsync(User user, int friendId)
    {
        var friendRequest = await _context.FriendRequests
            .FirstOrDefaultAsync(fr => 
                (fr.SenderId == user.UserId && fr.ReceiverId == friendId) || 
                (fr.SenderId == friendId && fr.ReceiverId == user.UserId));

        if (friendRequest != null)
        {
            _context.FriendRequests.Remove(friendRequest);
            await _context.SaveChangesAsync();
        }

        var friendship = await _context.Friends
            .FirstOrDefaultAsync(f => 
                (f.User1Id == user.UserId && f.User2Id == friendId) || 
                (f.User1Id == friendId && f.User2Id == user.UserId));

        if (friendship != null)
        {
            _context.Friends.Remove(friendship);
            await _context.SaveChangesAsync();
        }
        return user;
    }

    public async Task<User> GetFriendsAsync(int userId)
    {
        var user = await _context.Users
            .Include(u => u.FriendsAsUser1)
                .ThenInclude(f => f.User2) 
            .Include(u => u.FriendsAsUser2)
                .ThenInclude(f => f.User1) 
            .FirstOrDefaultAsync(u => u.UserId == userId);

        return user ?? throw new ArgumentException("User not found.");
    }

    public async Task<List<FriendRequest>> GetFriendRequestsAsync(int userId)
    {
        return await _context.FriendRequests
            .Where(fr => fr.ReceiverId == userId || fr.SenderId == userId)
            .Include(fr => fr.Sender)
            .Include(fr => fr.Receiver)
            .ToListAsync();
    }

    public async Task<User> AcceptFriendRequestAsync(User user, int friendId)
    {
        var friendRequest = await _context.FriendRequests
            .FirstOrDefaultAsync(fr => 
                fr.SenderId == friendId && 
                fr.ReceiverId == user.UserId && 
                fr.Status == "pending");

        if (friendRequest == null)
        {
            throw new ArgumentException("No pending friend request found.");
        }

        friendRequest.Status = "accepted";
        await _context.SaveChangesAsync();

        var existingFriendship = await _context.Friends
            .AnyAsync(f => 
                (f.User1Id == user.UserId && f.User2Id == friendId) || 
                (f.User1Id == friendId && f.User2Id == user.UserId));

        if (!existingFriendship)
        {
            await _context.Friends.AddAsync(new Friend
            {
                User1Id = user.UserId,
                User2Id = friendId,
                CreatedAt = DateTime.UtcNow
            });
            await _context.SaveChangesAsync();
        }
        return user;
    }

    public async Task<User> RejectFriendRequestAsync(User user, int friendId)
    {
        var friendRequest = await _context.FriendRequests
            .FirstOrDefaultAsync(fr => 
                (fr.SenderId == user.UserId && fr.ReceiverId == friendId) || 
                (fr.SenderId == friendId && fr.ReceiverId == user.UserId));

        if (friendRequest != null)
        {
            _context.FriendRequests.Remove(friendRequest);
            await _context.SaveChangesAsync();
        }
        return user;
    }



}