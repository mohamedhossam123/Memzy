using Memzy_finalist.Models;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Http;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Threading.Tasks;

public interface IPostingService
{
    Task<FileUploadResult> SaveFileAsync(IFormFile file, string containerName);
    Task<Image> PostImageAsync(IFormFile imageFile, List<string> humor, string description, int userId);
    Task<Video> PostVideoAsync(IFormFile videoFile, List<string> humor, string description, int userId);
}

public class PostingService : IPostingService
{
    private readonly MemzyContext _context;
    private readonly IWebHostEnvironment _environment;

    public PostingService(MemzyContext context, IWebHostEnvironment environment)
    {
        _context = context;
        _environment = environment;
    }

    public async Task<FileUploadResult> SaveFileAsync(IFormFile file, string containerName)
    {
        var uploadsFolder = Path.Combine(_environment.WebRootPath, "uploads", containerName);
        if (!Directory.Exists(uploadsFolder))
            Directory.CreateDirectory(uploadsFolder);

        var uniqueFileName = $"{Guid.NewGuid()}_{file.FileName}";
        var filePath = Path.Combine(uploadsFolder, uniqueFileName);

        using (var fileStream = new FileStream(filePath, FileMode.Create))
        {
            await file.CopyToAsync(fileStream);
        }

        return new FileUploadResult
        {
            FilePath = Path.Combine("uploads", containerName, uniqueFileName),
            FileName = file.FileName
        };
    }

    public async Task<Image> PostImageAsync(IFormFile imageFile, List<string> humor, string description, int userId)
    {
        var uploadResult = await SaveFileAsync(imageFile, "images");
        
        var image = new Image 
        {
            UserId = userId,
            Description = description,
            Humor = humor,
            FileName = imageFile.FileName,
            FilePath = uploadResult.FilePath,
            ContentType = imageFile.ContentType,
            FileSize = imageFile.Length,
            CreatedAt = DateTime.UtcNow,
            ImageLikeCounter = 0
        };

        await _context.Images.AddAsync(image);
        await _context.SaveChangesAsync();

        return image;
    }

    public async Task<Video> PostVideoAsync(IFormFile videoFile, List<string> humor, string description, int userId)
    {
        var uploadResult = await SaveFileAsync(videoFile, "videos");
        
        var video = new Video 
        {
            UserId = userId,
            Description = description,
            Humor = humor,
            FileName = videoFile.FileName,
            FilePath = uploadResult.FilePath,
            ContentType = videoFile.ContentType,
            FileSize = videoFile.Length,
            CreatedAt = DateTime.UtcNow,
            VideoLikeCounter = 0
        };

        await _context.Videos.AddAsync(video);
        await _context.SaveChangesAsync();

        return video;
    }
}
public class FileUploadResult
{
    public string FilePath { get; set; }
    public string FileName { get; set; }
}