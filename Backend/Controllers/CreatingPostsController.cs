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
        private readonly ICreatingPostsService _postingService;

        public PostingController(ICreatingPostsService postingService)
        {
            _postingService = postingService;
        }

        [HttpPost("image")]
        public async Task<IActionResult> CreatePostingImage([FromForm] ImageUploadDto dto)
        {
            if (dto.ImageFile == null || dto.ImageFile.Length == 0)
                return BadRequest("Image file is required");
            var result = await _postingService.PostImageAsync(
                dto.ImageFile, 
                dto.HumorTypeIds,
                dto.Description, 
                dto.UserId);

            return Ok(new
            {
                ImageId = result.ImageId,
                FilePath = result.FilePath,
                Message = "Image posted successfully"
            });
        }

        [HttpPost("video")]
        public async Task<IActionResult> CreatePostVideo([FromForm] VideoUploadDto dto)
        {
            if (dto.VideoFile == null || dto.VideoFile.Length == 0)
                return BadRequest("Video file is required");

            var result = await _postingService.PostVideoAsync(
                dto.VideoFile, 
                dto.HumorTypeIds,
                dto.Description, 
                dto.UserId);

            return Ok(new
            {
                VideoId = result.VideoId,
                FilePath = result.FilePath,
                Message = "Video posted successfully"
            });
        }
    }


//For futrure refrence  DTOs means Data Transfer Objects 
// DTOs are objects that carry data between processes. They are often used to encapsulate data and send it from one subsystem of an application to another.
// DTOs are often used in web applications to transfer data between the client and server. They can help to reduce the amount of data that needs to be sent over the network, and they can also help to decouple different parts of an application.
// DTOs are typically simple objects that contain only data and no behavior. They are often used in conjunction with data access objects (DAOs) or repositories, which are responsible for retrieving and storing data in a database.

    public class ImageUploadDto
    {
        public IFormFile ImageFile { get; set; }
        public int UserId { get; set; }
        public string Description { get; set; }
        public List<int> HumorTypeIds { get; set; }
    }

    public class VideoUploadDto
    {
        public IFormFile VideoFile { get; set; }
        public int UserId { get; set; }
        public string Description { get; set; }
        public List<int> HumorTypeIds { get; set; }
    }
}