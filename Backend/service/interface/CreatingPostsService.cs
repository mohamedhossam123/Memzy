using Memzy_finalist.Models;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Http;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.IO;
using System.Linq;
using System.Threading.Tasks;

public interface ICreatingPostsService
{
    Task<FileUploadResult> SaveFileAsync(IFormFile file, string containerName);
    Task<Image> PostImageAsync(IFormFile imageFile, List<int> humorTypeIds, string description, int userId);
    Task<Video> PostVideoAsync(IFormFile videoFile, List<int> humorTypeIds, string description, int userId);
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

    public async Task<Image> PostImageAsync(IFormFile imageFile, List<int> humorTypeIds, string description, int userId)
    {
        if (imageFile == null)
        {
            _logger.LogError("ImageFile is null");
            throw new ArgumentNullException(nameof(imageFile));
        }

        if (humorTypeIds == null || !humorTypeIds.Any())
        {
            _logger.LogError("HumorTypeIds is null or empty");
            throw new ArgumentException("At least one humor type is required", nameof(humorTypeIds));
        }

        var user = await _context.Users.FindAsync(userId) 
            ?? throw new KeyNotFoundException($"User with ID {userId} not found");

        _logger.LogInformation($"Starting image upload for user {userId}");
        var uploadResult = await SaveFileAsync(imageFile, "images");
        
        var image = new Image 
        {
            UserId = userId,
            Description = description ?? string.Empty,
            FileName = uploadResult.FileName,
            FilePath = uploadResult.FilePath,
            ContentType = imageFile.ContentType,
            FileSize = imageFile.Length,
            CreatedAt = DateTime.UtcNow,
            ImageLikeCounter = 0,
            ImageHumors = new List<ImageHumor>()
        };

        foreach (var humorTypeId in humorTypeIds.Distinct())
        {
            var humorType = await _context.HumorTypes.FindAsync(humorTypeId);
            if (humorType != null)
            {
                image.ImageHumors.Add(new ImageHumor { HumorTypeId = humorTypeId });
                _logger.LogInformation($"Added humor type {humorTypeId} to image");
            }
            else
            {
                _logger.LogWarning($"Humor type with ID {humorTypeId} not found");
            }
        }

        if (!image.ImageHumors.Any())
        {
            _logger.LogError("No valid humor types found");
            throw new InvalidOperationException("No valid humor types were found");
        }

        _context.Images.Add(image);
        await _context.SaveChangesAsync();
        _logger.LogInformation($"Successfully saved image with ID {image.ImageId}");

        return image;
    }

    public async Task<Video> PostVideoAsync(IFormFile videoFile, List<int> humorTypeIds, string description, int userId)
    {
        if (videoFile == null)
        {
            _logger.LogError("VideoFile is null");
            throw new ArgumentNullException(nameof(videoFile));
        }

        if (humorTypeIds == null || !humorTypeIds.Any())
        {
            _logger.LogError("HumorTypeIds is null or empty");
            throw new ArgumentException("At least one humor type is required", nameof(humorTypeIds));
        }

        var user = await _context.Users.FindAsync(userId) 
            ?? throw new KeyNotFoundException($"User with ID {userId} not found");

        _logger.LogInformation($"Starting video upload for user {userId}");
        var uploadResult = await SaveFileAsync(videoFile, "videos");
        
        var video = new Video 
        {
            UserId = userId,
            Description = description ?? string.Empty,
            FileName = uploadResult.FileName,
            FilePath = uploadResult.FilePath,
            ContentType = videoFile.ContentType,
            FileSize = videoFile.Length,
            CreatedAt = DateTime.UtcNow,
            VideoLikeCounter = 0,
            VideoHumors = new List<VideoHumor>()
        };

        foreach (var humorTypeId in humorTypeIds.Distinct())
        {
            var humorType = await _context.HumorTypes.FindAsync(humorTypeId);
            if (humorType != null)
            {
                video.VideoHumors.Add(new VideoHumor { HumorTypeId = humorTypeId });
                _logger.LogInformation($"Added humor type {humorTypeId} to video");
            }
            else
            {
                _logger.LogWarning($"Humor type with ID {humorTypeId} not found");
            }
        }

        if (!video.VideoHumors.Any())
        {
            _logger.LogError("No valid humor types found");
            throw new InvalidOperationException("No valid humor types were found");
        }

        _context.Videos.Add(video);
        await _context.SaveChangesAsync();
        _logger.LogInformation($"Successfully saved video with ID {video.VideoId}");

        return video;
    }
}

public class FileUploadResult
{
    [Required]
    public string FilePath { get; set; } = string.Empty;
    [Required]
    public string FileName { get; set; } = string.Empty;
}