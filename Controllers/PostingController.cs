using Memzy_finalist.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace MyApiProject.Controllers
{
    [ApiController]
    [Route("api/[controller]")] 
    public class PostingController : ControllerBase
    {
        private readonly MemzyContext _context;
        private readonly IPostingService _PostingService;
        public PostingController(MemzyContext context, IPostingService postingService)
        {
            _context = context;
            _PostingService = postingService;
        }
        [HttpPost]
        public async Task<IActionResult> CreatePosting([FromForm] string imageurl, [FromForm] string description, [FromForm] List<string> humor)
        {
            if (imageurl == null || description == null || humor == null)
            {
                return BadRequest("All fields are required");
            }
            return await _PostingService.PostImageAsync(imageurl,humor,description);
    }
}
}