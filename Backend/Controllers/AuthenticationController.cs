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

                var createdUser = await _authService.CreateUserAsync(user);
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

                return Ok("Login successful");
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }




}
}