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

        public UserController(IUserService userService, IModeratorService moderatorService, IAuthenticationService authService)
        {
            _authService = authService;
            _userService = userService;
            _moderatorService = moderatorService;
        }
        
        [HttpDelete("DeleteUser")]
        [Authorize(Roles = "Moderator")] 
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

        [HttpPut("UpdateName")]
        [Authorize]
        public async Task<IActionResult> UpdateUserName([FromBody] string newName)
        {
            try
            {
                var userId = await _authService.GetAuthenticatedUserId();
                var user = await _userService.UpdateUsernameAsync(userId, newName);
                
                return Ok(new { 
                    Message = "User name updated successfully",
                    UserId = user.UserId,
                    NewName = user.Name
                });
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


}