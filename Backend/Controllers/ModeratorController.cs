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
        public async Task<IActionResult> DeleteUser(int id)
        {
            await _moderatorService.DeleteUserAsync(id);
            return Ok(new { Message = "User deleted successfully" });
        }
        [HttpGet("pendingPosts")]
        [Authorize]
        public async Task<IActionResult> GetPendingPosts()
        {
            var pendingPosts = await _moderatorService.GetPendingPostsAsync();
            return Ok(pendingPosts);
        }
        [HttpPost("approvePost")]
        [Authorize]
        public async Task<IActionResult> ApprovePost(int postId, int modId)
        {
            var result = await _moderatorService.ApprovePostAsync(postId, modId);
            if (result)
            {
                return Ok(new { Message = "Post approved successfully" });
            }
            return BadRequest(new { Message = "Failed to approve post" });
        }
        [HttpPost("rejectPost")]
        [Authorize]
        public async Task<IActionResult> RejectPost(int postId, int modId)
        {
            var result = await _moderatorService.RejectPostAsync(postId, modId);
            if (result)
            {
                return Ok(new { Message = "Post rejected successfully" });
            }
            return BadRequest(new { Message = "Failed to reject post" });
        }
        [HttpDelete("deletePost")]
        [Authorize] 
        public async Task<IActionResult> DeletePost(int postId, int modId)
        {
            var result = await _moderatorService.DeletePostAsync(postId, modId);
            if (result)
            {
                return Ok(new { Message = "Post deleted successfully" });
            }
            return BadRequest(new { Message = "Failed to delete post" });
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