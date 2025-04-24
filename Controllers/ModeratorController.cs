using Memzy_finalist.Models;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace MyApiProject.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class ModeratorController : ControllerBase
    {
        private readonly IModeratorService _moderatorService;

        public ModeratorController(IModeratorService moderatorService)
        {
            _moderatorService = moderatorService;
        }

        [HttpPost("approveImage/{imageId}")]
        public async Task<IActionResult> ApproveImage(int imageId,int moderatorId)
        {
            var result = await _moderatorService.ApproveimageAsync(imageId,moderatorId);
            return Ok(result);
        }

        [HttpPost("approveVideo/{videoId}")]
        public async Task<IActionResult> ApproveVideo(int videoId,int moderatorId)
        {
            var result = await _moderatorService.ApproveVideoAsync(videoId,moderatorId);
            return Ok(result);
        }
        [HttpPost("rejectImage/{imageId}")]
        public async Task<IActionResult> RejectImage(int imageId,   int moderatorId)
        {
            var result = await _moderatorService.RejectimageAsync(imageId,moderatorId);
            return Ok(result);
        }
        [HttpPost("rejectVideo/{videoId}")]
        public async Task<IActionResult> RejectVideo(int videoId,int moderatorId)
        {
            var result = await _moderatorService.RejectvideoAsync(videoId,moderatorId);
            return Ok(result);
        }
        [HttpGet("pendingImages")]
        public async Task<IActionResult> GetPendingImages()
        {
            var result = await _moderatorService.GetPendingImagesAsync();
            return Ok(result);
        }
        [HttpGet("pendingVideos")]
        public async Task<IActionResult> GetPendingVideos()
        {
            var result = await _moderatorService.GetPendingVideosAsync();
            return Ok(result);
        }
    }
    }