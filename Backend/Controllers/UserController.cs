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

        public UserController(IUserService userService)
        {
            _userService = userService;
        }

        [HttpPost("signup")]
public async Task<IActionResult> SignUp([FromBody] UserCreateDto dto)
{
    try
    {
        if (string.IsNullOrWhiteSpace(dto.Email)) 
            return BadRequest("Email is required");
        if (string.IsNullOrWhiteSpace(dto.Password))
            return BadRequest("Password is required");
        
        var user = new User
        {
            Name = dto.Name,
            Email = dto.Email,
            PasswordHash = dto.Password,
            CreatedAt = DateTime.UtcNow
        };

        var createdUser = await _userService.CreateUserAsync(user);
        return CreatedAtAction(nameof(GetUser), new { id = createdUser.UserId }, createdUser);
    }
    catch (Exception ex)
    {
        return BadRequest(ex.Message);
    }
}
        [HttpGet("GetUserByID")]
        public async Task<IActionResult> GetUser(int id)
        {
            var user = await _userService.GetUserByIdAsync(id);
            return user != null ? Ok(user) : NotFound();
        }

        [HttpPost("login")]
        public async Task<IActionResult> Login([FromBody] LoginDto dto)
        {
            try
            {
                var user = await _userService.VerifyUserAsync(dto.Email, dto.Password);
                return user != null 
                    ? Ok(new { Message = "Login successful", UserId = user.UserId })
                    : Unauthorized("Invalid credentials");
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }
    }

    [ApiController]
    [Route("api/[controller]")]
    public class HumorController : ControllerBase
    {
        private readonly IUserService _userService;
        private readonly IModeratorService _moderatorService;

        public HumorController(IUserService userService, IModeratorService moderatorService)
        {
            _userService = userService;
            _moderatorService = moderatorService;
        }

        private int GetAuthenticatedUserId()
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier);
            if (userIdClaim == null || !int.TryParse(userIdClaim.Value, out var userId))
            {
                throw new UnauthorizedAccessException("Invalid user identifier");
            }
            return userId;
        }

        [HttpPut("ChangeHumorPreferences")]
        [Authorize]
        public async Task<IActionResult> ChangeHumorPreferences([FromBody] HumorPreferencesDto dto)
        {
            try
            {
                var userId = GetAuthenticatedUserId();
                var user = await _userService.ChangeHumorAsync(userId, dto.HumorTypes);
                return Ok(new 
                { 
                    Message = "Humor preferences updated",
                    UserId = userId,
                    Preferences = dto.HumorTypes
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
            catch (Exception ex)
            {
                return StatusCode(500, ex.Message);
            }
        }

        [HttpPost("AddHumorType")]
        [Authorize]
        public async Task<IActionResult> AddHumorType(List<string> humorType)
        {
            try
            {
                var userId = GetAuthenticatedUserId();
                var result = await _userService.AddHumorAsync(userId, humorType);
                return Ok(new { Message = "Humor type added", HumorType = result });
            }
            catch (UnauthorizedAccessException ex)
            {
                return Unauthorized(ex.Message);
            }
            catch (Exception ex)
            {
                return StatusCode(500, ex.Message);
            }
        }

        

        // [HttpGet("GetHumorType")]
        // [Authorize]
        // public async Task<IActionResult> GetHumorType(string humorType)
        // {
        //     try
        //     {
        //         if (string.IsNullOrWhiteSpace(humorType))
        //             return BadRequest("Humor type cannot be empty");
                
        //         var userId = GetAuthenticatedUserId();
        //         var result = await _userService.Get(userId, humorType);
        //         return Ok(new { Message = "Humor type retrieved", HumorType = result });
        //     }
        //     catch (UnauthorizedAccessException ex)
        //     {
        //         return Unauthorized(ex.Message);
        //     }
        //     catch (Exception ex)
        //     {
        //         return StatusCode(500, ex.Message);
        //     }
        // }

        [HttpGet("GetAllHumorTypes")]
        public IActionResult GetAllHumorTypes()
        {
            var humorTypes = new List<string> { "DarkHumor", "FriendlyHumor" };
            return Ok(humorTypes);
        }

        [HttpDelete("DeleteUser")]
        [Authorize(Roles = "Moderator")] // Restrict to moderators only
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
                var userId = GetAuthenticatedUserId();
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
                var userId = GetAuthenticatedUserId();
                await _userService.UpdateUserPassword(userId, newPassword);
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
                var userId = GetAuthenticatedUserId();
                await _userService.UpdateUserBio(userId, newBio);
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
        public string Name { get; set; }
        public string Email { get; set; }
        public string Password { get; set; }
    }

    public class LoginDto
    {
        public string Email { get; set; }
        public string Password { get; set; }
    }

    public class HumorPreferencesDto
    {
        public List<string> HumorTypes { get; set; }
    }
}