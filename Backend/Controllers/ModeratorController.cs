using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;

namespace MyApiProject.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class ModeratorController : ControllerBase
    {
        private readonly IModeratorService _moderatorService;

        public ModeratorController(IModeratorService moderatorService)
        {
            _moderatorService = moderatorService;
        }
        [HttpDelete("deleteUser")]
        [Authorize]
        public async Task<IActionResult> DeleteUser([FromBody] DeleteUserRequest request)
        {
            try
            {
                await _moderatorService.DeleteUserAsync(request.Id);
                return Ok(new { Message = "User deleted successfully" });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { Message = "Failed to delete user", Error = ex.Message });
            }
        }

        [HttpGet("pendingPosts")]
        [Authorize]
        public async Task<IActionResult> GetPendingPosts()
        {
            try
            {
                var pendingPosts = await _moderatorService.GetPendingPostsAsync();
                return Ok(pendingPosts);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { Message = "Failed to retrieve pending posts", Error = ex.Message });
            }
        }

        [HttpPost("approvePost")]
        [Authorize]
        public async Task<IActionResult> ApprovePost([FromBody] PostActionRequest request)
        {
            try
            {
                var result = await _moderatorService.ApprovePostAsync(request.PostId, request.ModId);
                if (result)
                {
                    return Ok(new { Message = "Post approved successfully" });
                }
                return BadRequest(new { Message = "Failed to approve post" });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { Message = "An error occurred while approving the post", Error = ex.Message });
            }
        }

        [HttpPost("rejectPost")]
        [Authorize]
        public async Task<IActionResult> RejectPost([FromBody] PostActionRequest request)
        {
            try
            {
                var result = await _moderatorService.RejectPostAsync(request.PostId, request.ModId);
                if (result)
                {
                    return Ok(new { Message = "Post rejected successfully" });
                }
                return BadRequest(new { Message = "Failed to reject post" });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { Message = "An error occurred while rejecting the post", Error = ex.Message });
            }
        }

        [HttpDelete("deletePost")]
        [Authorize] 
        public async Task<IActionResult> DeletePost([FromBody] PostActionRequest request)
        {
            try
            {
                var result = await _moderatorService.DeletePostAsync(request.PostId, request.ModId);
                if (result)
                {
                    return Ok(new { Message = "Post deleted successfully" });
                }
                return BadRequest(new { Message = "Failed to delete post" });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { Message = "An error occurred while deleting the post", Error = ex.Message });
            }
        }

        [HttpGet("users")]
        [Authorize] 
        public async Task<IActionResult> GetAllUsers()
        {
            try
            {
                var users = await _moderatorService.GetAllUsersAsync();
                return Ok(users);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { Message = "Failed to retrieve users", Error = ex.Message });
            }
        }
    }
}