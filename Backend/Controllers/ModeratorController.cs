using Memzy_finalist.Models;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using System.Collections.Generic;
using System.Threading.Tasks;

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
        public async Task<IActionResult> DeleteUser(int id)
        {
            await _moderatorService.DeleteUserAsync(id);
            return Ok(new { Message = "User deleted successfully" });
        }
        [HttpGet("pendingPosts")]
        public async Task<IActionResult> GetPendingPosts()
        {
            var pendingPosts = await _moderatorService.GetPendingPostsAsync();
            return Ok(pendingPosts);
        }
        [HttpPost("approvePost")]
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
        public async Task<IActionResult> DeletePost(int postId, int modId)
        {
            var result = await _moderatorService.DeletePostAsync(postId, modId);
            if (result)
            {
                return Ok(new { Message = "Post deleted successfully" });
            }
            return BadRequest(new { Message = "Failed to delete post" });
    }
    
    }
}