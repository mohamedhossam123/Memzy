using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;

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

        [HttpGet("GetMessages")]
        [Authorize]
        public async Task<IActionResult> GetMessages(int contactId, int page = 1, int pageSize = 50)
        {
            var userId = await _authService.GetAuthenticatedUserId();
            var messages = await _messagingService.GetMessagesAsync(userId, contactId, page, pageSize);
            return Ok(new { messages });
        }

        [HttpDelete("DeleteMessage")]
        [Authorize]
        public async Task<IActionResult> DeleteMessage([FromQuery] long messageId)
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
                return StatusCode(500, new
                {
                    Error = "Internal server error",
                    Details = ex.Message
                });
            }
        }

        [HttpPost("SendMessage")]
        [Authorize]
        public async Task<IActionResult> SendMessage([FromBody] MessageDto request)
        {
            try
            {
                var senderId = await _authService.GetAuthenticatedUserId();
                var messageId = await _messagingService.SendMessageWithValidationAsync(senderId, request);
                return Ok(new { MessageId = messageId });
            }
            catch (ArgumentException ex)
            {
                return BadRequest(new { Error = ex.Message });
            }
            catch (UnauthorizedAccessException ex)
            {
                return Unauthorized(new { Error = ex.Message });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error sending message");
                return StatusCode(500, new { Error = "Internal server error", Details = ex.Message });
            }
        }
    }
}