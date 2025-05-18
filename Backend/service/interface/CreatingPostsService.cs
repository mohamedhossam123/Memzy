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
    MediaType mediaType)
{
    if (file == null || file.Length == 0)
        throw new ArgumentException("File is required");

    if (humorTypeIds == null || !humorTypeIds.Any())
        throw new ArgumentException("At least one humor type is required");

    var user = await _context.Users.FindAsync(userId)
               ?? throw new KeyNotFoundException($"User {userId} not found");
    var container = mediaType == MediaType.Image ? "images" : "videos";
    var upload = await SaveFileAsync(file, container);

    var post = new Post
    {
        UserId = userId,
        MediaType = mediaType,
        Description = description ?? string.Empty,
        FileName = upload.FileName,
        FilePath = upload.FilePath, 
        ContentType = upload.ContentType,
        FileSize = file.Length,
        CreatedAt = DateTime.UtcNow,
        LikeCounter = 0,
        IsApproved = false,
        PostHumors = new List<PostHumor>()
    };

    // Add humor types
    var validHumorTypes = await _context.HumorTypes
        .Where(ht => humorTypeIds.Contains(ht.HumorTypeId))
        .ToListAsync();

    if (!validHumorTypes.Any())
        throw new InvalidOperationException("No valid humor types found");

    post.PostHumors = validHumorTypes
        .Select(ht => new PostHumor
        {
            HumorTypeId = ht.HumorTypeId,
            Post = post
        })
        .ToList();

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

    var allowedImageExtensions = new[] { ".jpg", ".jpeg", ".png", ".gif", ".webp" };
    var allowedVideoExtensions = new[] { ".mp4", ".webm", ".mov" };
    var extension = Path.GetExtension(file.FileName).ToLowerInvariant();
    
    if (containerName == "images" && !allowedImageExtensions.Contains(extension))
        throw new ArgumentException("Invalid image file type");
    
    if (containerName == "videos" && !allowedVideoExtensions.Contains(extension))
        throw new ArgumentException("Invalid video file type");
    var maxSize = containerName == "images" ? 5 * 1024 * 1024 : 50 * 1024 * 1024;
    if (file.Length > maxSize)
        throw new ArgumentException($"File too large. Max size: {maxSize/1024/1024}MB");

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
        var cleanFileName = $"{Guid.NewGuid().ToString("N")[..8]}_{Path.GetFileNameWithoutExtension(file.FileName).Replace(" ", "_")}{extension}";
        var filePath = Path.Combine(uploadsFolder, cleanFileName);
        using (var fileStream = new FileStream(filePath, FileMode.Create))
        {
            await file.CopyToAsync(fileStream);
        }

        return new FileUploadResult
        {
            FilePath = $"/uploads/{containerName}/{cleanFileName}",
            FileName = cleanFileName,
            ContentType = file.ContentType
        };
    }
    catch (Exception ex)
    {
        _logger.LogError(ex, $"Failed to save file");
        throw new IOException($"Failed to save file: {ex.Message}", ex);
    }
}
}
public class CreatePostRequest
{
    [Required(ErrorMessage = "File is required")]
    public IFormFile File { get; set; }

    [Required(ErrorMessage = "At least one humor type is required")]
    [MinLength(1, ErrorMessage = "At least one humor type is required")]
    public List<int> HumorTypeIds { get; set; }

    [StringLength(500, ErrorMessage = "Description cannot exceed 500 characters")]
    public string Description { get; set; }

    [Required(ErrorMessage = "Media type is required")]
    public MediaType MediaType { get; set; }
}


public class FileUploadResult
{
    [Required]
    public string FilePath { get; set; } = string.Empty;
    [Required]
    public string FileName { get; set; } = string.Empty;
    [Required]
    public string ContentType { get; set; } = string.Empty;
}