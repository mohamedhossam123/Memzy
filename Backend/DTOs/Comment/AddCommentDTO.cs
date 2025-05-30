using System.ComponentModel.DataAnnotations;
public class AddCommentDto
{
    [Required]
    public int PostId { get; set; }

    [Required]
    [StringLength(1000, MinimumLength = 1)]
    public string Content { get; set; }
}