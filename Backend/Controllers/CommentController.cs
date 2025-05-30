using Memzy_finalist.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace MyApiProject.Controllers
{
    [ApiController]
    [Route("api/user/comments")]
    [Authorize]
    public class CommentConrtoller : ControllerBase
    {
        private readonly IAuthenticationService _auth;
        private readonly ICommentService _commentservice;

        public CommentConrtoller(IAuthenticationService authService, ICommentService commentservice)
        {
            _auth = authService;
            _commentservice = commentservice;
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
        [HttpPost]
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
    }
}
