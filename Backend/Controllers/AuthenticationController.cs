using Memzy_finalist.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using System;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using Microsoft.IdentityModel.Tokens;
using System.Collections.Generic;
using System.Threading.Tasks;
namespace MyApiProject.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AuthController : ControllerBase
    {
        private readonly IAuthenticationService _authService;

        public AuthController(IAuthenticationService AuthService)
        {
            _authService = AuthService;
        }

[HttpPost("signup")]
public async Task<IActionResult> SignUp([FromBody] UserCreateDto dto)
{
    try
    {
        if (string.IsNullOrWhiteSpace(dto.Email) )
            return BadRequest("Email is required");
        if (string.IsNullOrWhiteSpace(dto.Password))
            return BadRequest("Password is required");
        
        var existingUser = await _authService.VerifyUserAsync(dto.Email, "anypassword");
        if (existingUser != null)
            return BadRequest("Email already registered");
        
        var user = new User
        {
            Name = dto.Name,
            Email = dto.Email,
            PasswordHash = _authService.HashPassword(dto.Password),
            CreatedAt = DateTime.UtcNow
        };

        var createdUser = await _authService.CreateUserAsync(user);
        if (createdUser.UserId == 0) 
            return StatusCode(500, "Failed to create user");
        
        return CreatedAtAction(nameof(GetUser), new { id = createdUser.UserId }, new {
            UserId = createdUser.UserId,
            Name = createdUser.Name,
            Email = createdUser.Email
        });
    }
    catch (Exception )
    {
        return StatusCode(500, "Registration failed");
    }
}

        [HttpGet("GetUserByID")]
        public async Task<IActionResult> GetUser(int id)
        {
            var user = await _authService.GetUserByIdAsync(id);
            return user != null ? Ok(user) : NotFound();
        }


        [HttpPost("login")]
public async Task<IActionResult> Login([FromBody] LoginDto dto)
{
    try
    {
        if (string.IsNullOrWhiteSpace(dto.Email) || string.IsNullOrWhiteSpace(dto.Password))
            return BadRequest("Email and password are required");

        var user = await _authService.VerifyUserAsync(dto.Email, dto.Password);
        if (user == null)
            return Unauthorized("Invalid credentials");

        var token = await _authService.GenerateJwtToken(user);
        
        return Ok(new {
            Token = token,
            User = new {
                UserId = user.UserId,
                Name = user.Name,
                Email = user.Email,
                ProfilePictureUrl = user.ProfilePictureUrl,
                Bio = user.Bio,
            }
        });
    }
    catch (Exception )
    {
        return StatusCode(500, "An error occurred during login");
    }
}
[HttpGet("validate")]
        [Authorize] 
        public async Task<IActionResult> ValidateToken()
        {
            try
            {
                int userId = await _authService.GetAuthenticatedUserId();
                var user = await _authService.GetUserByIdAsync(userId);
                
                if (user == null)
                {
                    return Unauthorized("Invalid user");
                }

                return Ok(new {
                    UserId = user.UserId,
                    Name = user.Name,
                    Email = user.Email,
                    ProfilePictureUrl = user.ProfilePictureUrl,
                    Bio = user.Bio,
                });
            }
            catch (UnauthorizedAccessException)
            {
                return Unauthorized("Invalid token");
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Token validation error: {ex.Message}");
            }
}
        [HttpPost("logout")]
        [Authorize]
        public IActionResult Logout()
        {
            return Ok("Logged out successfully");
        }

        [HttpGet("refresh")]
        [Authorize]
        public async Task<IActionResult> RefreshToken()
        {
            try
            {
                var userId = await _authService.GetAuthenticatedUserId();
                var user = await _authService.GetUserByIdAsync(userId);
                
                if (user == null)
                {
                    return Unauthorized("Invalid user");
                }
                var token = await _authService.GenerateJwtToken(user);
                
                return Ok(new { Token = token });
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Token refresh error: {ex.Message}");
            }
        }
        [HttpGet("getCurrentUser")]
[Authorize]
public async Task<IActionResult> GetCurrentUser()
{
    try
    {
        var userId = await _authService.GetAuthenticatedUserId();
        var user = await _authService.GetUserByIdAsync(userId);
        
        if (user == null)
        {
            return Unauthorized("Invalid user");
        }
        var humorTypes = user.UserHumorTypes.Select(uht => uht.HumorType).ToList();
        
        var friendCount = await _authService.GetFriendCountAsync(userId);
        var postCount = await _authService.GetPostCountAsync(userId);


        return Ok(new {
            UserId = user.UserId,
            Name = user.Name,
            Email = user.Email,
            ProfilePictureUrl = user.ProfilePictureUrl,
            Bio = user.Bio,
            HumorTypes = humorTypes.Select(ht => new {
                HumorTypeId = ht.HumorTypeId,
                HumorTypeName = ht.HumorTypeName
            }).ToList(),
            CreatedAt = user.CreatedAt,
            FriendCount = friendCount,
            PostCount = postCount
        });
    }
    catch (Exception ex)
    {
        return StatusCode(500, $"Error retrieving current user: {ex.Message}");
    }
}

        }
    
}