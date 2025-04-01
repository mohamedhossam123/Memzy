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
        public async Task<IActionResult> CreatePostingImage([FromForm] string imageurl, [FromForm] List<string> humor , [FromForm] string description)
        {
            if (imageurl == null || description == null || humor == null)
            {
                return BadRequest("All fields are required");
            }
            await _PostingService.PostImageAsync(imageurl,humor,description);
            return Ok("Post created successfully");
    }
    public async Task<IActionResult> CreatePostVideo([FromForm]string VideoUrl, [FromForm] List<string> humor ,[FromForm]string descreption)
    {
        if (VideoUrl == null || descreption == null || humor == null)
        {
            return BadRequest("All fields are required");
        }
        await _PostingService.PostVideoAsync(VideoUrl,humor,descreption);
        return Ok("Post created successfully");
    }
}
}