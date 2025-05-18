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
    public async Task<IActionResult> GetMyPosts([FromQuery] MediaType? mediaType = null)
    {
        var uid = await _auth.GetAuthenticatedUserId();

        var q = _ctx.Posts
            .Where(p => p.UserId == uid)
            .Include(p => p.PostHumors)
               .ThenInclude(ph => ph.HumorType)
            .OrderByDescending(p => p.CreatedAt)
            .AsQueryable();

        if (mediaType != null)
            q = q.Where(p => p.MediaType == mediaType);

        var list = await q.ToListAsync();
        return Ok(list);
    }

    [HttpPost("CreatePost")]
[Authorize]
public async Task<IActionResult> CreatePost([FromForm] CreatePostRequest request)
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
