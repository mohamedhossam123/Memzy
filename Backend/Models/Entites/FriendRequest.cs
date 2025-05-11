using System;
using System.ComponentModel.DataAnnotations;

namespace Memzy_finalist.Models
{
    public static class FriendRequestStatus
    {
        public const string Pending = "Pending";
        public const string Accepted = "Accepted";
        public const string Rejected = "Rejected";
    }

    public partial class FriendRequest
    {
        [Key]
        public int RequestId { get; set; }
        
        public int SenderId { get; set; }
        public int ReceiverId { get; set; }
        
        [MaxLength(20)]
        public string Status { get; set; } = FriendRequestStatus.Pending;
        
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public DateTime? RespondedAt { get; set; }
        
        [MaxLength(200)]
        public string Message { get; set; } = string.Empty;

        public virtual User Receiver { get; set; } = null!;
        public virtual User Sender { get; set; } = null!;
    }
}