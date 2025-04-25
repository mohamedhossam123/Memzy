using Memzy_finalist.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

public interface IUserService
{
    Task<User> GetUserByIdAsync(int id);
    Task<User> CreateUserAsync(User user);
    Task<User> UpdateUserAsync(User user);
    Task DeleteUserAsync(int id);
    Task<User> VerifyUserAsync(string email, string password);
    Task<User> ChangePasswordAsync(User user, string newPassword);
    Task<User> ForgotPasswordAsync(string email);
    Task<User> ResetPasswordAsync(User user, string newPassword);
    Task<User> ChangeStatusAsync(User user, string newStatus);
    Task<User> ChangeProfilePictureAsync(User user, string newProfilePictureUrl);
    Task<User> AddFriendAsync(User user, int friendId);
    Task<User> RemoveFriendAsync(User user, int friendId);
    Task<User> GetFriendsAsync(int userId);
    Task<List<FriendRequest>> GetFriendRequestsAsync(int userId);
    Task<User> AcceptFriendRequestAsync(User user, int friendId);
    Task<User> RejectFriendRequestAsync(User user, int friendId);
    Task<User> ChangeHumorAsync(int userId, List<string> humor);
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

    public async Task<User> GetUserByIdAsync(int id)
    {
        return await _context.Users.FirstOrDefaultAsync(u => u.UserId == id);
    }

    public async Task<User> CreateUserAsync(User user)
    {
        await _context.Users.AddAsync(user);
        await _context.SaveChangesAsync();
        return user;
    }

    public async Task<User> UpdateUserAsync(User user)
    {
        _context.Users.Update(user);
        await _context.SaveChangesAsync();
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

    public async Task<User> VerifyUserAsync(string email, string password)
    {
        return await _context.Users.FirstOrDefaultAsync(u => u.Email == email && u.PasswordHash == password);
    }

    public async Task<User> ChangePasswordAsync(User user, string newPassword)
    {
        user.PasswordHash = newPassword;
        return await UpdateUserAsync(user);
    }

    public async Task<User> ForgotPasswordAsync(string email)
    {
        return await _context.Users.FirstOrDefaultAsync(u => u.Email == email);
    }

    public async Task<User> ResetPasswordAsync(User user, string newPassword)
    {
        user.PasswordHash = newPassword;
        return await UpdateUserAsync(user);
    }

    public async Task<User> ChangeStatusAsync(User user, string newStatus)
    {
        user.Status = newStatus;
        return await UpdateUserAsync(user);
    }

    public async Task<User> ChangeProfilePictureAsync(User user, string newProfilePictureUrl)
    {
        user.ProfilePictureUrl = newProfilePictureUrl;
        return await UpdateUserAsync(user);
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

    public async Task<User> ChangeHumorAsync(int userId, List<string> humor)
    {
        if (humor == null || !humor.Any())
        {
            throw new ArgumentException("At least one humor type must be specified");
        }

        var invalidTypes = humor.Except(AllowedHumorTypes).ToList();
        if (invalidTypes.Any())
        {
            throw new ArgumentException(
                $"Invalid humor types: {string.Join(", ", invalidTypes)}. " +
                "Allowed types: DarkHumor, FriendlyHumor");
        }

        var user = await _context.Users
            .Include(u => u.UserHumorPreferences)
            .ThenInclude(uh => uh.HumorType)
            .FirstOrDefaultAsync(u => u.UserId == userId)
            ?? throw new ArgumentException("User not found");

        var validHumorTypes = await _context.HumorTypes
            .Where(ht => AllowedHumorTypes.Contains(ht.HumorTypeName))
            .ToListAsync();

        user.UserHumorPreferences.Clear();

        foreach (var humorTypeName in humor.Distinct())
        {
            var humorType = validHumorTypes.FirstOrDefault(ht => 
                ht.HumorTypeName == humorTypeName);

            if (humorType != null)
            {
                user.UserHumorPreferences.Add(new UserHumorPreference
                {
                    HumorTypeId = humorType.HumorTypeId
                });
            }
        }

        await _context.SaveChangesAsync();
        return user;
    }
}