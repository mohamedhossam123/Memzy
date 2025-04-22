using Memzy_finalist.Models;
using Microsoft.AspNetCore.Mvc;
using System.Threading.Tasks;

namespace MyApiProject.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class PostsController : ControllerBase
    {
        private readonly IFeedService _feedService;

        public PostsController(IFeedService feedService)
        {
            _feedService = feedService;
        }

        [HttpPost("GetFirst3postsOfImagesAndVideosBasedOnHumor")]
        public async Task<IActionResult> FeedGeneratorBasedOnHumor([FromBody] int userId)
        {
            var result = await _feedService.FeedGeneratorBasedOnHumor(userId);
            return Ok(result);
        }
        [HttpPost("GetFirst3postsOfImagesAndVideosEverythingGoes")]
        public async Task<IActionResult> GetvideoAsyncEverythingGoes()
        {
            var result = await _feedService.GetvideoAsyncEverythingGoes();
            return Ok(result);
        }
    }
}