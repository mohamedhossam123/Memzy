using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using System.ComponentModel.DataAnnotations;

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
            var messageId = await _messagingService.SendMessageAsync(userId, messageDto.ReceiverId, messageDto.Content);
            return Ok(new { MessageId = messageId, Status = "Message sent successfully" });
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
    public async Task<IActionResult> GetMessages(
        [FromQuery] int contactId,
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 50)
    {
        try
        {
            var userId = await _authService.GetAuthenticatedUserId();
            var messages = await _messagingService.GetMessagesAsync(userId, contactId, page, pageSize);
            return Ok(new { Count = messages.Count, Messages = messages });
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
            var result = await _messagingService.DeleteMessageAsync(messageId, userId);
            
            return result ? 
                Ok(new { Status = "Message deleted successfully" }) : 
                NotFound(new { Error = "Message not found" });
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