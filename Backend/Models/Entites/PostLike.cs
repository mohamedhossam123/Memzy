
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
namespace Memzy_finalist.Models.Entities;
public class PostLike
{
    [Key, Column(Order = 0)]
    public int PostId { get; set; }

    [Key, Column(Order = 1)]
    public int UserId { get; set; }
    public virtual Post Post { get; set; }
    public virtual User User { get; set; }
}
