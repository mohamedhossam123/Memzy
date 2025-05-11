using Memzy_finalist.Models;
using Microsoft.AspNetCore.Mvc;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authorization;
using Memzy_finalist.Services;
using Microsoft.Extensions.Logging;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using Microsoft.EntityFrameworkCore;

namespace MyApiProject.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class MessagingController : ControllerBase
    {
        private readonly IMessagingService _messagingService;
        private readonly IAuthenticationService _authService;
        private readonly ILogger<MessagingController> _logger;
        private readonly IFriendsService _friendsService;

        public MessagingController(
            IMessagingService messagingService,
            IAuthenticationService authService,
            ILogger<MessagingController> logger,
            IFriendsService friendsService)
        {
            _messagingService = messagingService;
            _authService = authService;
            _logger = logger;
            _friendsService = friendsService;
        }

        [HttpPost("SendMessage")]
[Authorize]
public async Task<IActionResult> SendMessage([FromBody] MessageDto messageDto)
{
    try
    {
        var userId = await _authService.GetAuthenticatedUserId();
        
        if (!ModelState.IsValid)
        {
            _logger.LogWarning("Invalid message DTO received");
            return BadRequest(ModelState);
        }

        // Prevent self-messaging
        if (userId == messageDto.ReceiverId)
        {
            _logger.LogWarning($"User {userId} attempted to self-message");
            return BadRequest("Cannot send messages to yourself");
        }

        // Verify friendship - updated to match GetMessages pattern
        var friends = await _friendsService.GetFriends(userId, false);
        var isFriend = friends.Any(f => f.UserId == messageDto.ReceiverId);

        if (!isFriend)
        {
            _logger.LogWarning($"User {userId} attempted to message non-friend {messageDto.ReceiverId}");
            return Forbid("You can only message friends");
        }

        var messageId = await _messagingService.SendMessageAsync(
            userId, 
            messageDto.ReceiverId, 
            messageDto.Content);

        return Ok(new { 
            MessageId = messageId,
            Status = "Message sent successfully"
        });
    }
    catch (ArgumentException ex)
    {
        _logger.LogError(ex, "Argument error in SendMessage");
        return BadRequest(new { Error = ex.Message });
    }
    catch (InvalidOperationException ex)
    {
        _logger.LogWarning(ex, "Invalid operation in SendMessage");
        return BadRequest(new { Error = ex.Message });
    }
    catch (Exception ex)
    {
        _logger.LogError(ex, "Unexpected error in SendMessage");
        return StatusCode(500, new { 
            Error = "Internal server error",
            Details = ex.Message 
        });
    }
}
        [HttpGet("GetMessages")]
[Authorize]
public async Task<IActionResult> GetMessages([FromQuery] int contactId)
{
    try
    {
        var userId = await _authService.GetAuthenticatedUserId();
        var friends = await _friendsService.GetFriends(userId, false);
        var isFriend = friends.Any(f => f.UserId == contactId);

        if (!isFriend)
        {
            _logger.LogWarning($"User {userId} attempted to access messages with non-friend {contactId}");
            return Forbid("You can only view messages with friends");
        }

        var messages = await _messagingService.GetMessagesAsync(userId, contactId);
        return Ok(new {
            Count = messages.Count,
            Messages = messages
        });
    }
    catch (ArgumentException ex)
    {
        _logger.LogError(ex, "Argument error in GetMessages");
        return BadRequest(new { Error = ex.Message });
    }
    catch (Exception ex)
    {
        _logger.LogError(ex, "Unexpected error in GetMessages");
        return StatusCode(500, new { 
            Error = "Internal server error",
            Details = ex.Message 
        });
    }
}

        [HttpDelete("DeleteMessage")]
        [Authorize]
        public async Task<IActionResult> DeleteMessage([FromQuery] int messageId)
        {
            try
            {
                var userId = await _authService.GetAuthenticatedUserId();
                
                // Verify message exists and ownership
                var message = await _messagingService.GetMessageByIdAsync(messageId);
                if (message == null)
                {
                    _logger.LogWarning($"Attempt to delete non-existent message: {messageId}");
                    return NotFound(new { Error = "Message not found" });
                }

                if (message.SenderId != userId && message.ReceiverId != userId)
                {
                    _logger.LogWarning($"User {userId} attempted to delete message {messageId} they don't own");
                    return Forbid("You can only delete your own messages");
                }

                var result = await _messagingService.DeleteMessageAsync(messageId);
                
                return result ? 
                    Ok(new { Status = "Message deleted successfully" }) :
                    StatusCode(500, new { Error = "Failed to delete message" });
            }
            catch (ArgumentException ex)
            {
                _logger.LogError(ex, "Argument error in DeleteMessage");
                return BadRequest(new { Error = ex.Message });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Unexpected error in DeleteMessage");
                return StatusCode(500, new { 
                    Error = "Internal server error",
                    Details = ex.Message 
                });
            }
        }
    }

    public class MessageDto
    {
        [Required(ErrorMessage = "Receiver ID is required")]
        [Range(1, int.MaxValue, ErrorMessage = "Invalid receiver ID")]
        public int ReceiverId { get; set; }

        [Required(ErrorMessage = "Message content is required")]
        [StringLength(1000, MinimumLength = 1, 
            ErrorMessage = "Message must be between 1 and 1000 characters")]
        public string Content { get; set; }
    }
}