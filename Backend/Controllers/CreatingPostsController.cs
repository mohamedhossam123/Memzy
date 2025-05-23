using Memzy_finalist.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace MyApiProject.Controllers
{
    [ApiController]
    [Route("api/user")]
    [Authorize]
    public class UserPostsController : ControllerBase
    {
        private readonly MemzyContext _ctx;
        private readonly IAuthenticationService _auth;
        private readonly ICreatingPostsService _creatingPostsService;

        public UserPostsController(MemzyContext context, IAuthenticationService authService, ICreatingPostsService creatingPostsService)
        {
            _ctx = context;
            _auth = authService;
            _creatingPostsService = creatingPostsService;
        }
        

        [HttpGet]
public async Task<IActionResult> GetMyPosts()
{
    var uid = await _auth.GetAuthenticatedUserId();

    var posts = await _ctx.Posts
        .Where(p => p.UserId == uid) 
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
                    id=ph.HumorType.HumorTypeId,
                    name=ph.HumorType.HumorTypeName
                }
            }).ToList()
        })
        .ToListAsync();
        
    return Ok(posts);
}

        [HttpPost("CreatePost")]
[Authorize]
public async Task<IActionResult> CreatePost([FromForm] CreatePostRequest request)
{
    try
    {
        var uid = await _auth.GetAuthenticatedUserId();

        var post = await _creatingPostsService.PostMediaAsync(
            request.File,
            request.HumorTypeIds,
            request.Description,
            uid,
            request.MediaType
        );

        return CreatedAtAction(nameof(GetMyPosts), new { id = post.PostId }, post);
    }
    catch (Exception ex)
    {
        Console.WriteLine("Error creating post: " + ex.Message);
        Console.WriteLine(ex.StackTrace);
        return StatusCode(500, new { message = ex.Message });
    }
}


    [HttpGet("stats")]
    public async Task<IActionResult> GetStats()
    {
        var uid = await _auth.GetAuthenticatedUserId();
        var all   = _ctx.Posts.Where(p => p.UserId == uid);
        var total = await all.CountAsync();
        var approved = await all.CountAsync(p => p.IsApproved);
        var pending  = total - approved;
        var likes    = await all.SumAsync(p => p.LikeCounter);

        return Ok(new {
            TotalPosts    = total,
            ApprovedPosts = approved,
            PendingPosts  = pending,
            TotalLikes    = likes
        });
    }
    
}

}
