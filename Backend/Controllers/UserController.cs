using Memzy_finalist.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace MyApiProject.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class UserController : ControllerBase
    {
        private readonly IUserService _userService;
        private readonly IModeratorService _moderatorService;
        private readonly IAuthenticationService _authService;
        private readonly IWebHostEnvironment _environment;
        private readonly MemzyContext _context;

        public UserController(IUserService userService, IModeratorService moderatorService, IAuthenticationService authService, IWebHostEnvironment environment, MemzyContext context)
        {
            _context = context;
            _userService = userService;
            _moderatorService = moderatorService;
            _authService = authService;
            _environment = environment;
        }

        [HttpPost("UpdateUsername")]
        [Authorize]
        public async Task<IActionResult> UpdateUsername([FromBody] string newName)
        {
            try
            {
                var userId = await _authService.GetAuthenticatedUserId();
                var user = await _userService.UpdateUsernameAsync(userId, newName);
                if (user == null)
                {
                    return NotFound("User not found");
                }
                return Ok(new { Message = "Username updated successfully" });
            }
            catch (UnauthorizedAccessException ex)
            {
                return Unauthorized(ex.Message);
            }
            catch (ArgumentException ex)
            {
                return BadRequest(ex.Message);
            }
            catch (KeyNotFoundException ex)
            {
                return NotFound(ex.Message);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"An error occurred: {ex.Message}");
            }
        }

        [HttpGet("profile-picture")]
        [Authorize]
        public async Task<IActionResult> GetProfilePicture()
        {
            try
            {
                var userId = await _authService.GetAuthenticatedUserId();
                var user = await _userService.GetProfilePictureAsync(userId);
                return Ok(new { ProfilePictureUrl = user.ProfilePictureUrl });
            }
            catch (KeyNotFoundException ex)
            {
                return NotFound(ex.Message);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }

        [HttpDelete("DeleteUser")]
        [Authorize]
        public async Task<IActionResult> DeleteUser(int id)
        {
            try
            {
                await _moderatorService.DeleteUserAsync(id);
                return Ok(new { Message = "User deleted successfully" });
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }

        [HttpPost("UpdateProfilePicture")]
        [Authorize]
        public async Task<IActionResult> UploadProfilePicture([FromForm] ProfilePictureDto dto)
        {
            try
            {
                var userId = await _authService.GetAuthenticatedUserId();
                var result = await _userService.UploadProfilePictureAsync(dto.ProfilePicture, userId);

                return Ok(new
                {
                    Message = "Profile picture updated successfully",
                    Url = result
                });
            }
            catch (ArgumentException ex)
            {
                return BadRequest(ex.Message);
            }
            catch (KeyNotFoundException ex)
            {
                return NotFound(ex.Message);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }

        [HttpPost("change-password")]
        [Authorize]
        public async Task<IActionResult> ChangePassword([FromBody] ChangePasswordDto dto)
        {
            try
            {
                var userId = await _authService.GetAuthenticatedUserId();
                await _userService.ChangePasswordAsync(userId, dto);
                return Ok(new { Message = "Password changed successfully" });
            }
            catch (UnauthorizedAccessException ex)
            {
                return Unauthorized(ex.Message);
            }
            catch (ArgumentException ex)
            {
                return BadRequest(ex.Message);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { Error = "Password change failed", ex.Message });
            }
        }

        [HttpGet("GetApprovedPosts")]
        [Authorize]
        public async Task<IActionResult> GetApprovedPosts()
        {
            try
            {
                var userId = await _authService.GetAuthenticatedUserId();
                var posts = await _userService.GetApprovedPostsAsync(userId);
                return Ok(posts);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }

        [HttpGet("GetPendingPosts")]
        [Authorize]
        public async Task<IActionResult> GetPendingPosts()
        {
            try
            {
                var userId = await _authService.GetAuthenticatedUserId();
                var posts = await _userService.GetPendingPostsAsync(userId);
                return Ok(posts);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }

        [HttpPost("UpdateUserBio")]
        [Authorize]
        public async Task<IActionResult> UpdateUserBio([FromBody] string newBio)
        {
            try
            {
                var userId = await _authService.GetAuthenticatedUserId();
                var user = await _userService.UpdateUserBio(userId, newBio);
                if (user == null)
                {
                    return NotFound("User not found");
                }
                return Ok(new { Message = "User bio updated successfully" });
            }
            catch (UnauthorizedAccessException ex)
            {
                return Unauthorized(ex.Message);
            }
            catch (ArgumentException ex)
            {
                return BadRequest(ex.Message);
            }
            catch (KeyNotFoundException ex)
            {
                return NotFound(ex.Message);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"An error occurred: {ex.Message}");
            }
        }

        [HttpDelete("DeleteMyPost/{postId}")]
        [Authorize]
        public async Task<IActionResult> DeleteMyPost(int postId)
        {
            try
            {
                var userId = await _authService.GetAuthenticatedUserId();
                await _userService.DeleteUserPostAsync(postId, userId);
                return Ok(new { Message = "Post deleted successfully" });
            }
            catch (KeyNotFoundException ex)
            {
                return NotFound(ex.Message);
            }
            catch (UnauthorizedAccessException ex)
            {
                return Forbid(ex.Message);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { Error = "Failed to delete post", ex.Message });
            }
        }
    }
}