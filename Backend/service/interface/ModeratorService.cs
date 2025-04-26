
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
    Task<bool> ApproveimageAsync(int postId, int moderatorId);
    Task<bool> ApproveVideoAsync(int postId, int moderatorId);
    Task<bool> RejectimageAsync(int postId, int moderatorId);
    Task<bool> RejectvideoAsync(int postId, int moderatorId);
    Task<List<Image>> GetPendingImagesAsync();
    Task<List<Video>> GetPendingVideosAsync();
    Task<bool> DeleteImageAsync(int postId, int moderatorId);
    Task<bool> DeleteVideoAsync(int postId, int moderatorId);
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

    public async Task<bool> ApproveimageAsync(int postId, int moderatorId)
    {
        var image = await _context.Images.FindAsync(postId);
        if (image == null) return false;

        image.IsApproved = true;
        await _context.SaveChangesAsync();
        return true;
    }
    public async Task<bool> ApproveVideoAsync(int postId, int moderatorId)
    {
        var video = await _context.Videos.FindAsync(postId);
        if (video == null) return false;

        video.IsApproved = true;
        await _context.SaveChangesAsync();
        return true;
    }
    public async Task<bool> RejectimageAsync(int postId, int moderatorId)
    {
        var image = await _context.Images.FindAsync(postId);
        if (image == null) return false;

        image.IsApproved = false;
        await _context.SaveChangesAsync();
        return true;
    }
    public async Task<bool> RejectvideoAsync(int postId, int moderatorId)
    {
        var video = await _context.Videos.FindAsync(postId);
        if (video == null) return false;

        video.IsApproved = false;
        await _context.SaveChangesAsync();
        return true;
    }

    public async Task<List<Image>> GetPendingImagesAsync()
    {
        return await _context.Images.Where(i => !i.IsApproved).ToListAsync();
    }
    public async Task<List<Video>> GetPendingVideosAsync()
    {
        return await _context.Videos.Where(v => !v.IsApproved).ToListAsync();
    }
    public async Task<bool> DeleteImageAsync(int postId, int moderatorId)
    {
        var image = await _context.Images.FindAsync(postId);
        if (image == null) return false;

        _context.Images.Remove(image);
        await _context.SaveChangesAsync();
        return true;
    }
    public async Task<bool> DeleteVideoAsync(int postId, int moderatorId)
    {
        var video = await _context.Videos.FindAsync(postId);
        if (video == null) return false;

        _context.Videos.Remove(video);
        await _context.SaveChangesAsync();
        return true;
    }
    
    }