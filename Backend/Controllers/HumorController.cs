using Memzy_finalist.Models;
using Memzy_finalist.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System;
using System.Security.Claims;
using System.Threading.Tasks;

namespace MyApiProject.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class HumorController : ControllerBase
    {
        private readonly IHumorService _humorService;
        private readonly IAuthenticationService _authService;

        public HumorController(IHumorService humorService, IAuthenticationService authService)
        {
            _humorService = humorService;
            _authService = authService;
        }
        
        [HttpPost("AddHumor")]
        [Authorize]
        public async Task<IActionResult> AddHumor([FromBody] HumorPreferenceDto humorPreference)
        {
            try
            {
                var userId = await _authService.GetAuthenticatedUserId();
                var user = await _humorService.AddHumorAsync(userId, humorPreference.HumorType);
                if (user == null)
                {
                    return NotFound("User not found");
                }
                return Ok(new { Message = "Humor preference updated successfully", UserId = user.UserId });
            }
            catch (UnauthorizedAccessException ex)
            {
                return Unauthorized(ex.Message);
            }
            catch (ArgumentException ex)
            {
                return BadRequest(ex.Message);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"An error occurred: {ex.Message}");
            }
        }
        
        [HttpPut("ChangeHumor")]
        [Authorize]
        public async Task<IActionResult> ChangeHumor([FromBody] HumorPreferenceDto humorPreference)
        {
            try
            {
                var userId = await _authService.GetAuthenticatedUserId();
                var user = await _humorService.ChangeHumorAsync(userId, humorPreference.HumorType);
                if (user == null)
                {
                    return NotFound("User not found");
                }
                return Ok(new { Message = "Humor preference updated successfully", UserId = user.UserId });
            }
            catch (UnauthorizedAccessException ex)
            {
                return Unauthorized(ex.Message);
            }
            catch (ArgumentException ex)
            {
                return BadRequest(ex.Message);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"An error occurred: {ex.Message}");
            }
        }

        [HttpDelete("RemoveHumor")]
        [Authorize]
        public async Task<IActionResult> RemoveHumor()
        {
            try
            {
                var userId = await _authService.GetAuthenticatedUserId();
                await _humorService.RemoveHumorAsync(userId);
                return Ok(new { Message = "Humor preference removed successfully", UserId = userId });
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
                return StatusCode(500, $"An error occurred: {ex.Message}");
            }
        }
    }
    
    public class HumorPreferenceDto
    {
        public string HumorType { get; set; }
    }
}