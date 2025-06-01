using Memzy_finalist.Models;
using Memzy_finalist.Models.Entities;
using Microsoft.EntityFrameworkCore;

namespace Memzy_finalist.Services
{
    public class CommentService : ICommentService
{
    private readonly MemzyContext _context;
    private readonly ILogger<ICommentService> _logger;

    public CommentService(MemzyContext context, ILogger<CommentService> logger)
    {
        _context = context;
        _logger = logger;
    }

    public async Task<CommentResponseDto> AddComment(AddCommentDto dto, int userId)
    {
        var post = await _context.Posts.FindAsync(dto.PostId);
        if (post == null)
            throw new Exception("Post not found");

        var user = await _context.Users.FindAsync(userId);
        if (user == null)
            throw new Exception("User not found");

        var comment = new Comment
        {
            PostId = dto.PostId,
            UserId = userId,
            Content = dto.Content,
            CreatedAt = DateTime.UtcNow,
            ParentCommentId = dto.ParentCommentId
        };

        _context.Comments.Add(comment);
        await _context.SaveChangesAsync();

        return new CommentResponseDto
        {
            CommentId = comment.CommentId,
            PostId = comment.PostId,
            UserId = user.UserId,
            UserName = user.UserName,
            UserProfilePicture = user.ProfilePictureUrl,
            Content = comment.Content,
            CreatedAt = comment.CreatedAt,
            LikeCount = 0,
            IsLikedByCurrentUser = false,
            Replies = new List<CommentResponseDto>()
        };
    }

    public async Task DeleteComment(DeleteCommentDto dto)
    {
        var comment = await _context.Comments.FindAsync(dto.CommentId);
        if (comment == null)
            throw new Exception("Comment not found");

        var user = await _context.Users.FindAsync(dto.UserId);
        if (user == null)
            throw new Exception("User not found");

        _context.Comments.Remove(comment);
        await _context.SaveChangesAsync();
    }

    public async Task<LikeResponseDto> ToggleCommentLike(LikeCommentDto dto)
    {
        var comment = await _context.Comments
            .Include(c => c.Likes)
            .FirstOrDefaultAsync(c => c.CommentId == dto.CommentId);
        if (comment == null)
            throw new Exception("Comment not found");

        var user = await _context.Users.FindAsync(dto.UserId);
        if (user == null)
            throw new Exception("User not found");

        var existingLike = await _context.CommentLikes
            .FirstOrDefaultAsync(cl => cl.CommentId == dto.CommentId && cl.UserId == dto.UserId);

        bool isLiked;
        if (existingLike != null)
        {
            _context.CommentLikes.Remove(existingLike);
            isLiked = false;
        }
        else
        {
            var newLike = new CommentLike
            {
                CommentId = dto.CommentId,
                UserId = dto.UserId
            };
            _context.CommentLikes.Add(newLike);
            isLiked = true;
        }

        await _context.SaveChangesAsync();

        var likeCount = await _context.CommentLikes
            .CountAsync(cl => cl.CommentId == dto.CommentId);

        return new LikeResponseDto
        {
            CommentId = dto.CommentId,
            NewLikeCount = likeCount,
            IsLiked = isLiked
        };
    }

    public async Task<List<CommentResponseDto>> GetCommentsAsync(int postId, int currentUserId)
    {
        var comments = await _context.Comments
            .Where(c => c.PostId == postId)
            .Include(c => c.User)
            .Include(c => c.Likes)
            .ToListAsync();

        var commentDtos = comments.Select(c => new CommentResponseDto
        {
            CommentId = c.CommentId,
            PostId = c.PostId,
            UserId = c.UserId,
            UserName = c.User?.UserName,
            UserProfilePicture = c.User?.ProfilePictureUrl,
            Content = c.Content,
            CreatedAt = c.CreatedAt,
            LikeCount = c.Likes.Count,
            IsLikedByCurrentUser = c.Likes.Any(l => l.UserId == currentUserId),
            ParentCommentId = c.ParentCommentId,
            Replies = new List<CommentResponseDto>()
        }).ToList();
        var commentDict = commentDtos.ToDictionary(c => c.CommentId);
        var rootComments = new List<CommentResponseDto>();
        foreach (var comment in commentDtos)
        {
            if (comment.ParentCommentId.HasValue && commentDict.ContainsKey(comment.ParentCommentId.Value))
            {
                commentDict[comment.ParentCommentId.Value].Replies.Add(comment);
            }
            else
            {
                rootComments.Add(comment);
            }
        }
        return rootComments;
    }
}
}