using Memzy_finalist.Models;
using Microsoft.AspNetCore.Mvc;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authorization;
using Memzy_finalist.Services;

namespace MyApiProject.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class MessagingController : ControllerBase
    {
        private readonly ImessagingService _messagingService;
        private readonly IAuthenticationService _authService;

        public MessagingController(ImessagingService messagingService, IAuthenticationService authService)
        {
            _messagingService = messagingService;
            _authService = authService;
        }

        [HttpPost("SendMessage")]
        [Authorize]
        public async Task<IActionResult> SendMessage([FromBody] MessageDto messageDto)
        {
            try
            {
                var userId = await _authService.GetAuthenticatedUserId();

                if (messageDto == null)
                {
                    return BadRequest("Request body is required");
                }

                if (messageDto.ReceiverId == null || messageDto.Content == null)
                {
                    return BadRequest("Receiver ID and message content are required");
                }

                var result = await _messagingService.SendMessageAsync(userId, messageDto.ReceiverId.Value, messageDto.Content);
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
                return StatusCode(500, new { error = "An error occurred while processing your request", details = ex.Message });
            }
        }

        [HttpGet("GetMessages")]
        [Authorize]
        public async Task<IActionResult> GetMessages(int contactId)
        {
            try
            {
                var userId = await _authService.GetAuthenticatedUserId();
                var messages = await _messagingService.GetMessagesAsync(userId, contactId);
                return Ok(messages);
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
                return StatusCode(500, new { error = "An error occurred while processing your request", details = ex.Message });
            }
        }

        [HttpDelete("DeleteMessage")]
        [Authorize]
        public async Task<IActionResult> DeleteMessage(int messageId)
        {
            try
            {
                var result = await _messagingService.DeleteMessageAsync(messageId);
                if (result)
                    return Ok(new
                    {
                        message = "Message deleted successfully."
                    });
                else
                    return NotFound(new
                    {
                        message = "Message not found."
                    });
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
                return StatusCode(500, new { error = "An error occurred while processing your request", details = ex.Message });
            }
        }
    }
    public class MessageDto
    {
        public int? ReceiverId { get; set; }
        public string Content { get; set; } = null!;
    }
}