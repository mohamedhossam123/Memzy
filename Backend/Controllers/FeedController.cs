using Microsoft.AspNetCore.Mvc;
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

        [HttpPost("GetFirst6BasedOnUser")]
[Authorize]
public async Task<IActionResult> FeedGeneratorBasedOnHumor([FromBody] PaginationRequest request)
{
    var userId = await _authService.GetAuthenticatedUserId();
    var result = await _feedService.FeedGeneratorBasedOnHumor(userId, request.Page, request.PageSize);
    return Ok(result);
}

[HttpPost("GetFirst6")]
public async Task<IActionResult> GetvideoAsyncEverythingGoes([FromBody] PaginationRequest request)
{
    var result = await _feedService.FeedGeneratorEverythingGoes(request.Page, request.PageSize); // ✅ correct
    return Ok(result);
}
    }
}