using Memzy_finalist.Models;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace MyApiProject.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class PostingController : ControllerBase
    {
        private readonly IPostingService _postingService;

        public PostingController(IPostingService postingService)
        {
            _postingService = postingService;
        }

        [HttpPost("image")]
        public async Task<IActionResult> CreatePostingImage([FromForm] Image image)
        {
            if (image.ImageFile == null || image.ImageFile.Length == 0)
                return BadRequest("Image file is required");

            var result = await _postingService.PostImageAsync(
                image.ImageFile, 
                image.Humor, 
                image.Description, 
                image.UserId);

            return Ok(new
            {
                ImageId = result.ImageId,
                FilePath = result.FilePath,
                Message = "Image posted successfully"
            });
        }

        [HttpPost("video")]
        public async Task<IActionResult> CreatePostVideo([FromForm] Video video)
        {
            if (video.VideoFile == null || video.VideoFile.Length == 0)
                return BadRequest("Video file is required");

            var result = await _postingService.PostVideoAsync(
                video.VideoFile, 
                video.Humor, 
                video.Description, 
                video.UserId);

            return Ok(new
            {
                VideoId = result.VideoId,
                FilePath = result.FilePath,
                Message = "Video posted successfully"
            });
        }
    }
}