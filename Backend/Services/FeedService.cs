using Memzy_finalist.Models;
using Microsoft.EntityFrameworkCore;

namespace Memzy_finalist.Services
{
    public class FeedService : IFeedService
    {
        private readonly MemzyContext _ctx;
        public FeedService(MemzyContext ctx) => _ctx = ctx;

        private async Task<List<PostDto>> FetchPostsAsync(IQueryable<Post> query)
        {
            var posts = await query
                .Include(p => p.PostHumors)
                .Include(p => p.User) 
                .AsNoTracking()
                .ToListAsync();
            return posts.Select(p => new PostDto
            {
                PostId       = p.PostId,
                MediaType    = p.MediaType,
                Description  = p.Description,
                FilePath     = p.FilePath,
                CreatedAt    = p.CreatedAt,
                LikeCounter  = p.LikeCounter,
                IsApproved   = p.IsApproved,
                HumorTypeIds = p.PostHumors.Select(ph => ph.HumorTypeId).ToList(),
                UserName     = p.User?.UserName ?? p.User?.Name ?? "Anonymous" 
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

            var dtos = await FetchPostsAsync(paginatedQuery);
            return new FeedResultDTO { Posts = dtos };
        }

        public async Task<FeedResultDTO> FeedGeneratorEverythingGoes(int page, int pageSize)
        {
            var paginatedQuery = _ctx.Posts
                .Where(p => p.IsApproved)
                .OrderBy(p => Guid.NewGuid())
                .Skip((page - 1) * pageSize)
                .Take(pageSize);

            var dtos = await FetchPostsAsync(paginatedQuery);
            return new FeedResultDTO { Posts = dtos };
        }
    }
}