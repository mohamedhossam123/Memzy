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
        private readonly ICommentService _commentService;
        private readonly MemzyContext _context;
        public CommentController(
            IAuthenticationService authService,
            ICommentService commentService,
            MemzyContext context)
        {
            _auth = authService;
            _commentService = commentService;
            _context = context;
        }

        [HttpPost("addComment")]
        public async Task<IActionResult> AddComment([FromBody] AddCommentDto dto)
        {
            var userId = await _auth.GetAuthenticatedUserId();
            var response = await _commentService.AddComment(dto, userId);
            return Ok(response);
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
            var count = await _context.Comments.CountAsync(c => c.PostId == postId);
            return Ok(count);
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
