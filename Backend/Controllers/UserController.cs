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

        [HttpGet("GetUserID")]
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
    public class HumorController : ControllerBase
    {
        private readonly IUserService _userService;
        private readonly IModeratorService _moderatorService;

        public HumorController(IUserService userService, IModeratorService moderatorService)
        {
            _userService = userService;
            _moderatorService = moderatorService;
    }
        [HttpPut("ChangeHumorPreferences")]
        [Authorize]
        public async Task<IActionResult> ChangeHumorPreferences([FromBody] HumorPreferencesDto dto)
        {
            try
            {
                var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value);
                var user = await _userService.ChangeHumorAsync(userId, dto.HumorTypes);
                return Ok(new 
                { 
                    Message = "Humor preferences updated",
                    UserId = userId,
                    Preferences = dto.HumorTypes
                });
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
        // public async Task<IActionResult> SetHumorPreferences(int userId, [FromBody] HumorPreferencesDto dto)
        // {
        //     try
        //     {
        //         var user = await _userService.ChangeHumorAsync(userId, dto.HumorTypes);
        //         return Ok(new 
        //         { 
        //             Message = "Humor preferences updated",
        //             UserId = userId,
        //             Preferences = dto.HumorTypes
        //         });
        //     }
        //     catch (ArgumentException ex)
        //     {
        //         return BadRequest(ex.Message);
        //     }
        //     catch (Exception ex)
        //     {
        //         return StatusCode(500, ex.Message);
        //     }
        // }
        [HttpGet("AddHumorType")]
        [Authorize]
        public IActionResult AddHumorType(string humorType)
        {
            if (string.IsNullOrWhiteSpace(humorType))
                return BadRequest("Humor type cannot be empty");
            var h=AddHumorType(humorType);
            if (h == null)
                return NotFound("Humor type not found");
            return Ok(new { Message = "Humor type added", HumorType = humorType });
        }
        
        [HttpGet("RemoveHumorType")]
        [Authorize]
        public IActionResult RemoveHumorType(string humorType)
        {
            if (string.IsNullOrWhiteSpace(humorType))
                return BadRequest("Humor type cannot be empty");
            var h=RemoveHumorType(humorType);
            if (h == null)
                return NotFound("Humor type not found");
            return Ok(new { Message = "Humor type removed", HumorType = humorType });
        }
        [HttpGet("GetHumorType")]
        [Authorize]
        public IActionResult GetHumorType(string humorType)
        {
            if (string.IsNullOrWhiteSpace(humorType))
                return BadRequest("Humor type cannot be empty");
            var h=GetHumorType(humorType);
            if (h == null)
                return NotFound("Humor type not found");
            return Ok(new { Message = "Humor type retrieved", HumorType = humorType });
        }
        [HttpGet("GetAllHumorTypes")]
        public IActionResult GetAllHumorTypes()
        {
            var humorTypes = new List<string> { "DarkHumor", "FriendlyHumor" };
            return Ok(humorTypes);
        }
        [HttpDelete("DeleteUser")]
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
        var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value);
        
        var user = await _userService.UpdateUsernameAsync(userId, newName);
        
        return Ok(new { 
            Message = "User name updated successfully",
            UserId = user.UserId,
            NewName = user.Name
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
    catch (Exception )
    {
        return StatusCode(500, "An error occurred while updating the name");
    }
}
        [HttpPut("UpdatePassword")]
        [Authorize]
        public async Task<IActionResult> UpdateUserPassword([FromBody] string newPassword)
        {
            try
            {
                var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value);
                var user = await _userService.UpdateUserPassword(userId, newPassword);
                return Ok(new { Message = "User password updated successfully" });
            }
            catch (ArgumentException ex)
            {
                return BadRequest(ex.Message);
            }
            catch (KeyNotFoundException ex)
            {
                return NotFound(ex.Message);
            }
            catch (Exception )
            {
                return StatusCode(500, "An error occurred while updating the password");
            }
        }
        // [HttpPost("UpdateProfilePicture")]
        // [Authorize]
        // public async Task<IActionResult> UpdateProfilePicture([FromForm] IFormFile file)
        // {
        //     try
        //     {
        //         var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value);
        //         var user = await _userService.UpdateUserProfilePicture(userId, file);
        //         return Ok(new { Message = "Profile picture updated successfully" });
        //     }
        //     catch (ArgumentException ex)
        //     {
        //         return BadRequest(ex.Message);
        //     }
        //     catch (KeyNotFoundException ex)
        //     {
        //         return NotFound(ex.Message);
        //     }
        //     catch (Exception )
        //     {
        //         return StatusCode(500, "An error occurred while updating the profile picture");
        //     }
        // }
        [HttpPost("UpdateUserBio")]
        [Authorize]
        public async Task<IActionResult> UpdateUserBio([FromBody] string newBio)
        {
            try
            {
                var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value);
                var user = await _userService.UpdateUserBio(userId, newBio);
                return Ok(new { Message = "User bio updated successfully" });
            }
            catch (ArgumentException ex)
            {
                return BadRequest(ex.Message);
            }
            catch (KeyNotFoundException ex)
            {
                return NotFound(ex.Message);
            }
            catch (Exception )
            {
                return StatusCode(500, "An error occurred while updating the bio");
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