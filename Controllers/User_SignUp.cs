using Memzy_finalist.Models;
using Microsoft.AspNetCore.Mvc;
using System.Threading.Tasks;
namespace MyApiProject.Controllers
{
    [ApiController]
    [Route("api/[controller]")] 
    public class User_SignUp : ControllerBase
    {
        private readonly MemzyContext _context;
        public User_SignUp(MemzyContext context)
    {
        _context = context;
    }
        [HttpPost("create")]
        public async Task<IActionResult> Create([FromForm] string name, [FromForm] string email, [FromForm] string password)
        {
            var user = new User { Name = name, Email = email, PasswordHash = password };
            _context.Users.Add(user);
            await _context.SaveChangesAsync();
            return Ok(new { message = "User registered successfully", user });
        }
    }
    
    
    
    
    }