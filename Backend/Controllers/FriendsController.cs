using Memzy_finalist.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;

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

        [HttpGet("all-received-requests")]
        [Authorize]
        public async Task<IActionResult> GetAllReceivedRequests()
        {
            var userId = await _authService.GetAuthenticatedUserId();
            var result = await _friendsService.GetAllReceivedRequests(userId);
            return Ok(result);
        }

        [HttpGet("all-sent-requests")]
        [Authorize]
        public async Task<IActionResult> GetAllSentRequests()
        {
            var userId = await _authService.GetAuthenticatedUserId();
            var result = await _friendsService.GetAllSentRequests(userId);
            return Ok(result);
        }

        [HttpPost("SendRequest/{receiverId}")]
        [Authorize]
        public async Task<IActionResult> SendFriendRequest(int receiverId)
        {
            try
            {
                var userId = await _authService.GetAuthenticatedUserId();
                var result = await _friendsService.SendFriendRequest(userId, receiverId);
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
            catch (Exception)
            {
                return StatusCode(500, new { error = "An error occurred while processing your request" });
            }
        }

        [HttpPost("acceptRequest/{requestId}")]
        [Authorize]
        public async Task<IActionResult> AcceptFriendRequest(int requestId)
        {
            try
            {
                var userId = await _authService.GetAuthenticatedUserId();
                var result = await _friendsService.AcceptFriendRequest(requestId, userId);
                return Ok(new
                {
                    Friendship = result,
                    Message = "Friend request accepted successfully"
                });
            }
            catch (Exception ex)
            {
                return HandleException(ex);
            }
        }

        [HttpGet("GetFriendshipStatus/{userId}")]
        [Authorize]
        public async Task<IActionResult> GetFriendshipStatus(int userId)
        {
            var currentUserId = await _authService.GetAuthenticatedUserId();
            var result = await _friendsService.GetFriendshipStatus(currentUserId, userId);
            return Ok(result);
        }

        [HttpPost("rejectrequest/{requestId}")]
        [Authorize]
        public async Task<IActionResult> RejectFriendRequest(int requestId)
        {
            try
            {
                var userId = await _authService.GetAuthenticatedUserId();
                var result = await _friendsService.RejectFriendRequest(requestId, userId);
                return Ok(new
                {
                    Request = result,
                    Message = "Friend request rejected"
                });
            }
            catch (Exception ex)
            {
                return HandleException(ex);
            }
        }

        // FIXED: Updated cancel request endpoint
        [HttpPost("cancelrequest/{requestId}")]
        [Authorize]
        public async Task<IActionResult> CancelFriendRequest(int requestId)
        {
            try
            {
                var userId = await _authService.GetAuthenticatedUserId();
                var success = await _friendsService.CancelFriendRequest(requestId, userId);
                return Ok(new
                {
                    Success = success,
                    Message = "Friend request canceled and removed permanently"
                });
            }
            catch (ArgumentException ex)
            {
                return BadRequest(new { Error = ex.Message });
            }
            catch (InvalidOperationException ex)
            {
                return Conflict(new { Error = ex.Message });
            }
            catch (Exception)
            {
                return StatusCode(500, new { Error = "Internal server error" });
            }
        }

        // ADDED: New endpoint to cancel friend request by receiver ID (simpler approach)
        [HttpPost("cancelrequest-by-receiver/{receiverId}")]
        [Authorize]
        public async Task<IActionResult> CancelFriendRequestByReceiver(int receiverId)
        {
            try
            {
                var userId = await _authService.GetAuthenticatedUserId();
                var success = await _friendsService.CancelFriendRequestByReceiver(userId, receiverId);
                return Ok(new
                {
                    Success = success,
                    Message = "Friend request canceled successfully"
                });
            }
            catch (ArgumentException ex)
            {
                return BadRequest(new { Error = ex.Message });
            }
            catch (Exception)
            {
                return StatusCode(500, new { Error = "Internal server error" });
            }
        }

        private IActionResult HandleException(Exception ex)
        {
            return ex switch
            {
                ArgumentException => BadRequest(new { Error = ex.Message }),
                InvalidOperationException => Conflict(new { Error = ex.Message }),
                _ => StatusCode(500, new { Error = "Internal server error" })
            };
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
        public async Task<IActionResult> GetFriends()
        {
            try
            {
                var userId = await _authService.GetAuthenticatedUserId();
                var result = await _friendsService.GetFriends(userId);
                return Ok(result ?? new List<User>());
            }
            catch (ApplicationException ex)
            {
                return StatusCode(500, new
                {
                    Error = "Friends retrieval failed",
                    Details = ex.Message
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new
                {
                    Error = "Internal server error",
                    Details = ex.Message
                });
            }
        }

        [HttpDelete("RemoveFriend")]
        [Authorize]
        public async Task<IActionResult> RemoveFriend(int friendId)
        {
            var userId = await _authService.GetAuthenticatedUserId();
            var result = await _friendsService.RemoveFriend(userId, friendId);
            return Ok(result);
        }
        
    }
}