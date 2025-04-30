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
        var existingUser = await _authService.VerifyUserAsync(dto.Email, "anypassword");
        if (existingUser != null)
            return BadRequest("Email already registered");
        var createdUser = await _authService.CreateUserAsync(user);
        if (createdUser.UserId == 0) 
            return StatusCode(500, "Failed to create user");
        
        return CreatedAtAction(nameof(GetUser), new { id = createdUser.UserId }, createdUser);
    }
    catch (Exception ex)
    {
        Console.WriteLine($"SIGNUP ERROR: {ex}");
        return StatusCode(500, ex.Message);
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
        if (string.IsNullOrWhiteSpace(dto.Email))
            return BadRequest("Email is required");
        if (string.IsNullOrWhiteSpace(dto.Password))
            return BadRequest("Password is required");

        var user = await _authService.VerifyUserAsync(dto.Email, dto.Password);
        if (user == null)
            return Unauthorized("Invalid credentials");

        var token = _authService.GenerateJwtToken(user);
        return Ok(new { Token = token });
    }
    catch (Exception ex)
    {
        return BadRequest(ex.Message);
    }
}

}


}