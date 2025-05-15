
using Memzy_finalist.Models;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Http;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Threading.Tasks;

public interface IModeratorService
{
    Task DeleteUserAsync(int id);
    Task<List<Post>> GetPendingPostsAsync();
    Task<bool> ApprovePostAsync(int postId, int modId);
    Task<bool> RejectPostAsync(int postId, int modId);
    Task<bool> DeletePostAsync(int postId, int modId);
    
}
    public class ModeratorService : IModeratorService
{
    private readonly MemzyContext _context;
    private readonly IWebHostEnvironment _environment;

    public ModeratorService(MemzyContext context, IWebHostEnvironment environment)
    {
        _context = context;
        _environment = environment;
    }

    private async Task<bool> IsUserModeratorAsync(int moderatorId)
    {
        var user = await _context.Users.FindAsync(moderatorId);
        return user != null && user.Status == "moderator";
    }


public async Task<bool> ApprovePostAsync(int postId, int modId)
    {
        if (!await IsUserModeratorAsync(modId)) return false;
        var post = await _context.Posts.FindAsync(postId);
        if (post == null) return false;
        post.IsApproved = true;
        await _context.SaveChangesAsync();
        return true;
    }

    public async Task<bool> RejectPostAsync(int postId, int modId)
    {
        if (!await IsUserModeratorAsync(modId)) return false;
        var post = await _context.Posts.FindAsync(postId);
        if (post == null) return false;
        post.IsApproved = false;
        await _context.SaveChangesAsync();
        return true;
    }

    public async Task<bool> DeletePostAsync(int postId, int modId)
    {
        if (!await IsUserModeratorAsync(modId)) return false;
        var post = await _context.Posts.FindAsync(postId);
        if (post == null) return false;
        _context.Posts.Remove(post);
        await _context.SaveChangesAsync();
        return true;
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
    public async Task<List<Post>> GetPendingPostsAsync()
    {
        return await _context.Posts
                   .Where(p => !p.IsApproved)
                   .Include(p => p.PostHumors)
                   .ToListAsync();
    }
}
