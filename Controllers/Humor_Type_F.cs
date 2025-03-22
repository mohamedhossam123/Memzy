using Memzy_finalist.Models;
using Microsoft.AspNetCore.Mvc;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace MyApiProject.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class HumorTypeController : ControllerBase
    {
        private readonly MemzyContext _context;
        private static readonly List<string> types_of_humors = new List<string> { "Dark Humor", "Cringe in a funny way", "Dad Jokes" };

        public HumorTypeController(MemzyContext context)
        {
            _context = context;
        }

        [HttpPost("HumoreFirstTime")]
        public IActionResult HumoreFirstTime([FromForm] List<string> type)
        {
            List<string> types_oka = type.Where(t => types_of_humors.Contains(t)).ToList();

            if (types_oka.Count == 0)
            {
                return BadRequest("Wrong types entered");
            }

            return Ok(new { message = "Valid Types Selected", types = types_oka });
        }
    }
}