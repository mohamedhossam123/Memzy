
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Memzy_finalist.Models;
using Memzy_finalist.Models.Entities;
public class GroupMember
{
    [Key]
    public int Id { get; set; }

    public int GroupId { get; set; }
    public int UserId { get; set; }
    public DateTime JoinedAt { get; set; } = DateTime.UtcNow;
[ForeignKey("GroupId")]
    public virtual Groups Group { get; set; } = null!;
    [ForeignKey("UserId")]
    public virtual User User { get; set; } = null!;
}