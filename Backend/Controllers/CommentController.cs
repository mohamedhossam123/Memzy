using Memzy_finalist.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace MyApiProject.Controllers
{
    [ApiController]
    [Route("api/user/comments")]
    [Authorize]
    public class CommentConrtoller : ControllerBase
    {
        private readonly IAuthenticationService _auth;
        private readonly ICommentService _commentservice;
        private readonly MemzyContext _context;

        public CommentConrtoller(IAuthenticationService authService, ICommentService commentservice, MemzyContext context)
        {
            _auth = authService;
            _commentservice = commentservice;
            _context = context;
        }

        [HttpPost("addComment")]
        public async Task<IActionResult> AddComment([FromBody] AddCommentDto dto)
        {
            var userId = await _auth.GetAuthenticatedUserId();
            var response = await _commentservice.AddComment(dto, userId);
            return Ok(response);
        }
        [HttpDelete("deleteComment")]
        public async Task<IActionResult> DeleteComment([FromBody] DeleteCommentDto dto)
        {
            try
            {
                await _commentservice.DeleteComment(dto);
                return NoContent();
            }
            catch (Exception ex)
            {
                return NotFound(new { message = ex.Message });
            }
        }
        
        [HttpGet("GetCommentCount")]
        public async Task<IActionResult> GetCommentCount(int postId)
        {
            var count = await _context.Comments.CountAsync(c => c.PostId == postId);
            return Ok(count);
        }

        [HttpPost("ToggleLikeComments")]
        public async Task<IActionResult> ToggleCommentLike(LikeCommentDto dto)
        {
            try
            {
                var userId = await _auth.GetAuthenticatedUserId();
                dto.UserId = userId;
                var response = await _commentservice.ToggleCommentLike(dto);
                return Ok(response);
            }
            catch (Exception ex)
            {
                return NotFound(new { message = ex.Message });
            }
        }
        [HttpGet("GetComments")]
        public async Task<IActionResult> GetComments(int postId)
        {
            var user = await _auth.GetAuthenticatedUserId();
            var response = await _commentservice.GetCommentsAsync(postId, user);
            return Ok(response);
        }
    }
}
