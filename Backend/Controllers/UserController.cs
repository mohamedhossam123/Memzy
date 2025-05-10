using Memzy_finalist.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using System;
using System.Collections.Generic;
using System.Security.Claims;
using System.Threading.Tasks;

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
        

        public UserController(IUserService userService, IModeratorService moderatorService, IAuthenticationService authService, IWebHostEnvironment environment)
        {
            _userService = userService;
            _moderatorService = moderatorService;
            _authService = authService;
            _environment = environment;
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
public async Task<IActionResult> UploadProfilePicture([FromForm] profilePictureDto dto)
{
    try
    {
        var userId = await _authService.GetAuthenticatedUserId();
        var result = await _userService.UploadProfilePictureAsync(
            dto.ProfilePicture, 
            userId, 
            _environment.WebRootPath
        );

        return Ok(new { 
            Message = "Profile picture uploaded successfully",
            Path = result 
        });
    }
    catch (Exception ex)
    {
        return StatusCode(500, $"Internal server error: {ex.Message}");
    }
}

        

        [HttpPost("UpdatePassword")]
        [Authorize]
        public async Task<IActionResult> UpdateUserPassword([FromBody] string newPassword)
        {
            try
            {
                var userId = await _authService.GetAuthenticatedUserId();
                var user = await _userService.UpdateUserPassword(userId, newPassword);
                if (user == null)
                {
                    return NotFound("User not found");
                }
                return Ok(new { Message = "User password updated successfully" });
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
    }

    public class UserCreateDto
    {
        public string Name { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public string Password { get; set; } = string.Empty;
    }

    public class LoginDto
    {
        public string Email { get; set; } = string.Empty;
        public string Password { get; set; } = string.Empty;
    }
    public class profilePictureDto
    {
        public IFormFile ProfilePicture { get; set; } = null!;
    }

}