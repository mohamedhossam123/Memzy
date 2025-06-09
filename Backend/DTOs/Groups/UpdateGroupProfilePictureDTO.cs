using System.ComponentModel.DataAnnotations;

namespace Memzy_finalist.Models
{
    public class UpdateGroupProfilePictureDTO
{
    [Required]
    public IFormFile ProfilePictureFile { get; set; }
}
}