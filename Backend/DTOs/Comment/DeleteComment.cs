
using System.ComponentModel.DataAnnotations;

public class DeleteCommentDto
{
    [Required]
    public int CommentId { get; set; }

    [Required]
    public int UserId { get; set; }
}