using Memzy_finalist.Models;
using Microsoft.EntityFrameworkCore;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

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
        var userHumorTypeIds = await _context.UserHumorPreferences
            .Where(uh => uh.UserId == userId)
            .Select(uh => uh.HumorTypeId)
            .ToListAsync();

        if (!userHumorTypeIds.Any())
        {
            return await FeedGeneratorEverythingGoes();
        }
        var videos = await _context.Videos
            .Include(v => v.VideoHumors)
            .ThenInclude(vh => vh.HumorType)
            .Where(v => v.VideoHumors.Any(vh => userHumorTypeIds.Contains(vh.HumorTypeId)))
            .OrderByDescending(v => v.CreatedAt)
            .Take(3)
            .ToListAsync();
        var images = await _context.Images
            .Include(i => i.ImageHumors)
            .ThenInclude(ih => ih.HumorType)
            .Where(i => i.ImageHumors.Any(ih => userHumorTypeIds.Contains(ih.HumorTypeId)))
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
            .Take(3)
            .ToListAsync();

        var images = await _context.Images
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