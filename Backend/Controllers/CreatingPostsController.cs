using Memzy_finalist.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace MyApiProject.Controllers
{
    [ApiController]
    [Route("api/user")]
    [Authorize] // Ensures all endpoints require authentication
    public class UserPostsController : ControllerBase
    {
        private readonly MemzyContext _ctx;
        private readonly IAuthenticationService _auth;

        public UserPostsController(MemzyContext context, IAuthenticationService authService)
        {
            _ctx = context;
            _auth = authService;
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

    // GET api/user/posts/stats
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