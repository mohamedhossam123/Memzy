using Memzy_finalist.Models;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace MyApiProject.Controllers
{
    [ApiController]
[Route("api/[controller]")]
public class PostingController : ControllerBase
{
    private readonly MemzyContext _context;
    private readonly IPostingService _postingService;
    private readonly IWebHostEnvironment _environment;

    public PostingController(MemzyContext context, IPostingService postingService, IWebHostEnvironment environment)
    {
        _context = context;
        _postingService = postingService;
        _environment = environment;
    }

    [HttpPost("image")]
    public async Task<IActionResult> CreatePostingImage([FromForm] Image image)
    {
        if (image.ImageFile == null || image.ImageFile.Length == 0)
            return BadRequest("Image file is required");
        var uploadResult = await _postingService.SaveFileAsync(image.ImageFile, "images");
        image.FileName = image.ImageFile.FileName;
        image.FilePath = uploadResult.FilePath;
        image.ContentType = image.ImageFile.ContentType;
        image.FileSize = image.ImageFile.Length;
        image.CreatedAt = DateTime.UtcNow;
        _context.Images.Add(image);
        await _context.SaveChangesAsync();
        return Ok(new { 
            ImageId = image.ImageId,
            FilePath = image.FilePath,
            Message = "Image posted successfully" 
        });
    }
    [HttpPost("video")]
    public async Task<IActionResult> CreatePostVideo([FromForm] Video video)
    {
        if (video.VideoFile == null || video.VideoFile.Length == 0)
            return BadRequest("Video file is required");
        var uploadResult = await _postingService.SaveFileAsync(video.VideoFile, "videos");
        video.FileName = video.VideoFile.FileName;
        video.FilePath = uploadResult.FilePath;
        video.ContentType = video.VideoFile.ContentType;
        video.FileSize = video.VideoFile.Length;
        video.CreatedAt = DateTime.UtcNow;

        _context.Videos.Add(video);
        await _context.SaveChangesAsync();

        return Ok(new { 
            VideoId = video.VideoId,
            FilePath = video.FilePath,
            Message = "Video posted successfully" 
        });
    }
}
}