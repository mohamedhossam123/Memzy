using System.ComponentModel.DataAnnotations;
public class LikeCommentDto
{
    [Required]
    public int CommentId { get; set; }
    
    [Required]
    public int UserId { get; set; }
}