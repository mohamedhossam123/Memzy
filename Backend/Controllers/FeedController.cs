using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using Microsoft.EntityFrameworkCore;
using Memzy_finalist.Models.Entities;
using Memzy_finalist.Models;

namespace MyApiProject.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class PostsController : ControllerBase
    {
        private readonly IAuthenticationService _authService;
        private readonly IFeedService _feedService;
        private readonly MemzyContext _context;

        public PostsController(IFeedService feedService, IAuthenticationService authService, MemzyContext context)
        {
            _authService = authService;
            _feedService = feedService;
            _context = context;
        }

        [HttpPost("GetFirst6BasedOnUser")]
        [Authorize]
        public async Task<IActionResult> FeedGeneratorBasedOnHumor([FromBody] PaginationRequest request)
        {
            var userId = await _authService.GetAuthenticatedUserId();
            var result = await _feedService.FeedGeneratorBasedOnHumor(userId, request.Page, request.PageSize);
            return Ok(result);
        }

        [HttpPost("GetFirst6")]
        public async Task<IActionResult> GetvideoAsyncEverythingGoes([FromBody] PaginationRequest request)
        {
            int? currentUserId = null;
            if (User.Identity?.IsAuthenticated == true)
            {
                try
                {
                    currentUserId = await _authService.GetAuthenticatedUserId();
                }
                catch
                {
                    currentUserId = null;
                }
            }
            var result = await _feedService.FeedGeneratorEverythingGoes(request.Page, request.PageSize, currentUserId);
            return Ok(result);
        }

        [HttpPost("{postId}/like")]
        [Authorize]
        public async Task<IActionResult> LikePost(int postId)
        {
            try
            {
                var userId = await _authService.GetAuthenticatedUserId();
                var post = await _context.Posts.FindAsync(postId);
                if (post == null)
                {
                    return NotFound(new { message = "Post not found" });
                }
                var existingLike = await _context.Set<PostLike>()
                    .FirstOrDefaultAsync(pl => pl.PostId == postId && pl.UserId == userId);

                if (existingLike != null)
                {
                    return BadRequest(new { message = "Post already liked" });
                }

                // Add the like
                var like = new PostLike
                {
                    PostId = postId,
                    UserId = userId
                };

                _context.Set<PostLike>().Add(like);
                await _context.SaveChangesAsync();

                // Get updated like count
                var likeCount = await _context.Set<PostLike>()
                    .CountAsync(pl => pl.PostId == postId);

                return Ok(new { 
                    message = "Post liked successfully", 
                    likeCount = likeCount,
                    isLiked = true 
                });
            }
            catch (Exception )
            {
                return StatusCode(500, new { message = "An error occurred while liking the post" });
            }
        }

        [HttpDelete("{postId}/like")]
        [Authorize]
        public async Task<IActionResult> UnlikePost(int postId)
        {
            try
            {
                var userId = await _authService.GetAuthenticatedUserId();

                var post = await _context.Posts.FindAsync(postId);
                if (post == null)
                {
                    return NotFound(new { message = "Post not found" });
                }
                var existingLike = await _context.Set<PostLike>()
                    .FirstOrDefaultAsync(pl => pl.PostId == postId && pl.UserId == userId);

                if (existingLike == null)
                {
                    return BadRequest(new { message = "Post not liked by user" });
                }
                _context.Set<PostLike>().Remove(existingLike);
                await _context.SaveChangesAsync();
                var likeCount = await _context.Set<PostLike>()
                    .CountAsync(pl => pl.PostId == postId);
                return Ok(new { 
                    message = "Post unliked successfully", 
                    likeCount = likeCount,
                    isLiked = false 
                });
            }
            catch (Exception)
            {
                return StatusCode(500, new { message = "An error occurred while unliking the post" });
            }
        }
        [HttpGet("{postId}/like-status")]
        [Authorize]
        public async Task<IActionResult> GetLikeStatus(int postId)
        {
            try
            {
                var userId = await _authService.GetAuthenticatedUserId();
                
                var isLiked = await _context.Set<PostLike>()
                    .AnyAsync(pl => pl.PostId == postId && pl.UserId == userId);

                var likeCount = await _context.Set<PostLike>()
                    .CountAsync(pl => pl.PostId == postId);

                return Ok(new { 
                    isLiked = isLiked, 
                    likeCount = likeCount 
                });
            }
            catch (Exception )
            {
                return StatusCode(500, new { message = "An error occurred while getting like status" });
            }
        }
    }
}