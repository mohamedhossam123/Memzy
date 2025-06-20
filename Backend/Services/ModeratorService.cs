using Memzy_finalist.Models;
using Microsoft.EntityFrameworkCore;

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

    public async Task<List<object>> GetAllUsersAsync()
    {
        return await _context.Users
            .Select(u => new 
            {
                id = u.UserId, 
                name = u.Name,
                email = u.Email,
                userName = u.UserName,
                status = u.Status ?? "normal",
                profilePictureUrl = u.ProfilePictureUrl
            })
            .Cast<object>()
            .ToListAsync();
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
        var post = await _context.Posts
            .Include(p => p.Likes) 
            .Include(p => p.Comments) 
                .ThenInclude(c => c.Likes) 
            .Include(p => p.Comments)
            .Include(p => p.PostHumors) 
            .FirstOrDefaultAsync(p => p.PostId == postId);

        if (post == null) return false; 

        if (post.Likes != null && post.Likes.Any()) 
        {
            _context.PostLikes.RemoveRange(post.Likes);
        }
        if (post.Comments != null && post.Comments.Any()) 
        {
            foreach (var comment in post.Comments)
            {
                if (comment.Likes != null && comment.Likes.Any())
                {
                    _context.CommentLikes.RemoveRange(comment.Likes);
                }
                if (comment.Replies != null && comment.Replies.Any()) { _context.Comments.RemoveRange(comment.Replies); }
            }
            _context.Comments.RemoveRange(post.Comments);
        }
        
        if (post.PostHumors != null && post.PostHumors.Any())
        {
            _context.PostHumors.RemoveRange(post.PostHumors);
        }
        _context.Posts.Remove(post);
        await _context.SaveChangesAsync();
        
        return true;
    }


    public async Task DeleteUserAsync(int id)
    {
        var user = await _context.Users
            .Include(u => u.PostLikes)
            .Include(u => u.Comments)
                .ThenInclude(c => c.Likes) 
            .Include(u => u.Comments)
                .ThenInclude(c => c.Replies) 
            .Include(u => u.Posts)
                .ThenInclude(p => p.Comments) 
                .ThenInclude(c => c.Likes)
            .Include(u => u.Posts)
                .ThenInclude(p => p.Likes) 
            .Include(u => u.Posts)
                .ThenInclude(p => p.PostHumors)
            .Include(u => u.CommentLikes)
            .FirstOrDefaultAsync(u => u.UserId == id);
        if (user != null)
        {
            _context.CommentLikes.RemoveRange(user.CommentLikes);
            foreach (var comment in user.Comments)
            {
                _context.CommentLikes.RemoveRange(comment.Likes);
                _context.Comments.RemoveRange(comment.Replies);
            }
            _context.Comments.RemoveRange(user.Comments);
            foreach (var post in user.Posts)
            {
                foreach (var comment in post.Comments)
                {
                    _context.CommentLikes.RemoveRange(comment.Likes);
                    _context.Comments.RemoveRange(comment.Replies);
                }
                _context.Comments.RemoveRange(post.Comments);
                _context.PostLikes.RemoveRange(post.Likes);
                _context.PostHumors.RemoveRange(post.PostHumors);
            }
            _context.Posts.RemoveRange(user.Posts);
            _context.PostLikes.RemoveRange(user.PostLikes);
            _context.Users.Remove(user);
            await _context.SaveChangesAsync();
        }
    }


    public async Task<bool> MakeUserModeratorAsync(int userId, int requestedById)
{
    if (!await IsUserModeratorAsync(requestedById)) return false;

    var user = await _context.Users.FindAsync(userId);
    if (user == null) return false;

    user.Status = "moderator";
    await _context.SaveChangesAsync();
    return true;
}

    public async Task<List<object>> GetPendingPostsAsync()
    {
        var posts = await _context.Posts
            .Where(p => !p.IsApproved)
            .Include(p => p.PostHumors)
                .ThenInclude(ph => ph.HumorType)
                .Include(p => p.Likes)
            .Include(p => p.User)
            .ToListAsync();

        return posts.Select(p => new
        {
            id = p.PostId,
            content = p.Description ?? "",
            mediaType = p.MediaType.ToString().ToLower(),
            mediaUrl = p.FilePath,
            timestamp = p.CreatedAt.ToString("yyyy-MM-ddTHH:mm:ss.fffZ"),
            humorType = p.PostHumors?.FirstOrDefault()?.HumorType?.HumorTypeName ?? "Dark Humor",
            likes = p.Likes.Count,
            status = p.IsApproved ? "approved" : "pending",
            userId = p.UserId,
            user = new
            {
                id = p.User.UserId,
                name = p.User.Name ?? "Unknown User",
                email = p.User.Email ?? "",
                userName = p.User.UserName ?? "unknown",
                status = p.User.Status ?? "user",
                profilePictureUrl = p.User.ProfilePictureUrl
            }
        }).Cast<object>().ToList();
    }

    private string DetectMediaType(string url)
    {
        if (string.IsNullOrEmpty(url)) return null;
        
        var urlLower = url.ToLower();
        if (urlLower.Contains(".mp4") || urlLower.Contains(".webm") || urlLower.Contains(".mov") || 
            urlLower.Contains(".avi") || urlLower.Contains(".mkv") || urlLower.Contains("video"))
        {
            return "video";
        }
        if (urlLower.Contains(".jpg") || urlLower.Contains(".jpeg") || urlLower.Contains(".png") || 
            urlLower.Contains(".gif") || urlLower.Contains(".webp") || urlLower.Contains(".svg") ||
            urlLower.Contains("image"))
        {
            return "image";
        }
        if (urlLower.Contains("cloudinary.com"))
        {
            if (urlLower.Contains("/video/")) return "video";
            if (urlLower.Contains("/image/")) return "image";
        }
        
        return null;
    }
}