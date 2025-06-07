using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Memzy_finalist.Models
{
    public class GroupMessage
    {
        [Key]
        public int Id { get; set; }

        public int GroupId { get; set; }
        public int SenderId { get; set; }

        [Required]
        public string Content { get; set; } = null!;
        public DateTime Timestamp { get; set; } = DateTime.UtcNow;
        [ForeignKey("SenderId")]
        public virtual User Sender { get; set; } = null!;
        [ForeignKey("GroupId")]
        public virtual Groups Group { get; set; } = null!;
    }
}
