using Memzy_finalist.Models;
using Microsoft.AspNetCore.Mvc;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authorization;

namespace MyApiProject.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class PostsController : ControllerBase
    {
        private readonly IAuthenticationService _authService;
        private readonly IFeedService _feedService;

        public PostsController(IFeedService feedService, IAuthenticationService authService)
        {
            _authService = authService;
            _feedService = feedService;
            }

        [HttpPost("GetFirst3postsOfImagesAndVideosBasedOnHumor")]
        [Authorize]
        public async Task<IActionResult> FeedGeneratorBasedOnHumor()
        {
            var userId =  await _authService.GetAuthenticatedUserId();
            var result = await _feedService.FeedGeneratorBasedOnHumor(userId);
            return Ok(result);
        }
        [HttpPost("GetFirst3postsOfImagesAndVideosEverythingGoes")]
        public async Task<IActionResult> GetvideoAsyncEverythingGoes()
        {
            var result = await _feedService.FeedGeneratorEverythingGoes();
            return Ok(result);
        }
    }
}