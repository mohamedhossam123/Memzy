using Memzy_finalist.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System;
using System.Linq;
using System.Threading.Tasks;

namespace MyApiProject.Controllers
{
    [ApiController]
    [Route("api/[controller]")] 
    public class AuthController : ControllerBase
    {
        private readonly MemzyContext _context;
        private readonly IUserService _userService;
        public AuthController(MemzyContext context, IUserService userService)
        {
            _context = context;
            _userService = userService;
        }

        [HttpPost("Sign_up")]
        public async Task<IActionResult> Sign_Up([FromForm] string name, [FromForm] string email, [FromForm] string password)
        {
            if (email == null || password == null)
                return BadRequest("Email and Password are required");
            if (_context.Users.Any(u => u.Email == email))
                return Conflict("Email already exists");
            var user = new User
            {
                Name = name,
                Email = email,
                PasswordHash = password,
                CreatedAt = DateTime.Now
            };
            await _userService.CreateUserAsync(user);
            return Ok(new { Message = "User created successfully.", User = user });
        }
        [HttpPost("log_in")]
        public async Task<IActionResult> Log_in( [FromForm] string email, [FromForm] string password)
    {
        if (email == null  || password == null)
            return BadRequest("Email and Password are required");
        var user = await _userService.VerifyUserAsync(email, password);
        if (user!= null)
            return Ok("Login successful");
        return Ok("Login Failed");
        
    }
}
}