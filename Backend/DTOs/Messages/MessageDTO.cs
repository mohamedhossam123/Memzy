
using System.ComponentModel.DataAnnotations;
public class MessageDto
{
    [Required(ErrorMessage = "Receiver ID is required")]
    [Range(1, int.MaxValue, ErrorMessage = "Invalid receiver ID")]
    public int ReceiverId { get; set; }

    [Required(ErrorMessage = "Message content is required")]
    [StringLength(1000, MinimumLength = 1,
        ErrorMessage = "Message must be between 1 and 1000 characters")]
    public string Content { get; set; }
}