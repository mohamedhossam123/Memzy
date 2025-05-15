using Memzy_finalist.Models;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using MoreLinq.Experimental;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.IO;
using System.Linq;
using System.Threading.Tasks;

public interface ICreatingPostsService
{
    Task<FileUploadResult> SaveFileAsync(IFormFile file, string containerName);
    Task<Post> PostMediaAsync(
        IFormFile file,
        List<int> humorTypeIds,
        string description,
        int userId,
        MediaType mediaType
    );
    
}
public class CreatingPostsService : ICreatingPostsService
{
    private readonly MemzyContext _context;
    private readonly IWebHostEnvironment _environment;
    private readonly ILogger<CreatingPostsService> _logger;

    public CreatingPostsService(
        MemzyContext context, 
        IWebHostEnvironment environment, 
        ILogger<CreatingPostsService> logger)
    {
        _context = context ?? throw new ArgumentNullException(nameof(context));
        _environment = environment ?? throw new ArgumentNullException(nameof(environment));
        _logger = logger ?? throw new ArgumentNullException(nameof(logger));
    }
public async Task<Post> PostMediaAsync(
        IFormFile file,
        List<int> humorTypeIds,
        string description,
        int userId,
        MediaType mediaType
    )
    {
        if (file == null || humorTypeIds == null || !humorTypeIds.Any())
            throw new ArgumentException("File + at least one humor type required");

        var user = await _context.Users.FindAsync(userId)
                   ?? throw new KeyNotFoundException($"User {userId} not found");

        var container = mediaType == MediaType.Image ? "images" : "videos";
        var upload = await SaveFileAsync(file, container);

        var post = new Post
        {
            UserId         = userId,
            MediaType      = mediaType,
            Description    = description ?? "",
            FileName       = upload.FileName,
            FilePath       = upload.FilePath,
            ContentType    = file.ContentType,
            FileSize       = file.Length,
            CreatedAt      = DateTime.UtcNow,
            LikeCounter    = 0,
            IsApproved     = false,     
            PostHumors     = new List<PostHumor>()
        };

        foreach (var htId in humorTypeIds.Distinct())
        {
            if (await _context.HumorTypes.AnyAsync(ht => ht.HumorTypeId == htId))
                post.PostHumors.Add(new PostHumor { HumorTypeId = htId });
        }

        if (!post.PostHumors.Any())
            throw new InvalidOperationException("No valid humor types found");

        _context.Posts.Add(post);
        await _context.SaveChangesAsync();
        return post;
    }
    public async Task<FileUploadResult> SaveFileAsync(IFormFile file, string containerName)
    {
        if (file == null || file.Length == 0)
        {
            _logger.LogError("File is null or empty");
            throw new ArgumentException("File is required and cannot be empty", nameof(file));
        }

        if (string.IsNullOrWhiteSpace(containerName))
        {
            _logger.LogError("Container name is null or empty");
            throw new ArgumentException("Container name is required", nameof(containerName));
        }

        var webRootPath = _environment.WebRootPath 
            ?? throw new InvalidOperationException("Web root path is not configured correctly");

        var uploadsFolder = Path.Combine(webRootPath, "uploads", containerName);
        _logger.LogInformation($"Upload folder path: {uploadsFolder}");

        try
        {
            if (!Directory.Exists(uploadsFolder))
            {
                Directory.CreateDirectory(uploadsFolder);
                _logger.LogInformation($"Created directory: {uploadsFolder}");
            }
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, $"Failed to create directory: {uploadsFolder}");
            throw new IOException($"Failed to create directory: {ex.Message}", ex);
        }

        var uniqueFileName = $"{Guid.NewGuid()}_{file.FileName}";
        var filePath = Path.Combine(uploadsFolder, uniqueFileName);
        _logger.LogInformation($"Saving file to: {filePath}");

        try
        {
            using (var fileStream = new FileStream(filePath, FileMode.Create))
            {
                await file.CopyToAsync(fileStream);
            }

            return new FileUploadResult
            {
                FilePath = Path.Combine("uploads", containerName, uniqueFileName),
                FileName = uniqueFileName
            };
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, $"Failed to save file to: {filePath}");
            throw new IOException($"Failed to save file: {ex.Message}", ex);
        }
    }
}
public class CreatePostRequest
{
    [Required]
    public IFormFile File { get; set; }

    [Required]
    public List<int> HumorTypeIds { get; set; }

    public string Description { get; set; }

    [Required]
    public MediaType MediaType { get; set; }
}


public class FileUploadResult
{
    [Required]
    public string FilePath { get; set; } = string.Empty;
    [Required]
    public string FileName { get; set; } = string.Empty;
}