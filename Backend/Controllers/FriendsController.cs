using Memzy_finalist.Models;
using Microsoft.AspNetCore.Mvc;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authorization;
using Memzy_finalist.Services;

namespace MyApiProject.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class FriendsController : ControllerBase
    {
        private readonly IFriendsService _friendsService;
        private readonly IAuthenticationService _authService;

        public FriendsController(IFriendsService friendsService, IAuthenticationService authService)
        {
            _friendsService = friendsService;
            _authService = authService;
        }

        [HttpPost("SendRequest")]
        [Authorize]
        public async Task<IActionResult> SendFriendRequest([FromBody] FriendRequestDto requestDto)
        {
            try
            {
                var userId = await _authService.GetAuthenticatedUserId();
                
                if (requestDto == null)
                {
                    return BadRequest("Request body is required");
                }
                
                if (requestDto.ReceiverId == null)
                {
                    return BadRequest("Receiver ID is required");
                }
                
                var result = await _friendsService.SendFriendRequest(userId, requestDto.ReceiverId.Value, requestDto.Message ?? "");
                return Ok(result);
            }
            catch (ArgumentException ex)
            {
                return BadRequest(new { error = ex.Message });
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(new { error = ex.Message });
            }
            catch (Exception ex)
            {
                // Log the exception here with your logging framework
                return StatusCode(500, new { error = "An error occurred while processing your request", details = ex.Message });
            }
        }

        [HttpPost("acceptRequest")]
        [Authorize]
        public async Task<IActionResult> AcceptFriendRequest(int requestId)
        {
            var userId = await _authService.GetAuthenticatedUserId();
            var result = await _friendsService.AcceptFriendRequest(new FriendRequest { RequestId = requestId }, userId);
            return Ok(new { 
                Friendship = result,
                Message = "Friend request accepted. You can now message each other."
            });
        }

        [HttpPost("rejectrequest")]
        [Authorize]
        public async Task<IActionResult> RejectFriendRequest(int requestId)
        {
            var userId = await _authService.GetAuthenticatedUserId();
            var result = await _friendsService.RejectFriendRequest(new FriendRequest { RequestId = requestId }, userId);
            return Ok(result);
        }

        [HttpPost("cancelrequest")]
        [Authorize]
        public async Task<IActionResult> CancelFriendRequest(int requestId)
        {
            var userId = await _authService.GetAuthenticatedUserId();
            var result = await _friendsService.CancelFriendRequest(new FriendRequest { RequestId = requestId }, userId);
            return Ok(result);
        }

        [HttpGet("get-sent-requests")]
        [Authorize]
        public async Task<IActionResult> GetSentFriendRequests()
        {
            var userId = await _authService.GetAuthenticatedUserId();
            var result = await _friendsService.GetSentFriendRequests(userId);
            return Ok(result);
        }

        [HttpGet("get-received-requests")]
        [Authorize]
        public async Task<IActionResult> GetReceivedFriendRequests()
        {
            var userId = await _authService.GetAuthenticatedUserId();
            var result = await _friendsService.GetPendingFriendRequests(userId);
            return Ok(result);
        }

        [HttpGet("GetFriends")]
        [Authorize]
        public async Task<IActionResult> GetFriends([FromQuery] bool onlineOnly = false)
        {
            var userId = await _authService.GetAuthenticatedUserId();
            var result = await _friendsService.GetFriends(userId, onlineOnly);
            return Ok(result);
        }
        
        [HttpDelete("RemoveFriend")]
        [Authorize]
        public async Task<IActionResult> RemoveFriend(int friendId)
        {
            var userId = await _authService.GetAuthenticatedUserId();
            var result = await _friendsService.RemoveFriend(userId, friendId);
            return Ok(result);
        }

        [HttpPatch("toggle-messaging")]
        [Authorize]
        public async Task<IActionResult> ToggleCanMessage(int friendId)
        {
            var userId = await _authService.GetAuthenticatedUserId();
            var result = await _friendsService.ToggleCanMessage(userId, friendId);
            return Ok(new { CanMessage = result });
        }
    }
    public class FriendRequestDto
{
    public int RequestId { get; set; } 
    public int? ReceiverId { get; set; } 
    public string Message { get; set; }
}
}