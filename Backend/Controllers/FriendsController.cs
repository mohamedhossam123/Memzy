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

        [HttpPost("SendFriendRequest")]
        [Authorize]
        public async Task<IActionResult> SendFriendRequest([FromBody] FriendRequest friendRequest)
        {
            var userId = await _authService.GetAuthenticatedUserId();
            var result = await _friendsService.SendFriendRequest(friendRequest, userId);
            return Ok(result);
        }

        [HttpPost("AcceptFriendRequest")]
[Authorize]
public async Task<IActionResult> AcceptFriendRequest([FromBody] FriendRequest friendRequest)
{
    var userId = await _authService.GetAuthenticatedUserId();
    var result = await _friendsService.AcceptFriendRequest(friendRequest, userId);
    return Ok(new { 
        Friendship = result,
        Message = "Friend request accepted. You can now message each other."
    });
}
        [HttpPost("RejectFriendRequest")]
        [Authorize]
        public async Task<IActionResult> RejectFriendRequest([FromBody] FriendRequest friendRequest)
        {
            var userId = await _authService.GetAuthenticatedUserId();
            var result = await _friendsService.RejectFriendRequest(friendRequest, userId);
            return Ok(result);
        }

        [HttpPost("CancelFriendRequest")]
        [Authorize]
        public async Task<IActionResult> CancelFriendRequest([FromBody] FriendRequest friendRequest)
        {
            var userId = await _authService.GetAuthenticatedUserId();
            var result = await _friendsService.CancelFriendRequest(friendRequest, userId);
            return Ok(result);
        }
    

        [HttpPost("GetFriendRequests")]
        [Authorize]
        public async Task<IActionResult> GetFriendRequests()
        {
            var userId = await _authService.GetAuthenticatedUserId();
            var result = await _friendsService.GetSentFriendRequests(userId);
            return Ok(result);
        }

        [HttpPost("GetFriends")]
        [Authorize]
        public async Task<IActionResult> GetFriends()
        {
            var userId = await _authService.GetAuthenticatedUserId();
            var result = await _friendsService.GetFriends(userId);
            return Ok(result);
        }
        
        [HttpDelete("Unfriend")]
        [Authorize]
        public async Task<IActionResult> Unfriend([FromBody] int friendId)
        {
            var userId = await _authService.GetAuthenticatedUserId();
            var result = await _friendsService.RemoveFriend(userId, friendId);
            return Ok(result);
        }
        [HttpPost("GetFriendRequestsReceived")]
        [Authorize]
        public async Task<IActionResult> GetFriendRequestsReceived()
        {
            var userId = await _authService.GetAuthenticatedUserId();
            var result = await _friendsService.GetPendingFriendRequests(userId);
            return Ok(result);
        }
        [HttpPost("ToggleCanMessage")]
[Authorize]
public async Task<IActionResult> ToggleCanMessage([FromBody] int friendId)
{
    var userId = await _authService.GetAuthenticatedUserId();
    var result = await _friendsService.ToggleCanMessage(userId, friendId);
    return Ok(result);
}
    }
}