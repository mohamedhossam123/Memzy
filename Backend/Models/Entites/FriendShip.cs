using System;
using System.ComponentModel.DataAnnotations;

namespace Memzy_finalist.Models
{
    public partial class Friendship
    {
        [Key]
        public int FriendshipId { get; set; }
        
        public int User1Id { get; set; }
        public int User2Id { get; set; }
        public bool Favorite { get; set; } = false;
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public DateTime? LastInteractionAt { get; set; }

        public virtual User User1 { get; set; } = null!;
        public virtual User User2 { get; set; } = null!;
    }
}