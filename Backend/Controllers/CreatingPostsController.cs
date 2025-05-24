using Memzy_finalist.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace MyApiProject.Controllers
{
    [ApiController]
    [Route("api/user")]
    [Authorize]
    public class CreatingPostsController : ControllerBase
    {
        private readonly IAuthenticationService _auth;
        private readonly ICreatingPostsService _creatingPostsService;

        public CreatingPostsController(IAuthenticationService authService, ICreatingPostsService creatingPostsService)
        {
            _auth = authService;
            _creatingPostsService = creatingPostsService;
        }

        [HttpGet]
        public async Task<IActionResult> GetMyPosts()
        {
            var uid = await _auth.GetAuthenticatedUserId();
            var posts = await _creatingPostsService.GetUserPostsAsync(uid);
            return Ok(posts);
        }

        [HttpPost("CreatePost")]
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
                return StatusCode(500, new { message = ex.Message });
            }
        }

        [HttpGet("stats")]
        public async Task<IActionResult> GetStats()
        {
            var uid = await _auth.GetAuthenticatedUserId();
            var stats = await _creatingPostsService.GetUserStatsAsync(uid);
            return Ok(stats);
        }
    }
}
