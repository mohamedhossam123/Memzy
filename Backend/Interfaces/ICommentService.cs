public interface ICommentService
{
    Task<CommentResponseDto> AddComment(AddCommentDto dto, int userId);
    Task DeleteComment(DeleteCommentDto dto);
    Task<LikeResponseDto> ToggleCommentLike(LikeCommentDto dto);
}
