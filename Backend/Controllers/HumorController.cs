using Memzy_finalist.Models;
using Memzy_finalist.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace Memzy_finalist.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class UserHumorController : ControllerBase
    {
        private readonly IHumorService _humorService;
        private readonly IAuthenticationService _authService;
        private readonly ILogger<UserHumorController> _logger;

        public UserHumorController(
            IHumorService humorService, 
            IAuthenticationService authService,
            ILogger<UserHumorController> logger)
        {
            _humorService = humorService;
            _authService = authService;
            _logger = logger;
        }

        [HttpGet("GetUserHumor")]
        [Authorize]
        public async Task<IActionResult> GetUserHumor()
        {
            try
            {
                var userId = await _authService.GetAuthenticatedUserId();
                var humorPreferences = await _humorService.GetUserHumorPreferencesAsync(userId);

                return Ok(new { 
                    UserId = userId,
                    HumorTypes = humorPreferences 
                });
            }
            catch (UnauthorizedAccessException ex)
            {
                return Unauthorized(ex.Message);
            }
            catch (KeyNotFoundException ex)
            {
                return NotFound(ex.Message);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error fetching user humor preferences");
                return StatusCode(500, "An error occurred while fetching humor preferences");
            }
        }

        [HttpGet("GetUserHumor/{userId}")]
        [Authorize]
        public async Task<IActionResult> GetUserHumorById()
        {
            try
            {
                var userid = await _authService.GetAuthenticatedUserId();
                var humorPreferences = await _humorService.GetUserHumorPreferencesAsync(userid);

                return Ok(new { 
                    userid = userid,
                    HumorTypes = humorPreferences 
                });
            }
            catch (KeyNotFoundException ex)
            {
                return NotFound(ex.Message);
            }
            catch (Exception )
            {
                return StatusCode(500, "An error occurred while fetching humor preferences");
            }
        }
    }
}