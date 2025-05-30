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
                var user = await _context.Users.FindAsync(userId);

                if (user == null || string.IsNullOrEmpty(user.ProfilePictureUrl))
                {
                    return NotFound("Profile picture not found");
                }
                return Ok(new { ProfilePictureUrl = user.ProfilePictureUrl });
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
                var user = await _authService.GetUserByIdAsync(userId);

                if (user == null)
                    return Unauthorized("User not found");
                if (!BCrypt.Net.BCrypt.Verify(dto.CurrentPassword, user.PasswordHash))
                    return BadRequest("Current password is incorrect");

                if (string.IsNullOrWhiteSpace(dto.NewPassword) || dto.NewPassword.Length < 6)
                    return BadRequest("New password must be at least 6 characters");
                user.PasswordHash = _authService.HashPassword(dto.NewPassword);
                await _context.SaveChangesAsync();

                return Ok(new { Message = "Password changed successfully" });
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

                var posts = await _context.Posts
                    .Where(p => p.UserId == userId && p.IsApproved)
                    .Select(p => new PostUserDto
                    {
                        PostId = p.PostId,
                        Description = p.Description,
                        FilePath = p.FilePath,
                        ContentType = p.ContentType,
                        IsApproved = p.IsApproved,
                        CreatedAt = p.CreatedAt,
                        HumorTypes = p.PostHumors
                            .Select(ph => ph.HumorType.HumorTypeName)
                            .ToList()
                    })
                    .ToListAsync();

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

                var posts = await _context.Posts
                    .Where(p => p.UserId == userId && !p.IsApproved)
                    .Select(p => new PostUserDto
                    {
                        PostId = p.PostId,
                        Description = p.Description,
                        FilePath = p.FilePath,
                        ContentType = p.ContentType,
                        IsApproved = p.IsApproved,
                        CreatedAt = p.CreatedAt,
                        HumorTypes = p.PostHumors
                            .Select(ph => ph.HumorType.HumorTypeName)
                            .ToList()
                    })
                    .ToListAsync();

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

        var post = await _context.Posts.FindAsync(postId);

        if (post == null)
            return NotFound("Post not found");

        if (post.UserId != userId)
            return Forbid("You are not allowed to delete this post");

        _context.Posts.Remove(post);
        await _context.SaveChangesAsync();

        return Ok(new { Message = "Post deleted successfully" });
    }
    catch (Exception ex)
    {
        return StatusCode(500, new { Error = "Failed to delete post", ex.Message });
    }
}
    }
}