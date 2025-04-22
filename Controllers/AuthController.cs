using Memzy_finalist.Models;
using Microsoft.AspNetCore.Mvc;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace MyApiProject.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AuthController : ControllerBase
    {
        private readonly IUserService _userService;

        public AuthController(IUserService userService)
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

        [HttpGet("user/{id}")]
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
    [Route("api/humor")]
    public class HumorController : ControllerBase
    {
        private readonly IUserService _userService;

        public HumorController(IUserService userService)
        {
            _userService = userService;
        }
        [HttpPut("preferences/{userId}")]
        public async Task<IActionResult> SetHumorPreferences(int userId, [FromBody] HumorPreferencesDto dto)
        {
            try
            {
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
        [HttpGet("types")]
        public IActionResult GetHumorTypes()
        {
            return Ok(new List<string> { "DarkHumor", "FriendlyHumor" });
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