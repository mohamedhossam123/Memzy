using Memzy_finalist.Models;
using Microsoft.EntityFrameworkCore;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

public interface IFeedService
{
    Task<FeedResult> FeedGeneratorBasedOnHumor(int userId);
    Task<FeedResult> GetvideoAsyncEverythingGoes();
}

public class FeedResult
{
    public List<Video> Video { get; set; }
    public List<Image> Image { get; set; }
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
        var userHumorPreferences = await _context.UserHumorPreference
            .Where(uhp => uhp.UserId == userId)
            .Select(uhp => uhp.HumorType)
            .ToListAsync();
        if (userHumorPreferences == null || !userHumorPreferences.Any())
        {
            return await GetvideoAsyncEverythingGoes();
        }
        var videos = await _context.Videos
            .Where(v => v.Humor.Any(h => userHumorPreferences.Contains(h)))
            .OrderByDescending(v => v.CreatedAt)
            .Take(3)
            .ToListAsync();
        var images = await _context.Images
            .Where(i => i.Humor.Any(h => userHumorPreferences.Contains(h)))
            .OrderByDescending(i => i.CreatedAt)
            .Take(3)
            .ToListAsync();

        return new FeedResult
        {
            Video = videos,
            Image = images
        };
    }

    public async Task<FeedResult> GetvideoAsyncEverythingGoes()
    {
        var videos = await _context.Videos
            .OrderByDescending(v => v.CreatedAt)
            .Take(3)
            .ToListAsync();

        var images = await _context.Images
            .OrderByDescending(i => i.CreatedAt)
            .Take(3)
            .ToListAsync();

        return new FeedResult
        {
            Video = videos,
            Image = images
        };
    }
}