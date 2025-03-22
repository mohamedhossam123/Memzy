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
        public Log_Sign(MemzyContext context)
        {
            _context = context;
        }
        [HttpPost("Sign_up")]
        public async Task<IActionResult> Sign_Up([FromForm] string name, [FromForm] string email, [FromForm] string password)
        {
            if (string.IsNullOrEmpty(name) || string.IsNullOrEmpty(email) || string.IsNullOrEmpty(password))
            {
                return BadRequest(new { message = "Name, email, and password are required" });
            }
            var existingUser = await _context.Users.FirstOrDefaultAsync(u => u.Email == email);
                if (existingUser != null)
                {
                return Conflict(new { message = "Email already exists" }); 
                }
                var user = new User
                {
                    Name = name,
                    Email = email,
                    PasswordHash = password,
                    CreatedAt = DateTime.UtcNow, 
                    status_ = "normal" 
                };
                _context.Users.Add(user);
                await _context.SaveChangesAsync();

                return Ok(new { message = "User registered successfully", user });
            
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