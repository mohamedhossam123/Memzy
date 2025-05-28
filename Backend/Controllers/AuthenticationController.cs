using Memzy_finalist.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace MyApiProject.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AuthController : ControllerBase
    {
        private readonly IAuthenticationService _authService;

        public AuthController(IAuthenticationService authService)
        {
            _authService = authService;
        }

        [HttpPost("signup")]
        public async Task<IActionResult> SignUp([FromBody] UserCreateDto dto)
        {
            if (string.IsNullOrWhiteSpace(dto.Email) ||
                string.IsNullOrWhiteSpace(dto.Password) ||
                string.IsNullOrWhiteSpace(dto.UserName))
            {
                return BadRequest("Email, password, and username are required.");
            }

            var result = await _authService.SignUpUserAsync(dto);
            if (!result.Success)
                return BadRequest(result.Message);

            return CreatedAtAction(nameof(GetUser), new { id = result.User.UserId }, new
            {
                result.User.UserId,
                result.User.Name,
                result.User.Email,
                Username = result.User.UserName
            });
        }

        [HttpGet("GetUserByID")]
        public async Task<IActionResult> GetUser(int id)
        {
            var userDto = await _authService.GetUserDtoByIdAsync(id);
            return userDto != null ? Ok(userDto) : NotFound();
        }

        [HttpPost("login")]
        [AllowAnonymous]
        public async Task<IActionResult> Login([FromBody] LoginDto dto)
        {
            if (string.IsNullOrWhiteSpace(dto.Email) || string.IsNullOrWhiteSpace(dto.Password))
                return BadRequest(new { message = "Email and password are required." });

            var result = await _authService.LoginAsync(dto);
            if (!result.Success)
                return Unauthorized(new { message = result.Message });

            return Ok(new
            {
                token = result.Token,
                user = result.User
            });
        }



        [HttpGet("validate")]
        [Authorize]
        public async Task<IActionResult> ValidateToken()
        {
            var result = await _authService.ValidateTokenAsync();
            if (!result.Success)
                return Unauthorized(new { message = result.Message });

            return Ok(result.Data);
        }
        [HttpGet("refresh")]
        [Authorize]
        public async Task<IActionResult> RefreshToken()
        {
            var result = await _authService.RefreshTokenAsync();
            return result.Success ? Ok(new { token = result.Token }) : StatusCode(500, new { message = result.Message });
        }

        [HttpGet("getCurrentUser")]
        [Authorize]
        public async Task<IActionResult> GetCurrentUser()
        {
            var result = await _authService.GetCurrentUserInfoAsync();
            return result.Success ? Ok(result.Data) : StatusCode(500, new { message = result.Message });
        }

        [HttpGet("friend-post-count")]
        [Authorize]
        public async Task<IActionResult> GetFriendCountAndPostCount()
        {
            var result = await _authService.GetFriendAndPostCountAsync();
            return result.Success ? Ok(result.Data) : StatusCode(500, new { message = result.Message });
        }
    }
}