using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
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

        public PostsController(IFeedService feedService, IAuthenticationService authService)
        {
            _authService = authService;
            _feedService = feedService;
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
                var result = await _feedService.LikePostAsync(postId, userId);

                if (!result.Success)
                {
                    if (result.Message == "Post not found")
                        return NotFound(new { message = result.Message });
                    
                    return BadRequest(new { message = result.Message });
                }

                return Ok(new { 
                    message = result.Message, 
                    likeCount = result.LikeCount,
                    isLiked = result.IsLiked 
                });
            }
            catch (Exception)
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
                var result = await _feedService.UnlikePostAsync(postId, userId);

                if (!result.Success)
                {
                    if (result.Message == "Post not found")
                        return NotFound(new { message = result.Message });
                    
                    return BadRequest(new { message = result.Message });
                }

                return Ok(new { 
                    message = result.Message, 
                    likeCount = result.LikeCount,
                    isLiked = result.IsLiked 
                });
            }
            catch (Exception)
            {
                return StatusCode(500, new { message = "An error occurred while unliking the post" });
            }
        }

        [HttpGet("GetUserPosts/{userId}")]
        [Authorize]
        public async Task<IActionResult> GetUserPosts(int userId)
        {
            try
            {
                var currentUserId = await _authService.GetAuthenticatedUserId();
                var dtos = await _feedService.GetUserPostsAsync(userId, currentUserId);
                return Ok(dtos);
            }
            catch (Exception)
            {
                return StatusCode(500, new { message = "An error occurred while fetching user posts" });
            }
        }

        [HttpGet("{postId}/like-status")]
        [Authorize]
        public async Task<IActionResult> GetLikeStatus(int postId)
        {
            try
            {
                var userId = await _authService.GetAuthenticatedUserId();
                var result = await _feedService.GetLikeStatusAsync(postId, userId);
                return Ok(result);
            }
            catch (Exception)
            {
                return StatusCode(500, new { message = "An error occurred while getting like status" });
            }
        }
    }
}