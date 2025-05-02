using System;
using System.ComponentModel.DataAnnotations;

namespace Memzy_finalist.Models
{
    public partial class Message
    {
        [Key]
        public int MessageId { get; set; }
        
        public int SenderId { get; set; }
        public int ReceiverId { get; set; }
        
        [Required]
        public string Content { get; set; } = null!;
        
        public DateTime SentAt { get; set; } = DateTime.UtcNow;
        public DateTime? ReadAt { get; set; }
        
        [System.ComponentModel.DataAnnotations.Schema.NotMapped]
        public bool IsRead => ReadAt.HasValue;
        
        public virtual User Sender { get; set; } = null!;
        public virtual User Receiver { get; set; } = null!;
    }
}