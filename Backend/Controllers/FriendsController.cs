using Memzy_finalist.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using Memzy_finalist.Models.DTOs;

namespace MyApiProject.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
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
        public async Task<IActionResult> GetAllReceivedRequests()
        {
            var userId = await _authService.GetAuthenticatedUserId();
            var result = await _friendsService.GetAllReceivedRequests(userId);
            return Ok(result);
        }

        [HttpGet("all-sent-requests")]
        public async Task<IActionResult> GetAllSentRequests()
        {
            var userId = await _authService.GetAuthenticatedUserId();
            var result = await _friendsService.GetAllSentRequests(userId);
            return Ok(result);
        }

        [HttpPost("SendRequest/{receiverId}")]
        public async Task<IActionResult> SendFriendRequest(int receiverId)
        {
            try
            {
                var userId = await _authService.GetAuthenticatedUserId();
                var result = await _friendsService.SendFriendRequest(userId, receiverId);
                var dto = new FriendRequestResponseDto
        {
            RequestId = result.RequestId,
            SenderId = result.SenderId,
            ReceiverId = result.ReceiverId,
            Status = result.Status.ToString(),
            CreatedAt = result.CreatedAt
        };

        return Ok(dto);
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

        public async Task<IActionResult> GetFriendshipStatus(int userId)
        {
            var currentUserId = await _authService.GetAuthenticatedUserId();
            var result = await _friendsService.GetFriendshipStatus(currentUserId, userId);
            return Ok(result);
        }

        [HttpPost("rejectrequest/{requestId}")]

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
        [HttpPost("cancelrequest/{requestId}")]

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


        [HttpPost("cancelrequest-by-receiver/{receiverId}")]

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
        [HttpGet("GetFriendsAnotherUser")]
        public async Task<IActionResult> GetFriendsAnotherUser(int userId)
        {

            try
            {
                var requests = await _friendsService.GetFriendsAnotherUser(userId);
                return Ok(requests);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new
                {
                    error = "An error occurred",
                    details = ex.Message
                });
            }
        }

        [HttpGet("GetFriendRequests")]
        public async Task<IActionResult> GetFriendRequests()
        {
            try
            {
                var userId = await _authService.GetAuthenticatedUserId();
                var requests = await _friendsService.GetPendingFriendRequests(userId);
                return Ok(requests);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new
                {
                    error = "An error occurred",
                    details = ex.Message
                });
            }
        }



        [HttpGet("GetFriends")]
        public async Task<IActionResult> GetFriends()
        {
            try
            {
                var userId = await _authService.GetAuthenticatedUserId();
                var friends = await _friendsService.GetFriends(userId);
                return Ok(friends ?? new List<FriendDTO2>());
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
        public async Task<IActionResult> RemoveFriend(int friendId)
        {
            var userId = await _authService.GetAuthenticatedUserId();
            var result = await _friendsService.RemoveFriend(userId, friendId);
            return Ok(result);
        }

    }
}