using Memzy_finalist.Models;
using Microsoft.AspNetCore.Authentication.Cookies;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

public interface IPostingService
{
    Task<Image> PostImageAsync(string imageUrl,List<string> humor,string descreption);
    Task<Video> PostvideoAsync(string VideoUrl,List<string> humor,string descreption);
    }

public class PostingService : IPostingService
{
    private readonly MemzyContext _context;
    public PostingService(MemzyContext context)
    {
        _context = context;
    }
    public async Task<Image> PostImageAsync(string imageUrl, List<string> humor,string descreption)
    {
        Image image = new Image { ImageUrl = imageUrl, Description = descreption, Humor = humor ,CreatedAt = DateTime.Now};
        await _context.Images.AddAsync(image);
        await _context.SaveChangesAsync();
        return image;
    }
    public async Task<Video> PostvideoAsync(string VideoUrl, List<string> humor, string descreption)
    {
        Video video = new Video { VideoUrl = VideoUrl, Description = descreption, Humor = humor, CreatedAt = DateTime.Now };
        await _context.Videos.AddAsync(video);
        await _context.SaveChangesAsync();
        return video;
    }
}