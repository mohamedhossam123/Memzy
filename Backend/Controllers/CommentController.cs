using Memzy_finalist.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace MyApiProject.Controllers
{

    [ApiController]
    [Route("api/user/comments")]
    [Authorize]
    public class CommentController : ControllerBase
    {
        private readonly IAuthenticationService _auth;
        private readonly ILogger<CommentController> _logger;
        private readonly ICommentService _commentService;
        private readonly MemzyContext _context;
        public CommentController(
            IAuthenticationService authService,
            ICommentService commentService,
            MemzyContext context,
            ILogger<CommentController> logger
            )
        {
            _auth = authService;
            _commentService = commentService;
            _context = context;
            _logger = logger;
        }

        [HttpPost("addComment")]
public async Task<IActionResult> AddComment([FromBody] AddCommentDto dto)
{
    try
    {
        if (!ModelState.IsValid)
        {
            return BadRequest(ModelState);
        }

        var userId = await _auth.GetAuthenticatedUserId();
        if (userId <= 0)
        {
            return Unauthorized("User not authenticated");
        }

        var response = await _commentService.AddComment(dto, userId);
        return Ok(response);
    }
    catch (Exception ex)
    {
        _logger.LogError(ex, "Error adding comment");
        return StatusCode(500, new { 
            message = "Failed to add comment",
            detailedError = ex.Message,
            stackTrace = ex.StackTrace
        });
    }
}

        [HttpDelete("deleteComment")]
        public async Task<IActionResult> DeleteComment([FromBody] DeleteCommentDto dto)
        {
            try
            {
                await _commentService.DeleteComment(dto);
                return NoContent();
            }
            catch (Exception ex)
            {
                return NotFound(new { message = ex.Message });
            }
        }

        [HttpGet("getCommentCount")]
        public async Task<IActionResult> GetCommentCount(int postId)
        {
            var totalCount = await _context.Comments.CountAsync(c => c.PostId == postId);
            var topLevelCount = await _context.Comments.CountAsync(c => c.PostId == postId && c.ParentCommentId == null);
            var replyCount = await _context.Comments.CountAsync(c => c.PostId == postId && c.ParentCommentId != null);

            return Ok(new
            {
                totalCount = totalCount,
                topLevelComments = topLevelCount,
                replies = replyCount
            });
        }
        [HttpPost("toggleLikeComments")]
        public async Task<IActionResult> ToggleCommentLike(LikeCommentDto dto)
        {
            try
            {
                var userId = await _auth.GetAuthenticatedUserId();
                dto.UserId = userId;
                var response = await _commentService.ToggleCommentLike(dto);
                return Ok(response);
            }
            catch (Exception ex)
            {
                return NotFound(new { message = ex.Message });
            }
        }
        [HttpGet("getComments")]
        public async Task<IActionResult> GetComments(int postId)
        {
            var userId = await _auth.GetAuthenticatedUserId();
            var response = await _commentService.GetCommentsAsync(postId, userId);
            return Ok(response);
        }
    }
}
