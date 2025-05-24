using Memzy_finalist.Models;
using Microsoft.EntityFrameworkCore;
using CloudinaryDotNet;
using CloudinaryDotNet.Actions;

public class CreatingPostsService : ICreatingPostsService
{
    private readonly MemzyContext _context;
    private readonly IWebHostEnvironment _environment;
    private readonly ILogger<CreatingPostsService> _logger;
    private readonly Cloudinary _cloudinary;

    public CreatingPostsService(
        MemzyContext context,
        IWebHostEnvironment environment,
        ILogger<CreatingPostsService> logger,
        Cloudinary cloudinary)
    {
        _context = context;
        _environment = environment;
        _logger = logger;
        _cloudinary = cloudinary;
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

        var validHumorTypes = await _context.HumorTypes
            .Where(ht => humorTypeIds.Contains(ht.HumorTypeId))
            .ToListAsync();

        if (!validHumorTypes.Any())
            throw new InvalidOperationException("No valid humor types found");

        post.PostHumors = validHumorTypes.Select(ht => new PostHumor
        {
            HumorTypeId = ht.HumorTypeId,
            Post = post
        }).ToList();

        _context.Posts.Add(post);
        await _context.SaveChangesAsync();

        return post;
    }

    public async Task<FileUploadResult> SaveFileAsync(IFormFile file, string containerName)
    {
        if (file == null || file.Length == 0)
            throw new ArgumentException("File is required");

        var extension = Path.GetExtension(file.FileName).ToLowerInvariant();
        var isImage = new[] { ".jpg", ".jpeg", ".png", ".gif", ".webp" }.Contains(extension);
        var isVideo = new[] { ".mp4", ".webm", ".mov" }.Contains(extension);

        if (containerName == "images" && !isImage)
            throw new ArgumentException("Invalid image file type");

        if (containerName == "videos" && !isVideo)
            throw new ArgumentException("Invalid video file type");

        await using var stream = file.OpenReadStream();
        UploadResult uploadResult;

        if (containerName == "images")
        {
            var uploadParams = new ImageUploadParams
            {
                File = new FileDescription(file.FileName, stream),
                Folder = $"memzy/{containerName}"
            };
            uploadResult = await _cloudinary.UploadAsync(uploadParams);
        }
        else
        {
            var uploadParams = new VideoUploadParams
            {
                File = new FileDescription(file.FileName, stream),
                Folder = $"memzy/{containerName}"
            };
            uploadResult = await _cloudinary.UploadAsync(uploadParams);
        }

        if (uploadResult.StatusCode != System.Net.HttpStatusCode.OK)
            throw new ApplicationException("Cloudinary upload failed");

        return new FileUploadResult
        {
            FilePath = uploadResult.SecureUrl.ToString(),
            FileName = uploadResult.PublicId,
            ContentType = file.ContentType
        };
    }

    public async Task<List<object>> GetUserPostsAsync(int userId)
    {
        return await _context.Posts
            .Where(p => p.UserId == userId)
            .Include(p => p.PostHumors)
                .ThenInclude(ph => ph.HumorType)
            .OrderByDescending(p => p.CreatedAt)
            .Select(p => new
            {
                p.PostId,
                p.UserId,
                p.MediaType,
                p.Description,
                p.FileName,
                p.FilePath,
                p.ContentType,
                p.FileSize,
                p.CreatedAt,
                p.LikeCounter,
                p.IsApproved,
                PostHumors = p.PostHumors.Select(ph => new
                {
                    HumorType = new
                    {
                        id = ph.HumorType.HumorTypeId,
                        name = ph.HumorType.HumorTypeName
                    }
                }).ToList()
            })
            .Cast<object>()
            .ToListAsync();
    }

    public async Task<object> GetUserStatsAsync(int userId)
    {
        var userPosts = _context.Posts.Where(p => p.UserId == userId);
        var total = await userPosts.CountAsync();
        var approved = await userPosts.CountAsync(p => p.IsApproved);
        var pending = total - approved;
        var likes = await userPosts.SumAsync(p => p.LikeCounter);

        return new
        {
            TotalPosts = total,
            ApprovedPosts = approved,
            PendingPosts = pending,
            TotalLikes = likes
        };
    }
}
