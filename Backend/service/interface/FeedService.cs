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
            // Get the user's single humor type
            var userHumorTypeId = await _context.Users
                .Where(u => u.UserId == userId)
                .Select(u => u.HumorTypeId)
                .FirstOrDefaultAsync();

            if (userHumorTypeId == null)
            {
                return await FeedGeneratorEverythingGoes();
            }

            // Get videos matching the user's humor preference
            var videos = await _context.Videos
                .Include(v => v.VideoHumors)
                .ThenInclude(vh => vh.HumorType)
                .Where(v => v.VideoHumors.Any(vh => vh.HumorTypeId == userHumorTypeId))
                .Where(v => v.IsApproved == true)
                .OrderByDescending(v => v.CreatedAt)
                .Take(3)
                .ToListAsync();

            // Get images matching the user's humor preference
            var images = await _context.Images
                .Include(i => i.ImageHumors)
                .ThenInclude(ih => ih.HumorType)
                .Where(i => i.ImageHumors.Any(ih => ih.HumorTypeId == userHumorTypeId))
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
                .OrderByDescending(v => v.CreatedAt)
                .Where(v => v.IsApproved == true)
                .Take(3)
                .ToListAsync();

            var images = await _context.Images
                .OrderByDescending(i => i.CreatedAt)
                .Where(i => i.IsApproved == true)
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