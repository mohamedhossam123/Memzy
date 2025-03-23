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
    public class Log_Sign : ControllerBase
    {
        private readonly MemzyContext _context;
        private readonly IUserService _userService;
        public Log_Sign(MemzyContext context, IUserService userService)
        {
            _context = context;
            _userService = userService;
        }

                [HttpPost("Sign_up")]
        public async Task<IActionResult> Sign_Up([FromForm] string name, [FromForm] string email, [FromForm] string password)
        {
            var user = new User
        {
            Name = name,
            Email = email,
            PasswordHash = password,
            CreatedAt = DateTime.UtcNow,
            status_ = "normal" 
        };
        await _userService.CreateUserAsync(user);
        return Ok(new { Message = "User created successfully.", User = user });
        }
        [HttpPost("log_in")]
        public IActionResult Log_in( [FromForm] string email, [FromForm] string password)
    {
        if (email == null  || password == null)
        {
            return BadRequest("User data is required.");
        }
        var correction = _context.Users.Where(e => e.Email == email && e.PasswordHash==password).FirstOrDefault();
        if (correction != null)
        {
            return Ok("Login successful");
        }
        return Ok("Login Failed");
        
    }

}



}