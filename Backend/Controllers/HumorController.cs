using Memzy_finalist.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using System;
using System.Collections.Generic;
using System.Security.Claims;
using System.Threading.Tasks;
namespace MyApiProject.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class HumorController : ControllerBase
    {
        private readonly IHumorService _HumorService;
        private readonly IAuthenticationService _AuthService;

        public HumorController(IHumorService humorservice, IAuthenticationService authService)
        {
            _HumorService = humorservice;
            _AuthService = authService;
            
        }
        
        [HttpPost("AddHumor")]
        [Authorize]
        public async Task<IActionResult> AddHumor([FromBody] HumorPreferencesDto humorPreferences)
        {
            try
            {
                var userId = await _AuthService.GetAuthenticatedUserId();
                var user = await _HumorService.AddHumorAsync(userId, humorPreferences.HumorTypes);
                return Ok(new { Message = "Humor preferences updated successfully", UserId = user.UserId });
            }
            catch (UnauthorizedAccessException ex)
            {
                return Unauthorized(ex.Message);
            }
            catch (ArgumentException ex)
            {
                return BadRequest(ex.Message);
            }
        }
        

        [HttpPut("ChangeHumor")]
        [Authorize]
        public async Task<IActionResult> ChangeHumor([FromBody] HumorPreferencesDto humorPreferences)
        {
            try
            {
                var userId = await _AuthService.GetAuthenticatedUserId();
                var user = await _HumorService.ChangeHumorAsync(userId, humorPreferences.HumorTypes);
                return Ok(new { Message = "Humor preferences updated successfully", UserId = user.UserId });
            }
            catch (UnauthorizedAccessException ex)
            {
                return Unauthorized(ex.Message);
            }
            catch (ArgumentException ex)
            {
                return BadRequest(ex.Message);
            }
        }
    public class HumorPreferencesDto
    {
        public List<string> HumorTypes { get; set; }
    }
}
}