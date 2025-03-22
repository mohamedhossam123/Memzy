using Memzy_finalist.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Query.SqlExpressions;
using Microsoft.Identity.Client;
using System;
using System.Linq;
using System.Threading.Tasks;

namespace MyApiProject.Controllers
{
    [ApiController]
    [Route("api/[controller]")] 
    public class User_Login : ControllerBase
    {
        private readonly MemzyContext _context;
        public User_Login(MemzyContext context)
        {
            _context = context;
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




