using Memzy_finalist.Models;
using Microsoft.EntityFrameworkCore;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace Memzy_finalist.Services
{
    public interface IFeedService
    {
        Task<FeedResult> FeedGeneratorBasedOnHumor(int userId);
        Task<FeedResult> FeedGeneratorEverythingGoes();
    }

    public class FeedResult
    {
        public List<Video> Videos { get; set; } = new List<Video>();
        public List<Image> Images { get; set; } = new List<Image>();
    }

    public class FeedService : IFeedService
    {
        private readonly MemzyContext _context;

        public FeedService(MemzyContext context)
        {
            _context = context;
        }

        public async Task<FeedResult> FeedGeneratorBasedOnHumor(int userId)
        {
            // Get the user's humor types
            var userHumorTypeIds = await _context.UserHumorTypes
                .Where(uht => uht.UserId == userId)
                .Select(uht => uht.HumorTypeId)
                .ToListAsync();

            if (!userHumorTypeIds.Any())
            {
                // If the user has no humor types, return everything
                return await FeedGeneratorEverythingGoes();
            }

            // Get videos matching any of the user's humor preferences
            var videos = await _context.Videos
                .Include(v => v.VideoHumors)
                .ThenInclude(vh => vh.HumorType)
                .Where(v => v.VideoHumors.Any(vh => userHumorTypeIds.Contains(vh.HumorTypeId)))
                .Where(v => v.IsApproved == true)
                .OrderByDescending(v => v.CreatedAt)
                .Take(3)
                .ToListAsync();

            // Get images matching any of the user's humor preferences
            var images = await _context.Images
                .Include(i => i.ImageHumors)
                .ThenInclude(ih => ih.HumorType)
                .Where(i => i.ImageHumors.Any(ih => userHumorTypeIds.Contains(ih.HumorTypeId)))
                .Where(i => i.IsApproved == true)
                .OrderByDescending(i => i.CreatedAt)
                .Take(3)
                .ToListAsync();

            return new FeedResult
            {
                Videos = videos,
                Images = images
            };
        }

        public async Task<FeedResult> FeedGeneratorEverythingGoes()
        {
            var videos = await _context.Videos
                .Where(v => v.IsApproved == true)
                .OrderByDescending(v => v.CreatedAt)
                .Take(3)
                .ToListAsync();

            var images = await _context.Images
                .Where(i => i.IsApproved == true)
                .OrderByDescending(i => i.CreatedAt)
                .Take(3)
                .ToListAsync();

            return new FeedResult
            {
                Videos = videos,
                Images = images
            };
        }
    }
}
