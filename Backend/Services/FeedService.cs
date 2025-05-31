using Memzy_finalist.Models;
using Memzy_finalist.Models.Entities;
using Microsoft.EntityFrameworkCore;

namespace Memzy_finalist.Services
{
    public class FeedService : IFeedService
    {
        private readonly MemzyContext _ctx;
        public FeedService(MemzyContext ctx) => _ctx = ctx;

        private async Task<List<PostDto>> FetchPostsAsync(IQueryable<Post> query, int? currentUserId = null)
        {
            var posts = await query
                .Include(p => p.PostHumors)
                .ThenInclude(ph => ph.HumorType)
                .Include(p => p.User)
                .Include(p => p.Likes)
                .AsNoTracking()
                .ToListAsync();

            return posts.Select(p => new PostDto
            {
                PostId = p.PostId,
                MediaType = p.MediaType,
                Description = p.Description,
                FilePath = p.FilePath,
                CreatedAt = p.CreatedAt,
                LikeCounter = p.Likes.Count,
                IsApproved = p.IsApproved,
                HumorTypeIds = p.PostHumors.Select(ph => ph.HumorTypeId).ToList(),
                HumorTypes = p.PostHumors.Select(ph => new HumorTypeDto 
                { 
                    HumorTypeId = ph.HumorTypeId, 
                    HumorTypeName = ph.HumorType.HumorTypeName 
                }).ToList(),
                UserName = p.User?.UserName ?? p.User?.Name ?? "Anonymous",
                IsLiked = currentUserId.HasValue && p.Likes.Any(l => l.UserId == currentUserId.Value),
                ProfileImageUrl = p.User?.ProfilePictureUrl,
                Name = p.User?.Name
            }).ToList();
        }

        public async Task<FeedResultDTO> FeedGeneratorBasedOnHumor(int userId, int page, int pageSize)
        {
            var prefs = await _ctx.UserHumorTypes
                .Where(u => u.UserId == userId)
                .Select(u => u.HumorTypeId)
                .ToListAsync();

            IQueryable<Post> baseQuery = _ctx.Posts
                .Where(p => p.IsApproved)
                .OrderBy(p => Guid.NewGuid());

            if (prefs.Any())
            {
                baseQuery = baseQuery
                    .Where(p => p.PostHumors.Any(ph => prefs.Contains(ph.HumorTypeId)));
            }

            var paginatedQuery = baseQuery
                .Skip((page - 1) * pageSize)
                .Take(pageSize);

            var dtos = await FetchPostsAsync(paginatedQuery, userId);
            return new FeedResultDTO { Posts = dtos };
        }

        public async Task<FeedResultDTO> FeedGeneratorEverythingGoes(int page, int pageSize, int? currentUserId = null)
        {
            var paginatedQuery = _ctx.Posts
                .Where(p => p.IsApproved)
                .OrderBy(p => Guid.NewGuid())
                .Skip((page - 1) * pageSize)
                .Take(pageSize);

            var dtos = await FetchPostsAsync(paginatedQuery, currentUserId);
            return new FeedResultDTO { Posts = dtos };
        }

        public async Task<LikeResultDto> LikePostAsync(int postId, int userId)
        {
            var post = await _ctx.Posts.FindAsync(postId);
            if (post == null)
            {
                return new LikeResultDto { Success = false, Message = "Post not found" };
            }

            var existingLike = await _ctx.Set<PostLike>()
                .FirstOrDefaultAsync(pl => pl.PostId == postId && pl.UserId == userId);

            if (existingLike != null)
            {
                return new LikeResultDto { Success = false, Message = "Post already liked" };
            }

            var like = new PostLike
            {
                PostId = postId,
                UserId = userId
            };

            _ctx.Set<PostLike>().Add(like);
            await _ctx.SaveChangesAsync();

            var likeCount = await _ctx.Set<PostLike>()
                .CountAsync(pl => pl.PostId == postId);

            return new LikeResultDto 
            { 
                Success = true, 
                Message = "Post liked successfully", 
                LikeCount = likeCount,
                IsLiked = true 
            };
        }

        public async Task<LikeResultDto> UnlikePostAsync(int postId, int userId)
        {
            var post = await _ctx.Posts.FindAsync(postId);
            if (post == null)
            {
                return new LikeResultDto { Success = false, Message = "Post not found" };
            }

            var existingLike = await _ctx.Set<PostLike>()
                .FirstOrDefaultAsync(pl => pl.PostId == postId && pl.UserId == userId);

            if (existingLike == null)
            {
                return new LikeResultDto { Success = false, Message = "Post not liked by user" };
            }

            _ctx.Set<PostLike>().Remove(existingLike);
            await _ctx.SaveChangesAsync();

            var likeCount = await _ctx.Set<PostLike>()
                .CountAsync(pl => pl.PostId == postId);

            return new LikeResultDto 
            { 
                Success = true, 
                Message = "Post unliked successfully", 
                LikeCount = likeCount,
                IsLiked = false 
            };
        }

        public async Task<List<PostDto>> GetUserPostsAsync(int userId, int currentUserId)
        {
            var posts = await _ctx.Posts
                .Where(p => p.UserId == userId && p.IsApproved)
                .Include(p => p.PostHumors)
                .ThenInclude(ph => ph.HumorType)
                .Include(p => p.User)
                .Include(p => p.Likes)
                .OrderByDescending(p => p.CreatedAt)
                .AsNoTracking()
                .ToListAsync();

            return posts.Select(p => new PostDto
            {
                PostId = p.PostId,
                MediaType = p.MediaType,
                Description = p.Description,
                FilePath = p.FilePath,
                CreatedAt = p.CreatedAt,
                LikeCounter = p.Likes.Count,
                IsApproved = p.IsApproved,
                HumorTypeIds = p.PostHumors.Select(ph => ph.HumorTypeId).ToList(),
                HumorTypes = p.PostHumors.Select(ph => new HumorTypeDto 
                { 
                    HumorTypeId = ph.HumorTypeId, 
                    HumorTypeName = ph.HumorType.HumorTypeName 
                }).ToList(),
                UserName = p.User?.UserName ?? p.User?.Name ?? "Anonymous",
                IsLiked = p.Likes.Any(l => l.UserId == currentUserId),
                ProfileImageUrl = p.User?.ProfilePictureUrl
            }).ToList();
        }

        public async Task<LikeStatusDto> GetLikeStatusAsync(int postId, int userId)
        {
            var isLiked = await _ctx.Set<PostLike>()
                .AnyAsync(pl => pl.PostId == postId && pl.UserId == userId);

            var likeCount = await _ctx.Set<PostLike>()
                .CountAsync(pl => pl.PostId == postId);

            return new LikeStatusDto 
            { 
                IsLiked = isLiked, 
                LikeCount = likeCount 
            };
        }
    }

    
}