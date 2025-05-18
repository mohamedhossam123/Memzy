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
                HumorTypeIds = p.PostHumors.Select(ph => ph.HumorTypeId).ToList()
            }).ToList();
        }

        public async Task<FeedResultDTO> FeedGeneratorBasedOnHumor(int userId)
        {
            var prefs = await _ctx.UserHumorTypes
                .Where(u => u.UserId == userId)
                .Select(u => u.HumorTypeId)
                .ToListAsync();

            IQueryable<Post> baseQuery = _ctx.Posts
                .Where(p => p.IsApproved)
                .OrderByDescending(p => p.CreatedAt);

            if (prefs.Any())
            {
                baseQuery = baseQuery
                    .Where(p => p.PostHumors.Any(ph => prefs.Contains(ph.HumorTypeId)));
            }
            var topPostsQuery = baseQuery.Take(6);

            var dtos = await FetchPostsAsync(topPostsQuery);
            return new FeedResultDTO { Posts = dtos };
        }

        public async Task<FeedResultDTO> FeedGeneratorEverythingGoes()
        {
            var topPostsQuery = _ctx.Posts
                .Where(p => p.IsApproved)
                .OrderByDescending(p => p.CreatedAt)
                .Take(6);

            var dtos = await FetchPostsAsync(topPostsQuery);
            return new FeedResultDTO { Posts = dtos };
        }
    }
}
