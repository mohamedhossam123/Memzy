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

        // Get all available humor types (for dropdown/selection)
        [HttpGet("GetAllHumorTypes")]
        public async Task<IActionResult> GetAllHumorTypes()
        {
            try
            {
                var allHumorTypes = await _humorService.GetAllHumorTypesAsync();
                return Ok(new { 
                    humorTypes = allHumorTypes 
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error fetching all humor types");
                return StatusCode(500, "An error occurred while fetching humor types");
            }
        }

        // Get user's selected humor preferences
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
        [HttpPost("SetHumor")]
        [Authorize]
        public async Task<IActionResult> SetHumor([FromBody] SetHumorRequest request)
        {
            try
            {
                if (request?.HumorTypes == null || !request.HumorTypes.Any())
                {
                    return BadRequest("Humor types are required");
                }

                var userId = await _authService.GetAuthenticatedUserId();
                var updatedUser = await _humorService.SetHumorAsync(userId, request.HumorTypes);
                var updatedPreferences = await _humorService.GetUserHumorPreferencesAsync(userId);

                return Ok(new { 
                    Message = "Humor preferences updated successfully",
                    UserId = userId,
                    HumorTypes = updatedPreferences
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
            catch (ArgumentException ex)
            {
                return BadRequest(ex.Message);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error setting user humor preferences");
                return StatusCode(500, "An error occurred while setting humor preferences");
            }
        }
    }

}