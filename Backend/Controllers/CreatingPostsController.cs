using Memzy_finalist.Models;
using Microsoft.AspNetCore.Authorization;
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
        private readonly IAuthenticationService _authService;

        public PostingController(ICreatingPostsService postingService, IAuthenticationService authService)
        {
            _authService = authService;
            _postingService = postingService;
        }

        [HttpPost("image")]
        [Authorize]
        public async Task<IActionResult> CreatePostingImage([FromForm] ImageUploadDto dto)
        {
            try
            {
                var userid = await _authService.GetAuthenticatedUserId();
                if (dto.ImageFile == null || dto.ImageFile.Length == 0)
                    return BadRequest("Image file is required");
                    
                var result = await _postingService.PostImageAsync(
                    dto.ImageFile, 
                    dto.HumorTypeIds ?? new List<int>(),
                    dto.Description ?? string.Empty, 
                    userid);

                return Ok(new
                {
                    ImageId = result.ImageId,
                    FilePath = result.FilePath,
                    Message = "Image posted successfully,Waiting for admin approval"
                });
            }
            catch (UnauthorizedAccessException ex)
            {
                return Unauthorized(ex.Message);
            }
            catch (ArgumentException ex)
            {
                return BadRequest(ex.Message);
            }
            catch (KeyNotFoundException ex)
            {
                return NotFound(ex.Message);
            }
            catch (System.Exception ex)
            {
                return StatusCode(500, $"An error occurred: {ex.Message}");
            }
        }

        [HttpPost("video")]
        [Authorize]
        public async Task<IActionResult> CreatePostVideo([FromForm] VideoUploadDto dto)
        {
            try
            {
                var UserId = await _authService.GetAuthenticatedUserId();
                if (dto.VideoFile == null || dto.VideoFile.Length == 0)
                    return BadRequest("Video file is required");

                var result = await _postingService.PostVideoAsync(
                    dto.VideoFile, 
                    dto.HumorTypeIds ?? new List<int>(),
                    dto.Description ?? string.Empty, 
                    UserId);

                return Ok(new
                {
                    VideoId = result.VideoId,
                    FilePath = result.FilePath,
                    Message = "Video posted successfully,Waiting for admin approval"
                });
            }
            catch (UnauthorizedAccessException ex)
            {
                return Unauthorized(ex.Message);
            }
            catch (ArgumentException ex)
            {
                return BadRequest(ex.Message);
            }
            catch (KeyNotFoundException ex)
            {
                return NotFound(ex.Message);
            }
            catch (System.Exception ex)
            {
                return StatusCode(500, $"An error occurred: {ex.Message}");
            }
        }
    }

    public class ImageUploadDto
    {
        public IFormFile ImageFile { get; set; } = null!;
        public string Description { get; set; }
        public List<int> HumorTypeIds { get; set; }
    }

    public class VideoUploadDto
    {
        public IFormFile VideoFile { get; set; } = null!;
        public string Description { get; set; }
        public List<int> HumorTypeIds { get; set; }
    }
}